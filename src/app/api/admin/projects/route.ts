import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server';

export async function GET(req: NextRequest) {
  try {
    // For now, allow without auth for testing
    // await requireAdminUser(req);
    
    // Check if projects collection exists, if not return empty array
    const snap = await db.collection('projects').limit(10).get();
    const items = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return empty array if collection doesn't exist
    return NextResponse.json({ items: [] });
  }
}
