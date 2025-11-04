'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, PropertyFormDataWithoutCurrency } from '@/lib/schemas/property';
import { createProperty } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import { MAP_CONFIG } from '@/lib/google-maps-config';
import { logger } from '@/lib/performance';

export default function NewPropertyPage() {
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState({ lat: MAP_CONFIG.defaultCenter.lat, lng: MAP_CONFIG.defaultCenter.lng });
  const [zoom, setZoom] = useState(MAP_CONFIG.defaultZoom);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormDataWithoutCurrency>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      titleAr: '',
      city: '',
      price: 0,
      purpose: 'sale',
      type: 'apartment',
      status: 'available',
      featured: false,
      images: [],
    },
  });


  const onSubmit = async (data: PropertyFormDataWithoutCurrency) => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData = {
        ...data,
        currency: 'SAR' as const, // إضافة العملة تلقائياً
        images,
        lat: location.lat,
        lng: location.lng,
      };

      const result = await createProperty(formData);

      if (result.success) {
        router.push('/admin/properties');
      } else {
        setError(result.error || 'حدث خطأ أثناء إنشاء العقار');
      }
    } catch (error) {
      logger.error('Error creating property:', error);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إنشاء عقار جديد</h1>
        <Button variant="outline" onClick={() => router.back()}>
          العودة
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleAr">العنوان بالعربية *</Label>
                <Input
                  id="titleAr"
                  autoComplete="off"
                  {...register('titleAr')}
                  placeholder="فيلا فاخرة في بريدة"
                />
                {errors.titleAr && (
                  <p className="text-sm text-destructive">{errors.titleAr.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المدينة *</Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  {...register('city')}
                  placeholder="بريدة"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">الحي</Label>
                <Input
                  id="district"
                  autoComplete="address-level3"
                  {...register('district')}
                  placeholder="الملقا"
                />
                {errors.district && (
                  <p className="text-sm text-destructive">{errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان التفصيلي</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  {...register('address')}
                  placeholder="شارع الملك فهد، حي الملقا"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">الوصف</Label>
              <Textarea
                id="descriptionAr"
                autoComplete="off"
                {...register('descriptionAr')}
                placeholder="وصف مفصل للعقار..."
                rows={4}
              />
              {errors.descriptionAr && (
                <p className="text-sm text-destructive">{errors.descriptionAr.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل العقار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">نوع المعاملة *</Label>
                <Select onValueChange={(value) => setValue('purpose', value as any)}>
                  <SelectTrigger id="purpose">
                    <SelectValue placeholder="اختر نوع المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_PURPOSE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-destructive">{errors.purpose.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">نوع العقار *</Label>
                <Select onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger id="type">
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
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areaM2">المساحة (م²)</Label>
                <Input
                  id="areaM2"
                  type="number"
                  autoComplete="off"
                  {...register('areaM2', { valueAsNumber: true })}
                  placeholder="500"
                />
                {errors.areaM2 && (
                  <p className="text-sm text-destructive">{errors.areaM2.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">غرف النوم</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  autoComplete="off"
                  {...register('bedrooms', { valueAsNumber: true })}
                  placeholder="5"
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
                  autoComplete="off"
                  {...register('bathrooms', { valueAsNumber: true })}
                  placeholder="6"
                />
                {errors.bathrooms && (
                  <p className="text-sm text-destructive">{errors.bathrooms.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">الطابق</Label>
                <Input
                  id="floor"
                  type="number"
                  autoComplete="off"
                  {...register('floor', { valueAsNumber: true })}
                  placeholder="2"
                />
                {errors.floor && (
                  <p className="text-sm text-destructive">{errors.floor.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر *</Label>
                <Input
                  id="price"
                  type="number"
                  autoComplete="off"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="3500000"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">سنة البناء</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  autoComplete="off"
                  {...register('yearBuilt', { valueAsNumber: true })}
                  placeholder="2023"
                />
                {errors.yearBuilt && (
                  <p className="text-sm text-destructive">{errors.yearBuilt.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
              <Label htmlFor="featured">عقار مميز</Label>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>موقع العقار</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationPicker
              center={location}
              zoom={zoom}
              onLocationChange={(newLocation, newZoom) => {
                setLocation(newLocation);
                setZoom(newZoom);
                setValue('lat', newLocation.lat);
                setValue('lng', newLocation.lng);
              }}
              disabled={isSubmitting}
            />
            {(errors.lat || errors.lng) && (
              <p className="text-sm text-destructive mt-2">
                {errors.lat?.message || errors.lng?.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>صور العقار</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={images}
              onImagesChange={(newImages) => {
                setImages(newImages);
                setValue('images', newImages);
              }}
              propertyId="temp"
              maxImages={20}
            />
            {errors.images && (
              <p className="text-sm text-destructive mt-2">{errors.images.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                حفظ العقار
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


