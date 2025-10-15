'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plotSchema, PlotFormData } from '@/lib/schemas/map';
import { Plot, PLOT_STATUS_LABELS, CURRENCY_LABELS } from '@/types/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatArea, formatPerimeter } from '@/lib/google-maps';

interface PlotFormProps {
  plot?: Plot;
  projectId: string;
  onSubmit: (data: PlotFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableProperties?: Array<{ id: string; titleAr: string }>;
}

export default function PlotForm({
  plot,
  projectId,
  onSubmit,
  onCancel,
  isLoading = false,
  availableProperties = [],
}: PlotFormProps) {
  const [error, setError] = useState('');
  const [calculatedDimensions, setCalculatedDimensions] = useState<{
    area: number;
    perimeter: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      projectId,
      number: plot?.number || '',
      status: plot?.status || 'available',
      price: plot?.price || 0,
      currency: plot?.currency || 'SAR',
      polygon: plot?.polygon || [],
      notes: plot?.notes || '',
      propertyId: plot?.propertyId || '',
    },
  });

  const watchedPolygon = watch('polygon');

  // Calculate dimensions when polygon changes
  useEffect(() => {
    if (watchedPolygon && watchedPolygon.length >= 3) {
      // Import calculation functions dynamically to avoid SSR issues
      import('@/lib/google-maps').then(({ calculateArea, calculatePerimeter }) => {
        const area = calculateArea(watchedPolygon);
        const perimeter = calculatePerimeter(watchedPolygon);
        setCalculatedDimensions({ area, perimeter });
      });
    } else {
      setCalculatedDimensions(null);
    }
  }, [watchedPolygon]);

  const onFormSubmit = async (data: PlotFormData) => {
    try {
      setError('');
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{plot ? 'تعديل القطعة' : 'إضافة قطعة جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Plot Number */}
          <div className="space-y-2">
            <Label htmlFor="number">رقم القطعة *</Label>
            <Input
              id="number"
              {...register('number')}
              placeholder="مثال: A-1, B-12"
              autoComplete="off"
            />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">الحالة *</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as PlotFormData['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLOT_STATUS_LABELS).map(([value, label]) => (
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

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">السعر *</Label>
            <div className="flex gap-2">
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="0"
                className="flex-1"
              />
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value as PlotFormData['currency'])}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Calculated Dimensions Display */}
          {calculatedDimensions && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">الأبعاد المحسوبة</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">المساحة:</span>
                  <span className="font-medium mr-2">{formatArea(calculatedDimensions.area)}</span>
                </div>
                <div>
                  <span className="text-gray-600">المحيط:</span>
                  <span className="font-medium mr-2">{formatPerimeter(calculatedDimensions.perimeter)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Property Link */}
          {availableProperties.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="propertyId">ربط بعقار موجود (اختياري)</Label>
              <Select
                value={watch('propertyId') || ''}
                onValueChange={(value) => setValue('propertyId', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر عقار للربط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">لا يوجد ربط</SelectItem>
                  {availableProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.titleAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="ملاحظات إضافية..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Polygon validation */}
          {errors.polygon && (
            <Alert variant="destructive">
              <AlertDescription>{errors.polygon.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'جاري الحفظ...' : (plot ? 'تحديث' : 'إضافة')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

