'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProject } from '../actions';
import { getProjectPlots, getAvailableProperties, createPlot, updatePlot, deletePlot } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Eye, BarChart3, Calendar, Edit, Trash2 } from 'lucide-react';
import { PLOT_STATUS_LABELS, PLOT_STATUS_COLORS } from '@/types/map';
import InteractiveMap from '@/components/InteractiveMap';
import PlotForm from '@/components/PlotForm';
import { formatArea, formatPerimeter } from '@/lib/google-maps';
import { Plot, Coordinates, Project } from '@/types/map';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProjectManagementPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectManagementPage({ params }: ProjectManagementPageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Array<{ id: string; titleAr: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectId = params.then(p => p.id);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        const [projectResult, plotsResult, propertiesResult] = await Promise.all([
          getProject(projectId),
          getProjectPlots(projectId),
          getAvailableProperties(),
        ]);

        if (!projectResult.success || !projectResult.data) {
          setError('المشروع غير موجود');
          return;
        }

        setProject(projectResult.data);
        setPlots(plotsResult.success ? plotsResult.data || [] : []);
        setAvailableProperties(propertiesResult.success ? propertiesResult.data || [] : []);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  const handlePlotDraw = useCallback(async (polygon: Coordinates[], plotNumber: string) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const result = await createPlot({
        projectId: project.id,
        number: plotNumber,
        status: 'available',
        price: 0,
        currency: 'SAR',
        polygon,
        dimensions: {
          area: 0, // Will be calculated by the server
          perimeter: 0,
        },
        notes: '',
      });

      if (result.success && result.data) {
        setPlots(prev => [...prev, result.data!]);
        setSelectedPlot(null);
        setShowPlotForm(false);
      } else {
        setError(result.error || 'فشل إنشاء القطعة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء القطعة');
      console.error('Error creating plot:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [project]);

  const handlePlotClick = useCallback((plot: Plot) => {
    setSelectedPlot(plot);
    setShowPlotForm(true);
  }, []);

  const handlePlotUpdate = useCallback(async (updatedPlot: Plot) => {
    setIsSubmitting(true);
    try {
      const result = await updatePlot(updatedPlot.id, updatedPlot);
      if (result.success && result.data) {
        setPlots(prev => prev.map(p => p.id === updatedPlot.id ? result.data! : p));
        setSelectedPlot(null);
        setShowPlotForm(false);
      } else {
        setError(result.error || 'فشل تحديث القطعة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث القطعة');
      console.error('Error updating plot:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handlePlotDelete = useCallback(async (plotId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه القطعة؟')) return;

    setIsSubmitting(true);
    try {
      const result = await deletePlot(plotId);
      if (result.success) {
        setPlots(prev => prev.filter(p => p.id !== plotId));
        setSelectedPlot(null);
        setShowPlotForm(false);
      } else {
        setError(result.error || 'فشل حذف القطعة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء حذف القطعة');
      console.error('Error deleting plot:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleCancelPlotForm = useCallback(() => {
    setSelectedPlot(null);
    setShowPlotForm(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>المشروع غير موجود</AlertDescription>
      </Alert>
    );
  }

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
        <Button variant="outline" onClick={() => router.push('/admin/projects')}>
          العودة للمشاريع
        </Button>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القطع</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Badge style={{ backgroundColor: PLOT_STATUS_COLORS.available }} className="h-5 w-5 flex items-center justify-center text-white"></Badge>
              <div>
                <p className="text-sm text-muted-foreground">متاحة</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Badge style={{ backgroundColor: PLOT_STATUS_COLORS.sold }} className="h-5 w-5 flex items-center justify-center text-white"></Badge>
              <div>
                <p className="text-sm text-muted-foreground">مباعة</p>
                <p className="text-2xl font-bold">{stats.sold}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Badge style={{ backgroundColor: PLOT_STATUS_COLORS.reserved }} className="h-5 w-5 flex items-center justify-center text-white"></Badge>
              <div>
                <p className="text-sm text-muted-foreground">محجوزة</p>
                <p className="text-2xl font-bold">{stats.reserved}</p>
              </div>
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
            onPlotDraw={handlePlotDraw}
            onPlotClick={handlePlotClick}
            onPlotUpdate={handlePlotUpdate}
            onPlotDelete={handlePlotDelete}
            selectedPlotId={selectedPlot?.id}
            className="rounded-lg border"
          />
        </CardContent>
      </Card>

      {/* Plot Form */}
      {showPlotForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPlot ? `تعديل القطعة: ${selectedPlot.number}` : 'إضافة قطعة جديدة'}
            </CardTitle>
            <CardDescription>
              {selectedPlot ? 'تعديل تفاصيل القطعة المختارة.' : 'أدخل تفاصيل القطعة الجديدة بعد رسمها على الخريطة.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlotForm
              initialData={selectedPlot || undefined}
              projectId={project.id}
              properties={availableProperties}
              onSubmit={selectedPlot ? handlePlotUpdate : handlePlotDraw}
              onCancel={handleCancelPlotForm}
              isSubmitting={isSubmitting}
              error={error}
            />
          </CardContent>
        </Card>
      )}

      {/* Plots List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة القطع</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowPlotForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة قطعة جديدة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {plots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p>لا توجد قطع في هذا المشروع حتى الآن</p>
              <p className="text-sm">ارسم قطعة على الخريطة أو اضغط على "إضافة قطعة جديدة"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القطعة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المساحة</TableHead>
                  <TableHead>المحيط</TableHead>
                  <TableHead>مرتبط بعقار</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plots.map((plot) => (
                  <TableRow key={plot.id}>
                    <TableCell className="font-medium">{plot.number}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: PLOT_STATUS_COLORS[plot.status] }} className="text-white">
                        {PLOT_STATUS_LABELS[plot.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{plot.price.toLocaleString()} {plot.currency}</TableCell>
                    <TableCell>{formatArea(plot.dimensions.area)}</TableCell>
                    <TableCell>{formatPerimeter(plot.dimensions.perimeter)}</TableCell>
                    <TableCell>
                      {plot.propertyId ? (
                        <Badge variant="outline">{plot.propertyId}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePlotClick(plot)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handlePlotDelete(plot.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
