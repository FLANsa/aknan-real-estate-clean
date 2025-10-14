'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { projectSchema } from '@/lib/schemas/map';
import { Project, ProjectFormData } from '@/types/map';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createProject(data: ProjectFormData): Promise<ActionResult<Project>> {
  try {
    // Verify admin access
    const user = await requireAdmin();
    
    // Validate form data
    const validatedData = projectSchema.parse(data);
    
    // Create project document
    const projectData = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };
    
    const docRef = await adminDb.collection('projects').add(projectData);
    
    // Get the created project
    const doc = await docRef.get();
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
    
    // Revalidate relevant pages
    revalidatePath('/admin/projects');
    revalidatePath('/admin');
    
    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء المشروع',
    };
  }
}

export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<ActionResult<Project>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    // Validate form data if provided
    if (Object.keys(data).length > 0) {
      projectSchema.partial().parse(data);
    }
    
    // Update project document
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await adminDb.collection('projects').doc(id).update(updateData);
    
    // Get the updated project
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
    
    // Revalidate relevant pages
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath(`/projects/${id}`);
    
    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المشروع',
    };
  }
}

export async function deleteProject(id: string): Promise<ActionResult<void>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    // Check if project has plots
    const plotsSnapshot = await adminDb
      .collection('plots')
      .where('projectId', '==', id)
      .get();
    
    if (!plotsSnapshot.empty) {
      return {
        success: false,
        error: 'لا يمكن حذف المشروع لأنه يحتوي على قطع. احذف القطع أولاً.',
      };
    }
    
    // Delete project
    await adminDb.collection('projects').doc(id).delete();
    
    // Revalidate relevant pages
    revalidatePath('/admin/projects');
    revalidatePath('/admin');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المشروع',
    };
  }
}

export async function getProject(id: string): Promise<ActionResult<Project>> {
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
    console.error('Error getting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب المشروع',
    };
  }
}

export async function listProjects(): Promise<ActionResult<Project[]>> {
  try {
    const snapshot = await adminDb.collection('projects').orderBy('createdAt', 'desc').get();
    
    const projects: Project[] = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        location: data.location,
        zoom: data.zoom,
        description: data.description,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      };
    });
    
    return {
      success: true,
      data: projects,
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب قائمة المشاريع',
    };
  }
}
