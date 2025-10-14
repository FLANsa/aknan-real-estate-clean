import { getPublicProject, getPublicProjectPlots } from './actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BarChart3, Calendar, Phone, MessageCircle } from 'lucide-react';
import { PLOT_STATUS_LABELS, PLOT_STATUS_COLORS } from '@/types/map';
import InteractiveMap from '@/components/InteractiveMap';
import { formatArea, formatPerimeter } from '@/lib/google-maps';

interface PublicProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PublicProjectPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getPublicProject(resolvedParams.id);
  
  if (!result.success || !result.data) {
    return {
      title: 'المشروع غير موجود',
    };
  }

  const project = result.data;
  
  return {
    title: project.name,
    description: project.description || `مشروع ${project.name} - عرض القطع المتاحة`,
  };
}

export default async function PublicProjectPage({ params }: PublicProjectPageProps) {
  const resolvedParams = await params;
  
  const projectResult = await getPublicProject(resolvedParams.id);
  const plotsResult = await getPublicProjectPlots(resolvedParams.id);

  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const allPlots = plotsResult.success ? plotsResult.data || [] : [];
  
  // Filter to show only available plots to public
  const availablePlots = allPlots.filter(plot => plot.status === 'available');

  // Calculate statistics
  const stats = {
    total: allPlots.length,
    available: availablePlots.length,
    sold: allPlots.filter(p => p.status === 'sold').length,
    reserved: allPlots.filter(p => p.status === 'reserved').length,
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP;
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Project Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {project.description}
              </p>
            )}
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

          {/* Interactive Map */}
          <Card>
            <CardHeader>
              <CardTitle>خريطة المشروع</CardTitle>
              <CardDescription>
                انقر على القطع المتاحة لعرض التفاصيل والسعر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveMap
                project={project}
                plots={availablePlots}
                mode="view"
                className="rounded-lg border"
              />
            </CardContent>
          </Card>

          {/* Available Plots */}
          <Card>
            <CardHeader>
              <CardTitle>القطع المتاحة</CardTitle>
              <CardDescription>
                عرض القطع المتاحة للبيع مع التفاصيل والأسعار
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availablePlots.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد قطع متاحة</h3>
                  <p className="text-muted-foreground">
                    جميع القطع في هذا المشروع تم بيعها أو حجزها
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availablePlots.map((plot) => (
                    <Card key={plot.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">القطعة {plot.number}</CardTitle>
                          <Badge style={{ backgroundColor: PLOT_STATUS_COLORS[plot.status] }}>
                            {PLOT_STATUS_LABELS[plot.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">السعر:</span>
                            <span className="font-medium">
                              {plot.price.toLocaleString()} {plot.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">المساحة:</span>
                            <span className="font-medium">{formatArea(plot.dimensions.area)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">المحيط:</span>
                            <span className="font-medium">{formatPerimeter(plot.dimensions.perimeter)}</span>
                          </div>
                        </div>

                        {plot.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>ملاحظات:</strong> {plot.notes}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {whatsappNumber && (
                            <Button
                              asChild
                              size="sm"
                              className="flex-1"
                              style={{ backgroundColor: '#25D366' }}
                            >
                              <a
                                href={`https://wa.me/${whatsappNumber}?text=مرحباً، أريد الاستفسار عن القطعة ${plot.number} في مشروع ${project.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-4 w-4 ml-1" />
                                واتساب
                              </a>
                            </Button>
                          )}
                          {phoneNumber && (
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <a href={`tel:${phoneNumber}`}>
                                <Phone className="h-4 w-4 ml-1" />
                                اتصال
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle>تواصل معنا</CardTitle>
              <CardDescription>
                للاستفسار عن القطع المتاحة أو طلب معلومات إضافية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">موقع المشروع</p>
                      <p className="text-sm text-muted-foreground">
                        {project.location.lat.toFixed(6)}, {project.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">تاريخ الإنشاء</p>
                      <p className="text-sm text-muted-foreground">
                        {project.createdAt.toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {whatsappNumber && (
                    <Button
                      asChild
                      className="w-full"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=مرحباً، أريد الاستفسار عن مشروع ${project.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 ml-2" />
                        تواصل عبر واتساب
                      </a>
                    </Button>
                  )}
                  {phoneNumber && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={`tel:${phoneNumber}`}>
                        <Phone className="h-4 w-4 ml-2" />
                        اتصل بنا
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
