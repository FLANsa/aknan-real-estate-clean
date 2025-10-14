import { requireAdmin } from '@/lib/firebase/auth';
import { listProjects } from './actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Eye, Edit, Calendar } from 'lucide-react';

export default async function AdminProjectsPage() {
  const user = await requireAdmin();
  const result = await listProjects();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المشاريع</h1>
          <p className="text-muted-foreground">عرض وإدارة المخططات والقطع</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>خطأ في تحميل المشاريع: {result.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projects = result.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المشاريع</h1>
          <p className="text-muted-foreground">عرض وإدارة المخططات والقطع</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء مشروع جديد
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإنشاء مشروع جديد لإدارة المخططات والقطع
            </p>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="h-4 w-4 ml-2" />
                إنشاء مشروع جديد
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description || 'لا يوجد وصف'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {project.zoom}x
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 ml-2" />
                  <span>
                    {project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 ml-2" />
                  <span>
                    أنشئ في {project.createdAt.toLocaleDateString('ar-SA')}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/projects/${project.id}`}>
                      <Eye className="h-4 w-4 ml-1" />
                      عرض
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/projects/${project.id}`}>
                      <Edit className="h-4 w-4 ml-1" />
                      إدارة
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}