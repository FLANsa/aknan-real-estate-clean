'use server';
import 'server-only';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/auth';
import { propertySchema, PropertyFormData } from '@/lib/schemas/property';
import { createPropertySlug, generateUniqueSlug } from '@/lib/utils/slugify';
import { Property, PropertyListResponse } from '@/types/property';
import { FieldValue } from 'firebase-admin/firestore';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create a new property
export async function createProperty(formData: PropertyFormData): Promise<ActionResult<Property>> {
  try {
    // Verify admin access
    const user = await requireAdmin();
    
    // Validate form data
    const validatedData = propertySchema.parse(formData);
    
    // Generate unique slug
    const baseSlug = createPropertySlug(validatedData.titleAr);
    
    // Check for existing slugs
    const existingProperties = await adminDb
      .collection('properties')
      .select('slug')
      .get();
    
    const existingSlugs = existingProperties.docs.map(doc => doc.data().slug);
    const uniqueSlug = await generateUniqueSlug(baseSlug, existingSlugs);
    
    // Create property document
    const propertyData = {
      ...validatedData,
      slug: uniqueSlug,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };
    
    const docRef = await adminDb.collection('properties').add(propertyData);
    
    // Get the created property
    const doc = await docRef.get();
    const data = doc.data()!;
    const property = {
      id: doc.id,
      ...data,
      // Ensure numeric fields are properly converted
      price: Number(data.price) || 0,
      areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      floor: data.floor ? Number(data.floor) : undefined,
      yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Property;
    
    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء العقار',
    };
  }
}

// Update an existing property
export async function updateProperty(
  id: string,
  formData: PropertyFormData
): Promise<ActionResult<Property>> {
  try {
    // Verify admin access
    const user = await requireAdmin();
    
    // Validate form data
    const validatedData = propertySchema.parse(formData);
    
    // Check if property exists and user has permission
    const propertyDoc = await adminDb.collection('properties').doc(id).get();
    
    if (!propertyDoc.exists) {
      return {
        success: false,
        error: 'العقار غير موجود',
      };
    }
    
    const existingProperty = propertyDoc.data();
    if (existingProperty?.createdBy !== user.uid) {
      return {
        success: false,
        error: 'ليس لديك صلاحية لتعديل هذا العقار',
      };
    }
    
    // Generate new slug if title changed
    let slug = existingProperty?.slug;
    if (validatedData.titleAr !== existingProperty?.titleAr) {
      const baseSlug = createPropertySlug(validatedData.titleAr);
      
      // Check for existing slugs (excluding current property)
      const existingProperties = await adminDb
        .collection('properties')
        .where('slug', '!=', slug)
        .select('slug')
        .get();
      
      const existingSlugs = existingProperties.docs.map(doc => doc.data().slug);
      slug = await generateUniqueSlug(baseSlug, existingSlugs);
    }
    
    // Update property document
    const updateData = {
      ...validatedData,
      slug,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await adminDb.collection('properties').doc(id).update(updateData);
    
    // Get the updated property
    const updatedDoc = await adminDb.collection('properties').doc(id).get();
    const property = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate() || new Date(),
    } as Property;
    
    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث العقار',
    };
  }
}

// Delete a property
export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    // Verify admin access
    const user = await requireAdmin();
    
    // Check if property exists and user has permission
    const propertyDoc = await adminDb.collection('properties').doc(id).get();
    
    if (!propertyDoc.exists) {
      return {
        success: false,
        error: 'العقار غير موجود',
      };
    }
    
    const property = propertyDoc.data();
    if (property?.createdBy !== user.uid) {
      return {
        success: false,
        error: 'ليس لديك صلاحية لحذف هذا العقار',
      };
    }
    
    // Delete associated images from storage
    if (property?.images?.length > 0) {
      const { deletePropertyImages } = await import('@/lib/firebase/storage');
      await deletePropertyImages(property.images);
    }
    
    // Delete property document
    await adminDb.collection('properties').doc(id).delete();
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف العقار',
    };
  }
}

// List properties for admin with search and pagination
export async function listAdminProperties({
  q = '',
  page = 1,
  pageSize = 10,
}: {
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<PropertyListResponse>> {
  try {
    // Verify admin access
    await requireAdmin();
    
    const query = adminDb.collection('properties').orderBy('updatedAt', 'desc');
    
    // Apply search filter if provided
    if (q.trim()) {
      // For now, we'll fetch all and filter in memory
      // In production, you might want to use Algolia or similar for better search
      const allDocs = await query.get();
      const filteredDocs = allDocs.docs.filter(doc => {
        const data = doc.data();
        const searchTerm = q.toLowerCase();
        return (
          data.titleAr?.toLowerCase().includes(searchTerm) ||
          data.city?.toLowerCase().includes(searchTerm) ||
          data.district?.toLowerCase().includes(searchTerm)
        );
      });
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex);
      
      const properties = paginatedDocs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure numeric fields are properly converted
          price: Number(data.price) || 0,
          areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
          bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
          bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
          floor: data.floor ? Number(data.floor) : undefined,
          yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
          lat: data.lat ? Number(data.lat) : undefined,
          lng: data.lng ? Number(data.lng) : undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Property[];
      
      return {
        success: true,
        data: {
          properties,
          total: filteredDocs.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredDocs.length / pageSize),
        },
      };
    } else {
      // No search, apply pagination directly
      const totalDocs = await query.get();
      const total = totalDocs.size;
      
      const paginatedQuery = query.limit(pageSize).offset((page - 1) * pageSize);
      const docs = await paginatedQuery.get();
      
      const properties = docs.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure numeric fields are properly converted
          price: Number(data.price) || 0,
          areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
          bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
          bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
          floor: data.floor ? Number(data.floor) : undefined,
          yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
          lat: data.lat ? Number(data.lat) : undefined,
          lng: data.lng ? Number(data.lng) : undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Property[];
      
      return {
        success: true,
        data: {
          properties,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }
  } catch (error) {
    console.error('Error listing properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب العقارات',
    };
  }
}

// Get a single property by ID
export async function getProperty(id: string): Promise<ActionResult<Property>> {
  try {
    const doc = await adminDb.collection('properties').doc(id).get();
    
    if (!doc.exists) {
      return {
        success: false,
        error: 'العقار غير موجود',
      };
    }
    
    const data = doc.data()!;
    const property = {
      id: doc.id,
      ...data,
      // Ensure numeric fields are properly converted
      price: Number(data.price) || 0,
      areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      floor: data.floor ? Number(data.floor) : undefined,
      yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Property;
    
    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error getting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب العقار',
    };
  }
}

// Get a property by slug (for public pages)
export async function getPropertyBySlug(slug: string): Promise<ActionResult<Property>> {
  try {
    const query = await adminDb
      .collection('properties')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (query.empty) {
      return {
        success: false,
        error: 'العقار غير موجود',
      };
    }
    
    const doc = query.docs[0];
    const data = doc.data()!;
    const property = {
      id: doc.id,
      ...data,
      // Ensure numeric fields are properly converted
      price: Number(data.price) || 0,
      areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      floor: data.floor ? Number(data.floor) : undefined,
      yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Property;
    
    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error getting property by slug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب العقار',
    };
  }
}
