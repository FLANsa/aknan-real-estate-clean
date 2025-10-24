import { requireAdmin } from '@/lib/firebase/auth';
import { getEvaluationRequest } from '@/lib/admin-data';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusSelect } from '@/components/StatusSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCheck, User, Phone, Mail, Home, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface EvaluationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationDetailPage({ params }: EvaluationDetailPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const { id } = await params;
  const evaluation = await getEvaluationRequest(id);

  if (!evaluation) {
    redirect('/admin/evaluations');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/evaluations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل طلب التقييم</h1>
            <p className="text-muted-foreground">عرض تفاصيل طلب تقييم العقار</p>
          </div>
        </div>
        <StatusSelect
          id={evaluation.id}
          currentStatus={evaluation.status}
          type="evaluation"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات المالك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{evaluation.ownerName}</p>
                <p className="text-sm text-muted-foreground">اسم المالك</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{evaluation.ownerPhone}</p>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
              </div>
            </div>
            {evaluation.ownerEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{evaluation.ownerEmail}</p>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {evaluation.createdAt.toLocaleDateString('ar-SA')}
                </p>
                <p className="text-sm text-muted-foreground">
                  في {evaluation.createdAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              معلومات العقار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">نوع العقار</h3>
                <p className="text-sm text-muted-foreground">{evaluation.propertyType}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">المساحة</h3>
                <p className="text-sm text-muted-foreground">{evaluation.areaM2} م²</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">المدينة</h3>
                <p className="text-sm text-muted-foreground">{evaluation.city}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">الحي</h3>
                <p className="text-sm text-muted-foreground">{evaluation.district}</p>
              </div>
              {evaluation.bedrooms && (
                <div>
                  <h3 className="font-medium mb-2">غرف النوم</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.bedrooms}</p>
                </div>
              )}
              {evaluation.bathrooms && (
                <div>
                  <h3 className="font-medium mb-2">دورات المياه</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.bathrooms}</p>
                </div>
              )}
              {evaluation.floors && (
                <div>
                  <h3 className="font-medium mb-2">عدد الطوابق</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.floors}</p>
                </div>
              )}
              {evaluation.yearBuilt && (
                <div>
                  <h3 className="font-medium mb-2">سنة البناء</h3>
                  <p className="text-sm text-muted-foreground">{evaluation.yearBuilt}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">العنوان</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {evaluation.propertyAddress}
              </div>
            </div>

            {evaluation.description && (
              <div>
                <h3 className="font-medium mb-2">الوصف</h3>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{evaluation.description}</p>
                </div>
              </div>
            )}

            {evaluation.specialFeatures && (
              <div>
                <h3 className="font-medium mb-2">المميزات الخاصة</h3>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{evaluation.specialFeatures}</p>
                </div>
              </div>
            )}

            {evaluation.expectedPrice && (
              <div>
                <h3 className="font-medium mb-2">السعر المتوقع</h3>
                <p className="text-sm text-muted-foreground">
                  {evaluation.expectedPrice.toLocaleString()} ريال سعودي
                </p>
              </div>
            )}

            {/* Images */}
            {evaluation.images && evaluation.images.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">الصور المرفوعة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {evaluation.images.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={imageUrl}
                        alt={`صورة العقار ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evaluation.processedAt && (
              <div>
                <h3 className="font-medium mb-2">تاريخ المعالجة</h3>
                <p className="text-sm text-muted-foreground">
                  {evaluation.processedAt.toLocaleDateString('ar-SA')} في {evaluation.processedAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            )}

            {evaluation.updatedAt && evaluation.updatedAt !== evaluation.createdAt && (
              <div>
                <h3 className="font-medium mb-2">آخر تحديث</h3>
                <p className="text-sm text-muted-foreground">
                  {evaluation.updatedAt.toLocaleDateString('ar-SA')} في {evaluation.updatedAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

