'use server';

import { adminDb } from '@/lib/firebase/admin';
import { EvaluationRequest } from '@/types/evaluation';
import { Timestamp } from 'firebase-admin/firestore';
import { uploadImageToStorage } from '@/lib/firebase/storage';

export async function saveEvaluationRequest(data: Omit<EvaluationRequest, 'id' | 'createdAt' | 'status'>) {
  try {
    // Upload images to Firebase Storage if any
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      // Generate a unique ID for this request
      const tempId = Date.now().toString();
      
      for (let i = 0; i < data.images.length; i++) {
        const imageData = data.images[i];
        if (imageData.startsWith('data:')) {
          // Handle base64 images
          const imageUrl = await uploadImageToStorage(
            imageData,
            `evaluations/${tempId}/image_${i}.jpg`
          );
          imageUrls.push(imageUrl);
        } else {
          // Handle direct URLs
          imageUrls.push(imageData);
        }
      }
    }

    const evaluationData = {
      ...data,
      images: imageUrls,
      status: 'new' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await adminDb.collection('evaluation_requests').add(evaluationData);
    
    return {
      success: true,
      id: docRef.id,
      message: 'تم إرسال طلب التقييم بنجاح',
    };
  } catch (error) {
    console.error('Error saving evaluation request:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إرسال طلب التقييم. يرجى المحاولة مرة أخرى.',
    };
  }
}

export async function updateEvaluationStatus(id: string, status: EvaluationRequest['status']) {
  try {
    await adminDb.collection('evaluation_requests').doc(id).update({
      status,
      updatedAt: Timestamp.now(),
      ...(status === 'completed' && { processedAt: Timestamp.now() }),
    });

    return {
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
    };
  } catch (error) {
    console.error('Error updating evaluation status:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تحديث الحالة',
    };
  }
}





