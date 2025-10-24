'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MapFiltersState } from '@/types/map-filters';

interface MapFiltersProps {
  filters: MapFiltersState;
  onFiltersChange: (filters: MapFiltersState) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'available', label: 'متاح' },
  { value: 'sold', label: 'مباع' },
  { value: 'rented', label: 'مؤجر' },
  { value: 'reserved', label: 'محجوز' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: 'all', label: 'جميع الأنواع' },
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'townhouse', label: 'تاون هاوس' },
  { value: 'land', label: 'أرض' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
];

const PRICE_RANGE = {
  min: 0,
  max: 10000000,
  step: 100000,
};

export default function MapFilters({
  filters,
  onFiltersChange,
  isExpanded = true,
  onToggleExpanded,
}: MapFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MapFiltersState>(filters);

  const handleFilterChange = (key: keyof MapFiltersState, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters: MapFiltersState = {
      showProperties: true,
      showProjects: true,
      statusFilter: 'all',
      propertyTypeFilter: 'all',
      priceRange: [PRICE_RANGE.min, PRICE_RANGE.max],
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    localFilters.statusFilter !== 'all',
    localFilters.propertyTypeFilter !== 'all',
    localFilters.priceRange[0] !== PRICE_RANGE.min || localFilters.priceRange[1] !== PRICE_RANGE.max,
  ].filter(Boolean).length;

  if (!isExpanded) {
    return (
      <Card className="cursor-pointer" onClick={onToggleExpanded}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-medium">الفلاتر</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default">{activeFiltersCount}</Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">انقر للتوسيع</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>فلاتر الخريطة</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default">{activeFiltersCount}</Badge>
            )}
          </div>
          {onToggleExpanded && (
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>تخصيص العقارات المعروضة على الخريطة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show/Hide Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-properties" className="cursor-pointer">
              عرض العقارات المنفصلة
            </Label>
            <Switch
              id="show-properties"
              checked={localFilters.showProperties}
              onCheckedChange={(checked) => handleFilterChange('showProperties', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-projects" className="cursor-pointer">
              عرض المشاريع والقطع
            </Label>
            <Switch
              id="show-projects"
              checked={localFilters.showProjects}
              onCheckedChange={(checked) => handleFilterChange('showProjects', checked)}
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>حالة العقار</Label>
            <Select
              value={localFilters.statusFilter}
              onValueChange={(value) => handleFilterChange('statusFilter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div className="space-y-2">
            <Label>نوع العقار</Label>
            <Select
              value={localFilters.propertyTypeFilter}
              onValueChange={(value) => handleFilterChange('propertyTypeFilter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <Label>نطاق السعر</Label>
            <div className="px-2">
              <Slider
                min={PRICE_RANGE.min}
                max={PRICE_RANGE.max}
                step={PRICE_RANGE.step}
                value={localFilters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{localFilters.priceRange[0].toLocaleString('ar-SA')} ريال</span>
              <span>-</span>
              <span>
                {localFilters.priceRange[1] === PRICE_RANGE.max
                  ? '10+ مليون'
                  : `${localFilters.priceRange[1].toLocaleString('ar-SA')} ريال`}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <X className="h-4 w-4 ml-2" />
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

