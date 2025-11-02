import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Plot } from '@/types/map';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plotId = params.id;
    
    const plotDoc = await adminDb.collection('plots').doc(plotId).get();
    if (!plotDoc.exists) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }
    
    const plot = {
      id: plotDoc.id,
      ...plotDoc.data(),
      createdAt: plotDoc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: plotDoc.data()?.updatedAt?.toDate() || new Date(),
    } as Plot;

    return NextResponse.json({ plot });
  } catch (error) {
    console.error('Error fetching plot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plotId = params.id;
    const body = await req.json();
    
    // Get current plot data to check status change
    const currentPlotDoc = await adminDb.collection('plots').doc(plotId).get();
    if (!currentPlotDoc.exists) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }
    
    const currentPlot = currentPlotDoc.data();
    const oldStatus = currentPlot?.status;
    const newStatus = body.status;
    
    const updateData = {
      plotNumber: body.plotNumber,
      polygon: body.polygon,
      manualArea: body.manualArea,
      price: body.price,
      images: body.images || [],
      status: newStatus,
      notes: body.notes || null,
      updatedAt: new Date(),
    };

    await adminDb.collection('plots').doc(plotId).update(updateData);
    
    // Update project counts if status changed
    if (oldStatus !== newStatus) {
      const projectRef = adminDb.collection('projects').doc(currentPlot.projectId);
      const projectDoc = await projectRef.get();
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        let availableCount = projectData?.availablePlotsCount || 0;
        
        if (oldStatus === 'available' && newStatus !== 'available') {
          availableCount = Math.max(0, availableCount - 1);
        } else if (oldStatus !== 'available' && newStatus === 'available') {
          availableCount = availableCount + 1;
        }
        
        await projectRef.update({
          availablePlotsCount: availableCount,
          updatedAt: new Date(),
        });
      }
    }
    
    return NextResponse.json({ 
      message: 'تم تحديث القطعة بنجاح'
    });
  } catch (error) {
    console.error('Error updating plot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plotId = params.id;
    
    // Get plot data to update project counts
    const plotDoc = await adminDb.collection('plots').doc(plotId).get();
    if (!plotDoc.exists) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }
    
    const plotData = plotDoc.data();
    
    // Delete the plot
    await adminDb.collection('plots').doc(plotId).delete();
    
    // Update project counts
    const projectRef = adminDb.collection('projects').doc(plotData?.projectId);
    const projectDoc = await projectRef.get();
    if (projectDoc.exists) {
      const projectData = projectDoc.data();
      await projectRef.update({
        plotsCount: Math.max(0, (projectData?.plotsCount || 0) - 1),
        availablePlotsCount: plotData?.status === 'available' 
          ? Math.max(0, (projectData?.availablePlotsCount || 0) - 1)
          : (projectData?.availablePlotsCount || 0),
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ 
      message: 'تم حذف القطعة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting plot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
