'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Plus, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Property {
  id: string;
  title: string;
  city?: string;
  district?: string;
}

interface PlotSaleModalProps {
  plotId: string;
  plotName: string;
  plotAreaM2: number;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    option: 'empty' | 'link' | 'create',
    propertyId?: string,
    propertyData?: any
  ) => Promise<void>;
  existingProperties?: Property[];
}

export default function PlotSaleModal({
  plotId,
  plotName,
  plotAreaM2,
  open,
  onClose,
  onConfirm,
  existingProperties = [],
}: PlotSaleModalProps) {
  const [option, setOption] = useState<'empty' | 'link' | 'create'>('empty');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for creating new property
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (option === 'empty') {
        await onConfirm('empty');
      } else if (option === 'link') {
        if (!selectedPropertyId) {
          alert('يرجى اختيار عقار');
          setIsSubmitting(false);
          return;
        }
        await onConfirm('link', selectedPropertyId);
      } else if (option === 'create') {
        if (!propertyTitle || !propertyType) {
          alert('يرجى ملء الحقول المطلوبة (العنوان ونوع العقار)');
          setIsSubmitting(false);
          return;
        }

        const propertyData = {
          title: propertyTitle,
          type: propertyType,
          areaM2: plotAreaM2,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          price: price ? parseFloat(price) : undefined,
          description: description || undefined,
          plotId: plotId,
        };

        await onConfirm('create', undefined, propertyData);
      }

      handleClose();
    } catch (error) {
      console.error('Error handling plot sale:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOption('empty');
    setSelectedPropertyId('');
    setPropertyTitle('');
    setPropertyType('');
    setBedrooms('');
    setBathrooms('');
    setPrice('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تحديث حالة القطعة إلى "مباع"</DialogTitle>
          <DialogDescription>
            القطعة: <strong>{plotName}</strong> • المساحة:{' '}
            <strong>{plotAreaM2.toLocaleString('ar-SA')} م²</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={option} onValueChange={(val) => setOption(val as any)}>
            {/* Option 1: Empty (Just mark as sold) */}
            <Card className={option === 'empty' ? 'border-aknan-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="empty" id="option-empty" />
                  <div className="flex-1">
                    <Label htmlFor="option-empty" className="cursor-pointer">
                      <div className="font-medium mb-1">قطعة فارغة</div>
                      <p className="text-sm text-muted-foreground">
                        تغيير حالة القطعة إلى "مباع" دون ربطها بعقار. مناسب للأراضي الفارغة أو
                        إذا كنت ستضيف العقار لاحقاً.
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Link to existing property */}
            <Card className={option === 'link' ? 'border-aknan-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="link" id="option-link" />
                  <div className="flex-1 space-y-3">
                    <Label htmlFor="option-link" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <LinkIcon className="h-4 w-4" />
                        ربط بعقار موجود
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ربط القطعة بعقار موجود في النظام.
                      </p>
                    </Label>

                    {option === 'link' && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="property-select">اختر العقار</Label>
                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                          <SelectTrigger id="property-select">
                            <SelectValue placeholder="اختر عقار من القائمة" />
                          </SelectTrigger>
                          <SelectContent>
                            {existingProperties.length > 0 ? (
                              existingProperties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.title}
                                  {property.city && property.district && (
                                    <span className="text-muted-foreground text-xs mr-2">
                                      ({property.city} - {property.district})
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-properties" disabled>
                                لا توجد عقارات متاحة
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 3: Create new property */}
            <Card className={option === 'create' ? 'border-aknan-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="create" id="option-create" />
                  <div className="flex-1 space-y-3">
                    <Label htmlFor="option-create" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <Plus className="h-4 w-4" />
                        إنشاء عقار جديد
                      </div>
                      <p className="text-sm text-muted-foreground">
                        إنشاء عقار جديد مرتبط بهذه القطعة.
                      </p>
                    </Label>

                    {option === 'create' && (
                      <div className="space-y-4 pt-2">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="property-title">
                              عنوان العقار <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="property-title"
                              placeholder="فيلا فاخرة في الرياض"
                              value={propertyTitle}
                              onChange={(e) => setPropertyTitle(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="property-type">
                              نوع العقار <span className="text-red-500">*</span>
                            </Label>
                            <Select value={propertyType} onValueChange={setPropertyType}>
                              <SelectTrigger id="property-type">
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="villa">فيلا</SelectItem>
                                <SelectItem value="apartment">شقة</SelectItem>
                                <SelectItem value="townhouse">تاون هاوس</SelectItem>
                                <SelectItem value="land">أرض</SelectItem>
                                <SelectItem value="office">مكتب</SelectItem>
                                <SelectItem value="shop">محل تجاري</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bedrooms">عدد غرف النوم</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              min="0"
                              placeholder="4"
                              value={bedrooms}
                              onChange={(e) => setBedrooms(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bathrooms">عدد دورات المياه</Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              min="0"
                              placeholder="3"
                              value={bathrooms}
                              onChange={(e) => setBathrooms(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="price">السعر (ريال سعودي)</Label>
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              placeholder="1500000"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea
                              id="description"
                              placeholder="وصف العقار..."
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <strong>ملاحظة:</strong> المساحة ({plotAreaM2.toLocaleString('ar-SA')} م²) سيتم
                          نقلها تلقائياً من القطعة إلى العقار.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Home className="h-4 w-4 ml-2" />
            {isSubmitting ? 'جاري الحفظ...' : 'تأكيد البيع'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}






