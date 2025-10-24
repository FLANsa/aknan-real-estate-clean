import { requireAdmin } from '@/lib/firebase/auth';
import { getEvaluationRequests, getEvaluationStats } from '@/lib/admin-data';
import { EvaluationRequest } from '@/types/evaluation';
import { StatusBadge } from '@/components/StatusBadge';
import EvaluationStatusSelect from '@/components/EvaluationStatusSelect';
import StatusSelectClient from '@/components/StatusSelectClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Filter, Eye, Home } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EvaluationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EvaluationsPage({ searchParams }: EvaluationsPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status as string || 'all';
  
  const evaluations = await getEvaluationRequests(undefined, statusFilter === 'all' ? undefined : statusFilter as any);
  const stats = await getEvaluationStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلبات التقييم</h1>
          <p className="text-muted-foreground">إدارة طلبات تقييم العقارات</p>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            إجمالي الطلبات: {stats.total}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مجدولة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <StatusSelectClient
              currentStatus={statusFilter}
              baseUrl="/admin/evaluations"
              statuses={[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'new', label: 'جديد' },
                { value: 'scheduled', label: 'مجدول' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            {evaluations.length} طلب {statusFilter !== 'all' ? `في حالة ${statusFilter}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evaluations.length > 0 ? (
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{evaluation.ownerName}</h3>
                      <StatusBadge status={evaluation.status} type="evaluation" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.ownerPhone} • {evaluation.ownerEmail}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {evaluation.propertyType}
                      </span>
                      <span>{evaluation.city} - {evaluation.district}</span>
                      <span>{evaluation.areaM2} م²</span>
                    </div>
                    {evaluation.description && (
                      <p className="text-sm text-muted-foreground">
                        {evaluation.description.substring(0, 100)}...
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {evaluation.createdAt.toLocaleDateString('ar-SA')} في {evaluation.createdAt.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <EvaluationStatusSelect
                      id={evaluation.id}
                      currentStatus={evaluation.status}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/evaluations/${evaluation.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
              <p>لم يتم العثور على طلبات تطابق المعايير المحددة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
