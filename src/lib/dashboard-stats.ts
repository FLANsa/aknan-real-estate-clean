import { adminDb } from '@/lib/firebase/admin';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase-admin/firestore';

export interface DashboardStats {
  totalProperties: number;
  newPropertiesThisMonth: number;
  totalProjects: number;
  totalPlots: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  lastUpdated: Date;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total properties
    const propertiesSnapshot = await adminDb.collection('properties').get();
    const totalProperties = propertiesSnapshot.size;

    // Get new properties this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newPropertiesQuery = query(
      adminDb.collection('properties'),
      where('createdAt', '>=', startOfMonth)
    );
    const newPropertiesSnapshot = await getDocs(newPropertiesQuery);
    const newPropertiesThisMonth = newPropertiesSnapshot.size;

    // Get total projects
    const projectsSnapshot = await adminDb.collection('projects').get();
    const totalProjects = projectsSnapshot.size;

    // Get total plots
    const plotsSnapshot = await adminDb.collection('plots').get();
    const totalPlots = plotsSnapshot.size;

    // Get properties by status
    const availableQuery = query(
      adminDb.collection('properties'),
      where('status', '==', 'available')
    );
    const availableSnapshot = await getDocs(availableQuery);
    const availableProperties = availableSnapshot.size;

    const soldQuery = query(
      adminDb.collection('properties'),
      where('status', '==', 'sold')
    );
    const soldSnapshot = await getDocs(soldQuery);
    const soldProperties = soldSnapshot.size;

    const rentedQuery = query(
      adminDb.collection('properties'),
      where('status', '==', 'rented')
    );
    const rentedSnapshot = await getDocs(rentedQuery);
    const rentedProperties = rentedSnapshot.size;

    return {
      totalProperties,
      newPropertiesThisMonth,
      totalProjects,
      totalPlots,
      availableProperties,
      soldProperties,
      rentedProperties,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values in case of error
    return {
      totalProperties: 0,
      newPropertiesThisMonth: 0,
      totalProjects: 0,
      totalPlots: 0,
      availableProperties: 0,
      soldProperties: 0,
      rentedProperties: 0,
      lastUpdated: new Date(),
    };
  }
}

export async function getRecentProperties(limitCount: number = 5) {
  try {
    const recentQuery = query(
      adminDb.collection('properties'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(recentQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching recent properties:', error);
    return [];
  }
}

export async function getRecentProjects(limitCount: number = 5) {
  try {
    const recentQuery = query(
      adminDb.collection('projects'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(recentQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return [];
  }
}
