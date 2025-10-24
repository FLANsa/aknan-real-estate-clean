import { NextRequest, NextResponse } from 'next/server';
import { db, requireAdminUser } from '@/lib/server';
import * as turf from '@turf/turf';

export async function GET(req: NextRequest) {
  try {
    // For now, allow without auth for testing
    // await requireAdminUser(req);
    const id = req.nextUrl.searchParams.get('id');
    
    if (id) {
      const doc = await db.collection('parcels').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
      }
      return NextResponse.json({ parcel: { id: doc.id, ...doc.data() } });
    }
    
    const snap = await db.collection('parcels').limit(200).get();
    const items = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser(req);
    const body = await req.json();

    const data:any = {
      name: body.name ?? null,
      projectId: body.projectId ?? null,
      status: body.status ?? 'available',
      notes: body.notes ?? null,
      useManualMetrics: !!body.useManualMetrics,
      manualAreaSqm: body.useManualMetrics ? (Number(body.manualAreaSqm)||null) : null,
      manualPerimeterM: body.useManualMetrics ? (Number(body.manualPerimeterM)||null) : null,
      dimensions: body.dimensions ?? { shape:'custom' },
      geometry: body.geometry ?? null,
      linkedPropertyIds: body.linkedPropertyIds ?? [],
      createdBy: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // optional compute for comparison
    if (data.geometry?.type==='Polygon') {
      try {
        const coords = data.geometry.coordinates[0];
        data.computedAreaSqm = Math.round(turf.area(turf.polygon([coords])));
        const ring = coords[0]===coords[coords.length-1] ? coords : [...coords, coords[0]];
        data.computedPerimeterM = Math.round(turf.length(turf.lineString(ring), {units:'kilometers'})*1000);
      } catch { 
        data.computedAreaSqm = null; 
        data.computedPerimeterM = null; 
      }
    }

    if (data.useManualMetrics && data.manualAreaSqm && data.computedAreaSqm) {
      const diff = (data.manualAreaSqm - data.computedAreaSqm)/(data.computedAreaSqm||1)*100;
      data.metricsDelta = { areaDiffPct:+diff.toFixed(2) };
    }

    const doc = await db.collection('parcels').add(data);
    return NextResponse.json({ id: doc.id });
  } catch (error) {
    console.error('Error creating parcel:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
