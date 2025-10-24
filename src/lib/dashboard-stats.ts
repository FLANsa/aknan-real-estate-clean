import { adminDb } from '@/lib/firebase/admin';

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
    
    const newPropertiesSnapshot = await adminDb.collection('properties')
      .where('createdAt', '>=', startOfMonth)
      .get();
    const newPropertiesThisMonth = newPropertiesSnapshot.size;

    // Get total projects
    const projectsSnapshot = await adminDb.collection('projects').get();
    const totalProjects = projectsSnapshot.size;

    // Get total plots
    const plotsSnapshot = await adminDb.collection('plots').get();
    const totalPlots = plotsSnapshot.size;

    // Get properties by status
    const availableSnapshot = await adminDb.collection('properties')
      .where('status', '==', 'available')
      .get();
    const availableProperties = availableSnapshot.size;

    const soldSnapshot = await adminDb.collection('properties')
      .where('status', '==', 'sold')
      .get();
    const soldProperties = soldSnapshot.size;

    const rentedSnapshot = await adminDb.collection('properties')
      .where('status', '==', 'rented')
      .get();
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
    const snapshot = await adminDb.collection('properties')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    
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
    const snapshot = await adminDb.collection('projects')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    
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
