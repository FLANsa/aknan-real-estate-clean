import { Suspense } from 'react';
import { listAdminProperties } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
import { ar } from 'date-fns/locale';
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS, CURRENCY_LABELS } from '@/types/property';

interface AdminPropertiesPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

async function PropertiesTable({ searchParams }: AdminPropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || '';
  const pageParam = resolvedSearchParams.page || '1';
  const page = parseInt(pageParam) || 1;
  
  const result = await listAdminProperties({
    q,
    page,
    pageSize: 10,
  });

  if (!result.success) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {result.error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { properties, total, page: currentPage, totalPages } = result.data!;

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث في العقارات</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-2">
            <Input
              name="q"
              placeholder="ابحث بالعنوان أو المدينة..."
              defaultValue={q}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 ml-2" />
              بحث
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>العقارات ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد عقارات</p>
              <Button asChild className="mt-4">
                <Link href="/admin/properties/new">إنشاء عقار جديد</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التحديث</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        {property.titleAr}
                      </TableCell>
                      <TableCell>{property.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {PROPERTY_TYPE_LABELS[property.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {property.price.toLocaleString()} {CURRENCY_LABELS[property.currency]}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            property.status === 'available' ? 'default' :
                            property.status === 'sold' ? 'destructive' :
                            property.status === 'rented' ? 'secondary' : 'outline'
                          }
                        >
                          {PROPERTY_STATUS_LABELS[property.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(property.updatedAt, 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/properties/${property.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/properties/${property.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    asChild
                  >
                    <Link href={`/admin/properties?page=${currentPage - 1}${q ? `&q=${q}` : ''}`}>
                      السابق
                    </Link>
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    asChild
                  >
                    <Link href={`/admin/properties?page=${currentPage + 1}${q ? `&q=${q}` : ''}`}>
                      التالي
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPropertiesPage({ searchParams }: AdminPropertiesPageProps) {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري التحميل...</div>
        </CardContent>
      </Card>
    }>
      <PropertiesTable searchParams={searchParams} />
    </Suspense>
  );
}


