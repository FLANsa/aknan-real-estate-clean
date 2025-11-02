import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Project } from '@/types/map';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('projects').get();
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Project[];

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const projectData = {
      name: body.name,
      description: body.description || null,
      location: body.location,
      zoom: body.zoom || 15,
      boundary: body.boundary || null,
      plotsCount: 0,
      availablePlotsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('projects').add(projectData);
    
    return NextResponse.json({ 
      id: docRef.id,
      message: 'تم إنشاء المشروع بنجاح'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}