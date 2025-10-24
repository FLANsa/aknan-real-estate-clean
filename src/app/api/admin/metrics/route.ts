import { NextRequest, NextResponse } from 'next/server';
import { db, requireAdminUser } from '@/lib/server';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    
    const snap = await db.collection('parcels').get();
    const parcels = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    
    // Count by status
    const counts = {
      available: 0,
      reserved: 0,
      sold: 0,
    };
    
    let totalArea = 0;
    let areaCount = 0;
    
    parcels.forEach((parcel: any) => {
      counts[parcel.status] = (counts[parcel.status] || 0) + 1;
      
      // Use manual area first, then computed
      const area = parcel.useManualMetrics && parcel.manualAreaSqm 
        ? parcel.manualAreaSqm 
        : parcel.computedAreaSqm;
        
      if (area) {
        totalArea += area;
        areaCount++;
      }
    });
    
    const avgArea = areaCount > 0 ? totalArea / areaCount : 0;
    
    return NextResponse.json({
      counts,
      totalArea: Math.round(totalArea),
      avgArea: Math.round(avgArea),
      totalCount: parcels.length,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

