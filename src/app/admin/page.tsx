import { requireAdmin, getServerUser } from '@/lib/firebase/auth';
import { getDashboardStats, getRecentProperties, getRecentProjects } from '@/lib/dashboard-stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let user;
  try {
    user = await requireAdmin();
  } catch (error) {
    console.error('Admin access error:', error);
    redirect('/');
  }
  
  if (!user) {
    redirect('/');
  }

  // Fetch dashboard statistics
  const stats = await getDashboardStats();
  const recentProperties = await getRecentProperties(3);
  const recentProjects = await getRecentProjects(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مرحباً، {user.displayName || user.email}</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة التحكم</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
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
            <div className="text-2xl font-bold">{stats.newPropertiesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              مشروع نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القطع</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlots}</div>
            <p className="text-xs text-muted-foreground">
              قطعة في المخططات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات المتاحة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableProperties}</div>
            <p className="text-xs text-muted-foreground">
              متاح للبيع/الإيجار
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات المباعة</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.soldProperties}</div>
            <p className="text-xs text-muted-foreground">
              تم البيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات المؤجرة</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rentedProperties}</div>
            <p className="text-xs text-muted-foreground">
              تحت الإيجار
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
                <span className="font-medium">{stats.availableProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">العقارات المباعة</span>
                <span className="font-medium">{stats.soldProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر تحديث</span>
                <span className="font-medium text-xs">
                  {stats.lastUpdated.toLocaleTimeString('ar-SA')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              العقارات المضافة حديثاً
            </CardTitle>
            <CardDescription>
              آخر العقارات التي تم إضافتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <div className="space-y-3">
                {recentProperties.map((property: any) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{property.titleAr}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.city} • {property.price?.toLocaleString()} {property.currency}
                      </p>
                    </div>
                    <Badge variant={
                      property.status === 'available' ? 'default' :
                      property.status === 'sold' ? 'destructive' : 'secondary'
                    }>
                      {property.status === 'available' ? 'متاح' :
                       property.status === 'sold' ? 'مباع' : 'مؤجر'}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/properties">عرض جميع العقارات</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2" />
                <p>لا توجد عقارات مضافة حديثاً</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              المشاريع المضافة حديثاً
            </CardTitle>
            <CardDescription>
              آخر المشاريع التي تم إنشاؤها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.description || 'لا يوجد وصف'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      مشروع
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/projects">عرض جميع المشاريع</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>لا توجد مشاريع مضافة حديثاً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
