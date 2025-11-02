'use server';

import { adminDb } from '@/lib/firebase/admin';
import { ContactMessage } from '@/types/contact';
import { Timestamp } from 'firebase-admin/firestore';

export async function saveContactMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
  try {
    const contactData = {
      ...data,
      status: 'new' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await adminDb.collection('contact_messages').add(contactData);
    
    return {
      success: true,
      id: docRef.id,
      message: 'تم إرسال رسالتك بنجاح',
    };
  } catch (error) {
    console.error('Error saving contact message:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    };
  }
}

export async function updateContactStatus(id: string, status: ContactMessage['status']) {
  try {
    await adminDb.collection('contact_messages').doc(id).update({
      status,
      updatedAt: Timestamp.now(),
      ...(status === 'replied' && { readAt: Timestamp.now() }),
    });

    return {
      success: true,
      message: 'تم تحديث حالة الرسالة بنجاح',
    };
  } catch (error) {
    console.error('Error updating contact status:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تحديث الحالة',
    };
  }
}





