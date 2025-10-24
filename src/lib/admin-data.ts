import { adminDb } from '@/lib/firebase/admin';
import { ContactMessage, ContactStatus } from '@/types/contact';
import { EvaluationRequest, EvaluationStatus } from '@/types/evaluation';
import { Timestamp } from 'firebase-admin/firestore';

// Contact Messages Functions
export async function getContactMessages(limit?: number, status?: ContactStatus): Promise<ContactMessage[]> {
  try {
    let query = adminDb.collection('contact_messages');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    query = query.orderBy('createdAt', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        readAt: data.readAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as ContactMessage;
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

export async function getContactStats() {
  try {
    const snapshot = await adminDb.collection('contact_messages').get();
    const messages = snapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      in_progress: messages.filter(m => m.status === 'in_progress').length,
      replied: messages.filter(m => m.status === 'replied').length,
      completed: messages.filter(m => m.status === 'completed').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return {
      total: 0,
      new: 0,
      in_progress: 0,
      replied: 0,
      completed: 0,
    };
  }
}

// Evaluation Requests Functions
export async function getEvaluationRequests(limit?: number, status?: EvaluationStatus): Promise<EvaluationRequest[]> {
  try {
    let query = adminDb.collection('evaluation_requests');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    query = query.orderBy('createdAt', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        processedAt: data.processedAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as EvaluationRequest;
    });
  } catch (error) {
    console.error('Error fetching evaluation requests:', error);
    return [];
  }
}

export async function getEvaluationStats() {
  try {
    const snapshot = await adminDb.collection('evaluation_requests').get();
    const requests = snapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: requests.length,
      new: requests.filter(r => r.status === 'new').length,
      scheduled: requests.filter(r => r.status === 'scheduled').length,
      completed: requests.filter(r => r.status === 'completed').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    return {
      total: 0,
      new: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
  }
}

// Get single contact message
export async function getContactMessage(id: string): Promise<ContactMessage | null> {
  try {
    const doc = await adminDb.collection('contact_messages').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      readAt: data.readAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as ContactMessage;
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return null;
  }
}

// Get single evaluation request
export async function getEvaluationRequest(id: string): Promise<EvaluationRequest | null> {
  try {
    const doc = await adminDb.collection('evaluation_requests').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      processedAt: data.processedAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as EvaluationRequest;
  } catch (error) {
    console.error('Error fetching evaluation request:', error);
    return null;
  }
}

