'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { plotSchema, PlotFormData, plotLinkingSchema } from '@/lib/schemas/map';
import { Plot } from '@/types/map';
import { calculateArea, calculatePerimeter } from '@/lib/google-maps';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPlot(data: PlotFormData): Promise<ActionResult<Plot>> {
  try {
    // Verify admin access
    const user = await requireAdmin();
    
    // Validate form data
    const validatedData = plotSchema.parse(data);
    
    // Calculate dimensions
    const dimensions = {
      area: calculateArea(validatedData.polygon),
      perimeter: calculatePerimeter(validatedData.polygon),
    };
    
    // Create plot document
    const plotData = {
      ...validatedData,
      dimensions,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    const docRef = await adminDb.collection('plots').add(plotData);
    
    // Get the created plot
    const doc = await docRef.get();
    const docData = doc.data()!;
    const plot: Plot = {
      id: doc.id,
      projectId: docData.projectId,
      number: docData.number,
      status: docData.status,
      price: docData.price,
      currency: docData.currency,
      polygon: docData.polygon,
      dimensions: docData.dimensions,
      notes: docData.notes,
      propertyId: docData.propertyId,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
    };
    
    // Revalidate relevant pages
    revalidatePath(`/admin/projects/${data.projectId}`);
    revalidatePath(`/projects/${data.projectId}`);
    
    return {
      success: true,
      data: plot,
    };
  } catch (error) {
    console.error('Error creating plot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء القطعة',
    };
  }
}

export async function updatePlot(id: string, data: Partial<PlotFormData>): Promise<ActionResult<Plot>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    // Get existing plot to preserve unchanged fields
    const existingDoc = await adminDb.collection('plots').doc(id).get();
    if (!existingDoc.exists) {
      return {
        success: false,
        error: 'القطعة غير موجودة',
      };
    }
    
    const existingData = existingDoc.data()!;
    
    // Validate form data if provided
    if (Object.keys(data).length > 0) {
      plotSchema.partial().parse(data);
    }
    
    // Calculate dimensions if polygon is being updated
    let dimensions = existingData.dimensions;
    if (data.polygon) {
      dimensions = {
        area: calculateArea(data.polygon),
        perimeter: calculatePerimeter(data.polygon),
      };
    }
    
    // Update plot document
    const updateData = {
      ...data,
      dimensions,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await adminDb.collection('plots').doc(id).update(updateData);
    
    // Get the updated plot
    const doc = await adminDb.collection('plots').doc(id).get();
    const docData = doc.data()!;
    const plot: Plot = {
      id: doc.id,
      projectId: docData.projectId,
      number: docData.number,
      status: docData.status,
      price: docData.price,
      currency: docData.currency,
      polygon: docData.polygon,
      dimensions: docData.dimensions,
      notes: docData.notes,
      propertyId: docData.propertyId,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
    };
    
    // Revalidate relevant pages
    revalidatePath(`/admin/projects/${plot.projectId}`);
    revalidatePath(`/projects/${plot.projectId}`);
    
    return {
      success: true,
      data: plot,
    };
  } catch (error) {
    console.error('Error updating plot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث القطعة',
    };
  }
}

export async function deletePlot(id: string): Promise<ActionResult<void>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    // Get plot to find projectId for revalidation
    const plotDoc = await adminDb.collection('plots').doc(id).get();
    if (!plotDoc.exists) {
      return {
        success: false,
        error: 'القطعة غير موجودة',
      };
    }
    
    const plotData = plotDoc.data()!;
    const projectId = plotData.projectId;
    
    // Check if plot is linked to a property
    if (plotData.propertyId) {
      // Remove plotId from property
      await adminDb.collection('properties').doc(plotData.propertyId).update({
        plotId: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    
    // Delete plot
    await adminDb.collection('plots').doc(id).delete();
    
    // Revalidate relevant pages
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting plot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف القطعة',
    };
  }
}

export async function linkPlotToProperty(plotId: string, propertyId: string | null): Promise<ActionResult<void>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    // Validate input
    plotLinkingSchema.parse({ plotId, propertyId });
    
    // Use transaction for atomic bidirectional update
    await adminDb.runTransaction(async (transaction) => {
      // Get plot document
      const plotRef = adminDb.collection('plots').doc(plotId);
      const plotDoc = await transaction.get(plotRef);
      
      if (!plotDoc.exists) {
        throw new Error('القطعة غير موجودة');
      }
      
      const plotData = plotDoc.data()!;
      const oldPropertyId = plotData.propertyId;
      
      // Update plot with new propertyId
      transaction.update(plotRef, {
        propertyId: propertyId || FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      // Remove old link from previous property
      if (oldPropertyId) {
        const oldPropertyRef = adminDb.collection('properties').doc(oldPropertyId);
        transaction.update(oldPropertyRef, {
          plotId: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      
      // Add new link to new property
      if (propertyId) {
        const newPropertyRef = adminDb.collection('properties').doc(propertyId);
        const newPropertyDoc = await transaction.get(newPropertyRef);
        
        if (!newPropertyDoc.exists) {
          throw new Error('العقار غير موجود');
        }
        
        transaction.update(newPropertyRef, {
          plotId: plotId,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
    
    // Revalidate relevant pages
    revalidatePath(`/admin/projects`);
    revalidatePath(`/admin/properties`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error linking plot to property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء ربط القطعة بالعقار',
    };
  }
}

export async function getProjectPlots(projectId: string): Promise<ActionResult<Plot[]>> {
  try {
    const snapshot = await adminDb
      .collection('plots')
      .where('projectId', '==', projectId)
      .get();
    
    const plots: Plot[] = snapshot.docs.map(doc => {
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
    }).sort((a, b) => a.number.localeCompare(b.number));
    
    return {
      success: true,
      data: plots,
    };
  } catch (error) {
    console.error('Error getting project plots:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب قطع المشروع',
    };
  }
}

export async function getAvailableProperties(): Promise<ActionResult<Array<{ id: string; titleAr: string }>>> {
  try {
    const snapshot = await adminDb
      .collection('properties')
      .where('status', '==', 'available')
      .get();
    
    const properties = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titleAr: data.titleAr,
      };
    }).sort((a, b) => a.titleAr.localeCompare(b.titleAr));
    
    return {
      success: true,
      data: properties,
    };
  } catch (error) {
    console.error('Error getting available properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب العقارات المتاحة',
    };
  }
}
