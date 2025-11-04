import { NextRequest, NextResponse } from 'next/server';
import { db, requireAdminUser } from '@/lib/server';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const body = await req.json();
    const { text, bounds } = body;
    
    let query = db.collection('properties');
    
    if (text) {
      // Search by title (Arabic or English)
      query = query.where('titleAr', '>=', text).where('titleAr', '<=', text + '\uf8ff');
    }
    
    const snap = await query.limit(50).get();
    const items = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}






