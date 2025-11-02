import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';

export const db = adminDb;

export async function requireAdminUser(req: NextRequest) {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Unauthorized: No user found');
  }
  
  // Check if user has admin or manager role
  const userDoc = await db.collection('users').doc(user.uid).get();
  const userData = userDoc.data();
  
  if (!userData || !['admin', 'manager'].includes(userData.role)) {
    throw new Error('Unauthorized: Admin or manager role required');
  }
  
  return user;
}





