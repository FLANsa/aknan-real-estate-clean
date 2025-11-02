'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Check, RotateCcw } from 'lucide-react';
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';

interface PropertyFiltersProps {
  cities: string[];
  districts: string[];
}

type FilterValues = {
  city: string;
  district: string;
  type: string;
  purpose: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  bedrooms: string;
  bathrooms: string;
};

const getInitialFilters = (searchParams: URLSearchParams): FilterValues => ({
  city: searchParams.get('city') || 'all',
  district: searchParams.get('district') || 'all',
  type: searchParams.get('type') || 'all',
  purpose: searchParams.get('purpose') || 'all',
  status: searchParams.get('status') || 'all',
  minPrice: searchParams.get('minPrice') || '',
  maxPrice: searchParams.get('maxPrice') || '',
  minArea: searchParams.get('minArea') || '',
  maxArea: searchParams.get('maxArea') || '',
  bedrooms: searchParams.get('bedrooms') || 'all',
  bathrooms: searchParams.get('bathrooms') || 'all',
});

const getEmptyFilters = (): FilterValues => ({
  city: 'all',
  district: 'all',
  type: 'all',
  purpose: 'all',
  status: 'all',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  bedrooms: 'all',
  bathrooms: 'all',
});

const getActiveFiltersCount = (filters: FilterValues): number => {
  return Object.values(filters).filter(value => value && value !== '' && value !== 'all').length;
};

const applyFiltersToUrl = (filters: FilterValues, router: ReturnType<typeof useRouter>) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        params.set(key, value);
      }
    });
    
    const newUrl = `/properties?${params.toString()}`;
    router.push(newUrl);
  } catch (error) {
    console.error('Error updating URL:', error);
  }
};

export default function PropertyFilters({ cities, districts }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // الفلاتر المطبقة حالياً (من URL)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(() => 
    getInitialFilters(searchParams)
  );
  
  // الفلاتر في حالة المسودة (قبل التطبيق)
  const [draftFilters, setDraftFilters] = useState<FilterValues>(() => 
    getInitialFilters(searchParams)
  );

  const [showFilters, setShowFilters] = useState(false);

  // تحديث الفلاتر المطبقة عند تغيير URL
  useEffect(() => {
    const newFilters = getInitialFilters(searchParams);
    setAppliedFilters(newFilters);
    setDraftFilters(newFilters);
  }, [searchParams]);

  // تحديث الفلاتر في المسودة (بدون تطبيق)
  const updateDraftFilters = (newFilters: Partial<FilterValues>) => {
    setDraftFilters(prev => ({ ...prev, ...newFilters }));
  };

  // تطبيق الفلاتر
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    applyFiltersToUrl(draftFilters, router);
  };

  // إلغاء الفلاتر المطبقة
  const clearFilters = () => {
    const emptyFilters = getEmptyFilters();
    setAppliedFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    applyFiltersToUrl(emptyFilters, router);
  };

  // إعادة تعيين المسودة إلى الفلاتر المطبقة
  const resetDraft = () => {
    setDraftFilters(appliedFilters);
  };

  // التحقق من وجود تغييرات في المسودة
  const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  const activeFiltersCount = getActiveFiltersCount(appliedFilters);

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          فلاتر البحث
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="mr-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>فلاتر البحث</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium">المدينة</label>
                <Select value={draftFilters.city} onValueChange={(value) => updateDraftFilters({ city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المدن</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحي</label>
                <Select value={draftFilters.district} onValueChange={(value) => updateDraftFilters({ district: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأحياء</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع العقار</label>
                <Select value={draftFilters.type} onValueChange={(value) => updateDraftFilters({ type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع المعاملة</label>
                <Select value={draftFilters.purpose} onValueChange={(value) => updateDraftFilters({ purpose: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المعاملات</SelectItem>
                    {Object.entries(PROPERTY_PURPOSE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select value={draftFilters.status} onValueChange={(value) => updateDraftFilters({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">غرف النوم</label>
                <Select value={draftFilters.bedrooms} onValueChange={(value) => updateDraftFilters({ bedrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العدد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأعداد</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+ غرف
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">دورات المياه</label>
                <Select value={draftFilters.bathrooms} onValueChange={(value) => updateDraftFilters({ bathrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العدد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأعداد</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+ دورات مياه
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">السعر (ريال)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="من"
                    value={draftFilters.minPrice}
                    onChange={(e) => updateDraftFilters({ minPrice: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={draftFilters.maxPrice}
                    onChange={(e) => updateDraftFilters({ maxPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Area Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">المساحة (م²)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="من"
                    value={draftFilters.minArea}
                    onChange={(e) => updateDraftFilters({ minArea: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={draftFilters.maxArea}
                    onChange={(e) => updateDraftFilters({ maxArea: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetDraft}
                disabled={!hasDraftChanges}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                إلغاء
              </Button>
              <Button
                onClick={applyFilters}
                disabled={!hasDraftChanges}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                تطبيق الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
