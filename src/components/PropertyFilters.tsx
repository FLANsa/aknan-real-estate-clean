'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';

interface PropertyFiltersProps {
  cities: string[];
  districts: string[];
}

export default function PropertyFilters({ cities, districts }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    type: searchParams.get('type') || '',
    purpose: searchParams.get('purpose') || '',
    status: searchParams.get('status') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      district: '',
      type: '',
      purpose: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      bedrooms: '',
      bathrooms: '',
    });
    router.push('/properties');
  };

  const activeFiltersCount = Object.values(filters).filter(value => value).length;

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
                <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المدن</SelectItem>
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
                <Select value={filters.district} onValueChange={(value) => updateFilters({ district: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأحياء</SelectItem>
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
                <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأنواع</SelectItem>
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
                <Select value={filters.purpose} onValueChange={(value) => updateFilters({ purpose: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المعاملات</SelectItem>
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
                <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
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
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilters({ bedrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العدد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأعداد</SelectItem>
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
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilters({ bathrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العدد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأعداد</SelectItem>
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
                    value={filters.minPrice}
                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
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
                    value={filters.minArea}
                    onChange={(e) => updateFilters({ minArea: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={filters.maxArea}
                    onChange={(e) => updateFilters({ maxArea: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
