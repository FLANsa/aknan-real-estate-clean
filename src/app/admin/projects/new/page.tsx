'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '@/lib/schemas/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createProject } from '../actions';
import LocationPicker from '@/components/LocationPicker';

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      location: { lat: 24.7136, lng: 46.6753 }, // Default to Riyadh
      zoom: 15,
      description: '',
    },
  });

  const watchedLocation = watch('location');

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const result = await createProject(data);

      if (result.success) {
        router.push('/admin/projects');
      } else {
        setError(result.error || 'حدث خطأ أثناء إنشاء المشروع');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إنشاء مشروع جديد</h1>
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

        {/* Project Name */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المشروع *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="مثال: مخطط الرياض الجديد"
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="وصف المشروع..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Selection */}
        <LocationPicker
          center={watchedLocation}
          zoom={watch('zoom')}
          onLocationChange={(location, zoom) => {
            setValue('location.lat', location.lat);
            setValue('location.lng', location.lng);
            setValue('zoom', zoom);
          }}
          disabled={isSubmitting}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
