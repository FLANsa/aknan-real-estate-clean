'use server';

import { adminDb } from '@/lib/firebase/admin';
import { Project, Plot } from '@/types/map';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getPublicProject(id: string): Promise<ActionResult<Project>> {
  try {
    const doc = await adminDb.collection('projects').doc(id).get();
    
    if (!doc.exists) {
      return {
        success: false,
        error: 'المشروع غير موجود',
      };
    }
    
    const docData = doc.data()!;
    const project: Project = {
      id: doc.id,
      name: docData.name,
      location: docData.location,
      zoom: docData.zoom,
      description: docData.description,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
      createdBy: docData.createdBy,
    };
    
    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error('Error getting public project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب المشروع',
    };
  }
}

export async function getPublicProjectPlots(projectId: string): Promise<ActionResult<Plot[]>> {
  try {
    const snapshot = await adminDb
      .collection('plots')
      .where('projectId', '==', projectId)
      .get();
    
    const plots: Plot[] = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        number: data.number,
        status: data.status,
        price: data.price,
        currency: data.currency,
        polygon: data.polygon,
        dimensions: data.dimensions,
        notes: data.notes,
        propertyId: data.propertyId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    
    return {
      success: true,
      data: plots,
    };
  } catch (error) {
    console.error('Error getting public project plots:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب قطع المشروع',
    };
  }
}
