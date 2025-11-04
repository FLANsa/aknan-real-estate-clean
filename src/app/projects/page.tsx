'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Project } from '@/types/project';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { logger } from '@/lib/performance';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
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
        logger.error('Error loading projects:', err);
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">المشاريع السكنية</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                اكتشف مشاريعنا السكنية المتميزة في أفضل المواقع
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">لا توجد مشاريع حالياً</h2>
                <p className="text-muted-foreground">
                  سنقوم بإضافة مشاريع جديدة قريباً
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {project.name}
                          </CardTitle>
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 ml-1" />
                            مشروع
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.description && (
                          <p className="text-muted-foreground line-clamp-3">
                            {project.description.length > 150 
                              ? `${project.description.substring(0, 150)}...` 
                              : project.description
                            }
                          </p>
                        )}
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 ml-2" />
                          {project.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') ?? 'تاريخ غير محدد'}
                        </div>

                        <Button asChild className="w-full">
                          <Link href={`/projects/${project.id}`}>
                            عرض التفاصيل
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {(hasNextPage || hasPrevPage) && (
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevPage}
                      disabled={!hasPrevPage || loading}
                    >
                      <ChevronRight className="h-4 w-4 ml-2" />
                      السابق
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      صفحة {page + 1}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleNextPage}
                      disabled={!hasNextPage || loading}
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}




