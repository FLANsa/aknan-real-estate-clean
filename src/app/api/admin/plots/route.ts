import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Plot } from '@/types/map';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId');
    
    let query = adminDb.collection('plots');
    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }
    
    const snapshot = await query.get();
    const plots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Plot[];

    return NextResponse.json({ plots });
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const plotData = {
      projectId: body.projectId,
      plotNumber: body.plotNumber,
      polygon: body.polygon,
      manualArea: body.manualArea,
      price: body.price,
      images: body.images || [],
      status: body.status || 'available',
      notes: body.notes || null,
      linkedPropertyIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('plots').add(plotData);
    
    // Update project plots count
    const projectRef = adminDb.collection('projects').doc(body.projectId);
    const projectDoc = await projectRef.get();
    if (projectDoc.exists) {
      const currentData = projectDoc.data();
      await projectRef.update({
        plotsCount: (currentData?.plotsCount || 0) + 1,
        availablePlotsCount: body.status === 'available' 
          ? (currentData?.availablePlotsCount || 0) + 1 
          : (currentData?.availablePlotsCount || 0),
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ 
      id: docRef.id,
      message: 'تم إنشاء القطعة بنجاح'
    });
  } catch (error) {
    console.error('Error creating plot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
