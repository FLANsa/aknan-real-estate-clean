import { NextRequest, NextResponse } from 'next/server';
import { db, requireAdminUser } from '@/lib/server';
import * as turf from '@turf/turf';

export async function PATCH(req: NextRequest, { params }:{ params:{ id:string }}) {
  try {
    await requireAdminUser(req);
    const body = await req.json();
    
    const update:any = {
      name: body.name ?? null,
      projectId: body.projectId ?? null,
      status: body.status,
      notes: body.notes ?? null,
      useManualMetrics: !!body.useManualMetrics,
      manualAreaSqm: body.useManualMetrics ? (Number(body.manualAreaSqm)||null) : null,
      manualPerimeterM: body.useManualMetrics ? (Number(body.manualPerimeterM)||null) : null,
      dimensions: body.dimensions ?? null,
      geometry: body.geometry ?? null,
      linkedPropertyIds: body.linkedPropertyIds ?? [],
      updatedAt: Date.now(),
    };

    if (update.geometry?.type==='Polygon') {
      try {
        const coords = update.geometry.coordinates[0];
        update.computedAreaSqm = Math.round(turf.area(turf.polygon([coords])));
        const ring = coords[0]===coords[coords.length-1] ? coords : [...coords, coords[0]];
        update.computedPerimeterM = Math.round(turf.length(turf.lineString(ring), {units:'kilometers'})*1000);
        
        if (update.useManualMetrics && update.manualAreaSqm) {
          const diffA = (update.manualAreaSqm - update.computedAreaSqm)/(update.computedAreaSqm||1)*100;
          update.metricsDelta = { ...(update.metricsDelta||{}), areaDiffPct:+diffA.toFixed(2) };
        }
        if (update.useManualMetrics && update.manualPerimeterM) {
          const diffP = (update.manualPerimeterM - update.computedPerimeterM)/(update.computedPerimeterM||1)*100;
          update.metricsDelta = { ...(update.metricsDelta||{}), perimeterDiffPct:+diffP.toFixed(2) };
        }
      } catch { 
        update.computedAreaSqm=null; 
        update.computedPerimeterM=null; 
        update.metricsDelta=null; 
      }
    } else {
      update.computedAreaSqm=null; 
      update.computedPerimeterM=null; 
      update.metricsDelta=null;
    }

    await db.collection('parcels').doc(params.id).update(update);
    return NextResponse.json({ ok:true });
  } catch (error) {
    console.error('Error updating parcel:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(_: NextRequest, { params }:{ params:{ id:string }}) {
  try {
    await requireAdminUser(_);
    await db.collection('parcels').doc(params.id).delete();
    return NextResponse.json({ ok:true });
  } catch (error) {
    console.error('Error deleting parcel:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

