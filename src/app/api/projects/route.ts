import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Project } from '@/types/map';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('id');
    
    if (projectId) {
      // Get single project
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

      return NextResponse.json({ project });
    } else {
      // Get all projects
      const snapshot = await adminDb.collection('projects').get();
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Project[];

      return NextResponse.json({ projects });
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
