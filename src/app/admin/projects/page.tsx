'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Project } from '@/types/project';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [page, setPage] = useState(0);

  const loadProjects = async (isNext: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE + 1) // +1 to check if there's a next page
      );

      if (isNext && lastDoc) {
        q = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE + 1)
        );
      }

      const snap = await getDocs(q);
      const docs = snap.docs;
      
      // Check if there's a next page
      const hasNext = docs.length > ITEMS_PER_PAGE;
      if (hasNext) {
        docs.pop(); // Remove the extra doc
      }

      const data = docs.map(d => ({ id: d.id, ...d.data() } as Project));
      
      if (isNext) {
        setProjects(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      } else {
        setProjects(data);
        setPage(0);
      }

      setLastDoc(docs[docs.length - 1] || null);
      setHasNextPage(hasNext);
      setHasPrevPage(isNext ? true : page > 0);

    } catch (err) {
      console.error('Error loading projects:', err);
      setError('حدث خطأ أثناء تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleNextPage = () => {
    if (hasNextPage) {
      loadProjects(true);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      // For simplicity, reload from beginning
      loadProjects();
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">المشاريع السكنية</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المشاريع السكنية</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء مشروع جديد
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة المشاريع</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد مشاريع حالياً</p>
              <Button asChild className="mt-4">
                <Link href="/admin/projects/new">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء أول مشروع
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المشروع</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        {project.description ? 
                          `${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}` 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {project.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') ?? '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/projects/${project.id}`}>
                              <Edit className="h-4 w-4 ml-2" />
                              إدارة
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
                                // TODO: Implement delete functionality
                                alert('سيتم تنفيذ حذف المشروع قريباً');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  صفحة {page + 1} - {projects.length} مشروع
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage || loading}
                  >
                    <ChevronRight className="h-4 w-4 ml-2" />
                    السابق
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}