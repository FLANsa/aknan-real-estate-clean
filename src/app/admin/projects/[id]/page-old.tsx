import { requireAdmin } from '@/lib/firebase/auth';
import { getProject } from '../actions';
import { getProjectPlots, getAvailableProperties } from './actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Eye, BarChart3, Calendar } from 'lucide-react';
import { PLOT_STATUS_LABELS, PLOT_STATUS_COLORS } from '@/types/map';
import InteractiveMap from '@/components/InteractiveMap';
import PlotForm from '@/components/PlotForm';
import { Plot } from '@/types/map';

interface ProjectManagementPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectManagementPage({ params }: ProjectManagementPageProps) {
  const user = await requireAdmin();
  const resolvedParams = await params;
  
  const projectResult = await getProject(resolvedParams.id);
  const plotsResult = await getProjectPlots(resolvedParams.id);
  const propertiesResult = await getAvailableProperties();

  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const plots = plotsResult.success ? plotsResult.data || [] : [];
  const availableProperties = propertiesResult.success ? propertiesResult.data || [] : [];

  // Calculate statistics
  const stats = {
    total: plots.length,
    available: plots.filter(p => p.status === 'available').length,
    sold: plots.filter(p => p.status === 'sold').length,
    reserved: plots.filter(p => p.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || 'لا يوجد وصف'}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}`}>
              <Eye className="h-4 w-4 ml-2" />
              عرض عام
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/projects">
              العودة للمشاريع
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القطع</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">قطعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متاح</CardTitle>
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: PLOT_STATUS_COLORS.available }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">قطعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مباع</CardTitle>
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: PLOT_STATUS_COLORS.sold }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sold}</div>
            <p className="text-xs text-muted-foreground">قطعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محجوز</CardTitle>
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: PLOT_STATUS_COLORS.reserved }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reserved}</div>
            <p className="text-xs text-muted-foreground">قطعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المشروع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>
                <strong>الموقع:</strong> {project.location.lat.toFixed(6)}, {project.location.lng.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <BarChart3 className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>
                <strong>مستوى التكبير:</strong> {project.zoom}x
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>
                <strong>تاريخ الإنشاء:</strong> {project.createdAt.toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>
                <strong>آخر تحديث:</strong> {project.updatedAt.toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>الخريطة التفاعلية</CardTitle>
          <CardDescription>
            اضغط على الخريطة لرسم القطع الجديدة أو انقر على القطع الموجودة لعرض التفاصيل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveMap
            project={project}
            plots={plots}
            mode="edit"
            className="rounded-lg border"
          />
        </CardContent>
      </Card>

      {/* Plots List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة القطع</CardTitle>
              <CardDescription>
                عرض وإدارة جميع قطع المشروع
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة قطعة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plots.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد قطع</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ برسم القطع على الخريطة أعلاه
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PLOT_STATUS_COLORS[plot.status] }}
                      />
                      <span className="font-medium">القطعة {plot.number}</span>
                    </div>
                    <Badge variant="outline">
                      {PLOT_STATUS_LABELS[plot.status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {plot.price.toLocaleString()} {plot.currency}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plot.dimensions.area.toFixed(0)} م²
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm">
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
