import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Property } from '@/types/property';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    let query = adminDb.collection('properties');
    
    // Apply project filter if provided
    if (projectId && projectId !== 'all') {
      query = query.where('projectId', '==', projectId);
    }
    
    const snapshot = await query.get();
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Property[];

    return NextResponse.json({ 
      properties,
      total: properties.length 
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
