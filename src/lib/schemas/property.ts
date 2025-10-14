import { z } from 'zod';
import { PropertyPurpose, PropertyType, PropertyStatus, Currency } from '@/types/property';

export const propertySchema = z.object({
  titleAr: z.string()
    .min(1, 'العنوان مطلوب')
    .min(3, 'العنوان يجب أن يكون على الأقل 3 أحرف')
    .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
  
  descriptionAr: z.string()
    .max(2000, 'الوصف يجب أن يكون أقل من 2000 حرف')
    .optional(),
  
  city: z.string()
    .min(1, 'المدينة مطلوبة')
    .max(100, 'اسم المدينة يجب أن يكون أقل من 100 حرف'),
  
  district: z.string()
    .max(100, 'اسم الحي يجب أن يكون أقل من 100 حرف')
    .optional(),
  
  address: z.string()
    .max(300, 'العنوان التفصيلي يجب أن يكون أقل من 300 حرف')
    .optional(),
  
  purpose: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'نوع المعاملة مطلوب (بيع أو إيجار)' })
  }),
  
  type: z.enum(['apartment', 'villa', 'land', 'office', 'shop'], {
    errorMap: () => ({ message: 'نوع العقار مطلوب' })
  }),
  
  areaM2: z.number()
    .min(1, 'المساحة يجب أن تكون أكبر من 0')
    .max(100000, 'المساحة كبيرة جداً')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  bedrooms: z.number()
    .min(0, 'عدد غرف النوم لا يمكن أن يكون سالباً')
    .max(50, 'عدد غرف النوم كبير جداً')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  bathrooms: z.number()
    .min(0, 'عدد دورات المياه لا يمكن أن يكون سالباً')
    .max(20, 'عدد دورات المياه كبير جداً')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  floor: z.number()
    .min(-5, 'رقم الطابق غير صحيح')
    .max(200, 'رقم الطابق كبير جداً')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  price: z.number()
    .min(1, 'السعر مطلوب')
    .max(1000000000, 'السعر كبير جداً'),
  
  currency: z.enum(['SAR', 'USD'], {
    errorMap: () => ({ message: 'العملة مطلوبة (ريال أو دولار)' })
  }),
  
  status: z.enum(['available', 'sold', 'rented', 'off-market'], {
    errorMap: () => ({ message: 'حالة العقار مطلوبة' })
  }),
  
  features: z.array(z.string())
    .max(20, 'لا يمكن إضافة أكثر من 20 ميزة')
    .optional(),
  
  yearBuilt: z.number()
    .min(1800, 'سنة البناء غير صحيحة')
    .max(new Date().getFullYear() + 5, 'سنة البناء في المستقبل')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  lat: z.number()
    .min(-90, 'خط العرض غير صحيح')
    .max(90, 'خط العرض غير صحيح')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  lng: z.number()
    .min(-180, 'خط الطول غير صحيح')
    .max(180, 'خط الطول غير صحيح')
    .transform(val => isNaN(val) ? undefined : val)
    .optional(),
  
  images: z.array(z.string().min(1, 'رابط الصورة مطلوب'))
    .min(1, 'يجب إضافة صورة واحدة على الأقل')
    .max(20, 'لا يمكن إضافة أكثر من 20 صورة'),
  
  featured: z.boolean().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// Validation schema for property filters
export const propertyFiltersSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.enum(['apartment', 'villa', 'land', 'office', 'shop']).optional(),
  purpose: z.enum(['sale', 'rent']).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  status: z.enum(['available', 'sold', 'rented', 'off-market']).optional(),
  featured: z.boolean().optional(),
});

export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;


