import { storage } from './client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('propertyId', propertyId);

  // Use local upload as fallback
  const res = await fetch('/api/upload-local', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Upload failed');
  }
  const data = await res.json();
  return data.url as string;
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


