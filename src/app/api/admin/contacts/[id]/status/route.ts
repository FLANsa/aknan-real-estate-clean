import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ContactStatus } from '@/types/contact';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    // Validate status
    const validStatuses: ContactStatus[] = ['new', 'in_progress', 'replied', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update the contact message status
    await adminDb.collection('contact_messages').doc(params.id).update({
      status,
      readAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}





