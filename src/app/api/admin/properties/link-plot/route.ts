import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plotId, propertyId } = body;
    
    if (!plotId || !propertyId) {
      return NextResponse.json({ error: 'Missing plotId or propertyId' }, { status: 400 });
    }
    
    // Get plot data
    const plotDoc = await adminDb.collection('plots').doc(plotId).get();
    if (!plotDoc.exists) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }
    
    const plotData = plotDoc.data();
    
    // Get property data
    const propertyDoc = await adminDb.collection('properties').doc(propertyId).get();
    if (!propertyDoc.exists) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    const propertyData = propertyDoc.data();
    
    // Update plot with linked property
    await adminDb.collection('plots').doc(plotId).update({
      linkedPropertyIds: [...(plotData?.linkedPropertyIds || []), propertyId],
      updatedAt: new Date(),
    });
    
    // Update property with plot info
    await adminDb.collection('properties').doc(propertyId).update({
      plotId: plotId,
      projectId: plotData?.projectId,
      plotNumber: plotData?.plotNumber,
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ 
      message: 'تم ربط العقار بالقطعة بنجاح'
    });
  } catch (error) {
    console.error('Error linking property to plot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
