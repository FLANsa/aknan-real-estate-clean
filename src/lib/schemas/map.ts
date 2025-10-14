import { z } from 'zod';

// Coordinates schema
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Project schema
export const projectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب').max(100, 'اسم المشروع طويل جداً'),
  location: coordinatesSchema,
  zoom: z.number().min(1).max(20).default(15),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

// Plot schema
export const plotSchema = z.object({
  projectId: z.string().min(1, 'معرف المشروع مطلوب'),
  number: z.string().min(1, 'رقم القطعة مطلوب').max(20, 'رقم القطعة طويل جداً'),
  status: z.enum(['available', 'sold', 'reserved']),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
  currency: z.enum(['SAR', 'USD']),
  polygon: z
    .array(coordinatesSchema)
    .min(3, 'يجب أن تحتوي القطعة على 3 نقاط على الأقل'),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
  propertyId: z.string().optional(),
});

// Plot update schema (all fields optional except id)
export const plotUpdateSchema = z.object({
  number: z.string().min(1, 'رقم القطعة مطلوب').max(20, 'رقم القطعة طويل جداً').optional(),
  status: z.enum(['available', 'sold', 'reserved']).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً').optional(),
  currency: z.enum(['SAR', 'USD']).optional(),
  polygon: z
    .array(coordinatesSchema)
    .min(3, 'يجب أن تحتوي القطعة على 3 نقاط على الأقل')
    .optional(),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
  propertyId: z.string().optional(),
});

// Project update schema (all fields optional except id)
export const projectUpdateSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب').max(100, 'اسم المشروع طويل جداً').optional(),
  location: coordinatesSchema.optional(),
  zoom: z.number().min(1).max(20).optional(),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

// Plot linking schema
export const plotLinkingSchema = z.object({
  plotId: z.string().min(1, 'معرف القطعة مطلوب'),
  propertyId: z.string().min(1, 'معرف العقار مطلوب').optional(),
});

// Type exports
export type ProjectFormData = z.infer<typeof projectSchema>;
export type PlotFormData = z.infer<typeof plotSchema>;
export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;
export type PlotUpdateData = z.infer<typeof plotUpdateSchema>;
export type PlotLinkingData = z.infer<typeof plotLinkingSchema>;
export type CoordinatesData = z.infer<typeof coordinatesSchema>;