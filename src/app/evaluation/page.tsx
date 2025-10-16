'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Upload, MapPin, Home, User } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

// Schema for property evaluation form
const evaluationSchema = z.object({
  // Owner Information
  ownerName: z.string().min(2, 'اسم المالك مطلوب').max(100, 'الاسم طويل جداً'),
  ownerPhone: z.string().min(10, 'رقم الهاتف مطلوب').max(15, 'رقم الهاتف طويل جداً'),
  ownerEmail: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  
  // Property Information
  propertyType: z.enum(['apartment', 'villa', 'townhouse', 'office', 'shop', 'land'], {
    required_error: 'نوع العقار مطلوب'
  }),
  propertyAddress: z.string().min(5, 'عنوان العقار مطلوب').max(200, 'العنوان طويل جداً'),
  city: z.string().min(2, 'المدينة مطلوبة').max(50, 'اسم المدينة طويل جداً'),
  district: z.string().min(2, 'الحي مطلوب').max(50, 'اسم الحي طويل جداً'),
  
  // Property Details
  areaM2: z.number().min(1, 'المساحة مطلوبة').max(10000, 'المساحة كبيرة جداً'),
  bedrooms: z.number().min(0, 'عدد الغرف يجب أن يكون موجباً').max(20, 'عدد الغرف كبير جداً').optional(),
  bathrooms: z.number().min(0, 'عدد الحمامات يجب أن يكون موجباً').max(20, 'عدد الحمامات كبير جداً').optional(),
  floors: z.number().min(1, 'عدد الطوابق مطلوب').max(50, 'عدد الطوابق كبير جداً').optional(),
  yearBuilt: z.number().min(1900, 'سنة البناء غير صحيحة').max(new Date().getFullYear(), 'سنة البناء في المستقبل').optional(),
  
  // Additional Information
  description: z.string().max(1000, 'الوصف طويل جداً').optional(),
  specialFeatures: z.string().max(500, 'المميزات الخاصة طويلة جداً').optional(),
  expectedPrice: z.number().min(0, 'السعر المتوقع يجب أن يكون موجباً').optional(),
  
  // Images
  images: z.array(z.string()).max(10, 'يمكن رفع 10 صور كحد أقصى').optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const PROPERTY_TYPE_LABELS = {
  apartment: 'شقة',
  villa: 'فيلا',
  townhouse: 'تاون هاوس',
  office: 'مكتب',
  shop: 'محل تجاري',
  land: 'أرض',
};

export default function EvaluationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      propertyType: undefined,
      propertyAddress: '',
      city: '',
      district: '',
      areaM2: 0,
      bedrooms: undefined,
      bathrooms: undefined,
      floors: undefined,
      yearBuilt: undefined,
      description: '',
      specialFeatures: '',
      expectedPrice: undefined,
      images: [],
    },
  });

  const watchedImages = watch('images');

  const onSubmit = async (data: EvaluationFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically send the data to your backend
      // For now, we'll simulate a successful submission
      console.log('Evaluation data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('حدث خطأ أثناء إرسال طلب التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h1 className="text-2xl font-bold mb-4">تم إرسال طلب التقييم بنجاح</h1>
                <p className="text-muted-foreground mb-6">
                  شكراً لك على طلب تقييم العقار. سيتواصل معك فريقنا خلال 24-48 ساعة لتحديد موعد التقييم.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• سيتم التواصل معك على رقم الهاتف المقدم</p>
                  <p>• يرجى التأكد من توفرك في الموعد المحدد</p>
                  <p>• قد نحتاج لصور إضافية للعقار</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="mt-6"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">تقييم العقار</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                احصل على تقييم مجاني ودقيق لعقارك من خبرائنا المعتمدين
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات المالك
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">اسم المالك *</Label>
                      <Input
                        id="ownerName"
                        {...register('ownerName')}
                        placeholder="الاسم الكامل"
                        autoComplete="name"
                      />
                      {errors.ownerName && (
                        <p className="text-sm text-destructive">{errors.ownerName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerPhone">رقم الهاتف *</Label>
                      <Input
                        id="ownerPhone"
                        {...register('ownerPhone')}
                        placeholder="05xxxxxxxx"
                        autoComplete="tel"
                      />
                      {errors.ownerPhone && (
                        <p className="text-sm text-destructive">{errors.ownerPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">البريد الإلكتروني</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      {...register('ownerEmail')}
                      placeholder="example@email.com"
                      autoComplete="email"
                    />
                    {errors.ownerEmail && (
                      <p className="text-sm text-destructive">{errors.ownerEmail.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    معلومات العقار
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">نوع العقار *</Label>
                      <Select onValueChange={(value) => setValue('propertyType', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العقار" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.propertyType && (
                        <p className="text-sm text-destructive">{errors.propertyType.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaM2">المساحة (م²) *</Label>
                      <Input
                        id="areaM2"
                        type="number"
                        {...register('areaM2', { valueAsNumber: true })}
                        placeholder="مثال: 150"
                        min="1"
                        max="10000"
                      />
                      {errors.areaM2 && (
                        <p className="text-sm text-destructive">{errors.areaM2.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">عنوان العقار *</Label>
                    <Input
                      id="propertyAddress"
                      {...register('propertyAddress')}
                      placeholder="العنوان التفصيلي للعقار"
                    />
                    {errors.propertyAddress && (
                      <p className="text-sm text-destructive">{errors.propertyAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="مثال: الرياض"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">الحي *</Label>
                      <Input
                        id="district"
                        {...register('district')}
                        placeholder="مثال: النخيل"
                      />
                      {errors.district && (
                        <p className="text-sm text-destructive">{errors.district.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">غرف النوم</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        {...register('bedrooms', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        max="20"
                      />
                      {errors.bedrooms && (
                        <p className="text-sm text-destructive">{errors.bedrooms.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">دورات المياه</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        {...register('bathrooms', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        max="20"
                      />
                      {errors.bathrooms && (
                        <p className="text-sm text-destructive">{errors.bathrooms.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floors">عدد الطوابق</Label>
                      <Input
                        id="floors"
                        type="number"
                        {...register('floors', { valueAsNumber: true })}
                        placeholder="1"
                        min="1"
                        max="50"
                      />
                      {errors.floors && (
                        <p className="text-sm text-destructive">{errors.floors.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearBuilt">سنة البناء</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        {...register('yearBuilt', { valueAsNumber: true })}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                      {errors.yearBuilt && (
                        <p className="text-sm text-destructive">{errors.yearBuilt.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف العقار</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="وصف تفصيلي للعقار..."
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialFeatures">المميزات الخاصة</Label>
                    <Textarea
                      id="specialFeatures"
                      {...register('specialFeatures')}
                      placeholder="مثال: مسبح، حديقة، موقف سيارة، مصعد..."
                      rows={3}
                    />
                    {errors.specialFeatures && (
                      <p className="text-sm text-destructive">{errors.specialFeatures.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedPrice">السعر المتوقع (ريال)</Label>
                    <Input
                      id="expectedPrice"
                      type="number"
                      {...register('expectedPrice', { valueAsNumber: true })}
                      placeholder="مثال: 500000"
                      min="0"
                    />
                    {errors.expectedPrice && (
                      <p className="text-sm text-destructive">{errors.expectedPrice.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    صور العقار
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      يمكنك رفع صور العقار (اختياري) - الحد الأقصى 10 صور
                    </p>
                    <ImageUploader
                      onImagesChange={(images) => setValue('images', images)}
                      maxImages={10}
                      maxSizePerImage={5 * 1024 * 1024} // 5MB
                    />
                    {errors.images && (
                      <p className="text-sm text-destructive">{errors.images.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="px-8"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب التقييم'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
