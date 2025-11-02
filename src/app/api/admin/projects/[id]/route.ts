import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Project, Plot } from '@/types/map';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    
    // Get project details
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const project = {
      id: projectDoc.id,
      ...projectDoc.data(),
      createdAt: projectDoc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: projectDoc.data()?.updatedAt?.toDate() || new Date(),
    } as Project;

    // Get plots for this project
    const plotsSnapshot = await adminDb.collection('plots')
      .where('projectId', '==', projectId)
      .get();
    
    const plots = plotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Plot[];

    return NextResponse.json({ 
      project,
      plots 
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const body = await req.json();
    
    const updateData = {
      name: body.name,
      description: body.description || null,
      location: body.location,
      zoom: body.zoom,
      boundary: body.boundary || null,
      updatedAt: new Date(),
    };

    await adminDb.collection('projects').doc(projectId).update(updateData);
    
    return NextResponse.json({ 
      message: 'تم تحديث المشروع بنجاح'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    
    // Delete all plots in this project first
    const plotsSnapshot = await adminDb.collection('plots')
      .where('projectId', '==', projectId)
      .get();
    
    const batch = adminDb.batch();
    plotsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the project
    batch.delete(adminDb.collection('projects').doc(projectId));
    
    await batch.commit();
    
    return NextResponse.json({ 
      message: 'تم حذف المشروع وجميع قطعه بنجاح'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
