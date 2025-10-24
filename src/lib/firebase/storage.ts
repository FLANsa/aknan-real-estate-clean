import { storage } from './client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('propertyId', propertyId);

  // Try Firebase Storage first (preferred for production)
  try {
    console.log('🔄 Trying Firebase Storage upload...');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Firebase Storage upload successful:', data.url);
      return data.url as string;
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.warn('❌ Firebase Storage upload failed:', errorData);
      throw new Error(`Firebase Storage failed: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.warn('❌ Firebase Storage upload error:', error);
    
    // Fallback to local upload only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Trying local upload as fallback (development only)...');
      const res = await fetch('/api/upload-local', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('❌ Local upload failed:', err);
        throw new Error(err?.error || 'All upload methods failed');
      }
      const data = await res.json();
      console.log('✅ Local upload successful:', data.url);
      return data.url as string;
    } else {
      // In production, don't fallback to local upload
      throw new Error('Firebase Storage upload failed and local upload is not available in production');
    }
  }
}

export async function deletePropertyImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error to prevent breaking the flow
  }
}

export async function deletePropertyImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(url => deletePropertyImage(url));
  await Promise.allSettled(deletePromises);
}

/**
 * Upload image from base64 data to Firebase Storage
 * Used for evaluation requests and other base64 image uploads
 */
export async function uploadImageToStorage(base64Data: string, storagePath: string): Promise<string> {
  try {
    // Remove data URL prefix if exists
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Create File object from blob
    const file = new File([blob], storagePath.split('/').pop() || 'image.jpg', { type: 'image/jpeg' });
    
    // Use the existing uploadPropertyImage function with a temporary ID
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', storagePath.split('/')[0] || 'temp');
    formData.append('storagePath', storagePath);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Upload failed: ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await res.json();
    return data.url as string;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
}

