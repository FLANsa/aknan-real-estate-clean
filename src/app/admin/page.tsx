import { requireAdmin } from '@/lib/firebase/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, BarChart3, Users, MapPin } from 'lucide-react';

export default async function AdminDashboard() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مرحباً، {user.displayName || user.email}</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة التحكم</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              عقار متاح للعرض
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات الجديدة</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاهدات</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الزوار</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>إدارة العقارات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع العقارات المتاحة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/properties">
                <Building2 className="h-4 w-4 ml-2" />
                عرض العقارات
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/properties/new">
                <Plus className="h-4 w-4 ml-2" />
                إضافة عقار جديد
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إدارة المشاريع</CardTitle>
            <CardDescription>
              عرض وإدارة المخططات والقطع
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/projects">
                <MapPin className="h-4 w-4 ml-2" />
                عرض المشاريع
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/projects/new">
                <Plus className="h-4 w-4 ml-2" />
                إنشاء مشروع جديد
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات سريعة</CardTitle>
            <CardDescription>
              نظرة عامة على نشاط الموقع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">العقارات النشطة</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">العقارات المعلقة</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر تحديث</span>
                <span className="font-medium">الآن</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
