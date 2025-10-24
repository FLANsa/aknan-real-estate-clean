import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { EvaluationStatus } from '@/types/evaluation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    // Validate status
    const validStatuses: EvaluationStatus[] = ['new', 'scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update the evaluation request status
    await adminDb.collection('evaluation_requests').doc(params.id).update({
      status,
      processedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating evaluation status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

