import { adminAuth } from './admin';
import { cookies } from 'next/headers';

export interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
    };
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;

  const adminUids = process.env.ADMIN_UIDS?.split(',').map(uid => uid.trim()) || [];
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

  return adminUids.includes(user.uid) || adminEmails.includes(user.email || '');
}

export async function requireAdmin(): Promise<User> {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Unauthorized: No user found');
  }
  
  if (!isAdmin(user)) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}
