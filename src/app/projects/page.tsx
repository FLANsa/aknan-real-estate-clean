'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Project } from '@/types/map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Users } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
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
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">المشاريع السكنية</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                اكتشف مشاريعنا السكنية المتميزة والعقارات المتاحة في كل مشروع
              </p>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع بعد</h3>
                  <p className="text-muted-foreground">
                    سنقوم بإضافة مشاريع جديدة قريباً
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-500 to-blue-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white/50" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                          {project.plotsCount} قطعة
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-600 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">إجمالي القطع:</span>
                          <span className="font-medium">{project.plotsCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">القطع المتاحة:</span>
                          <span className="font-medium text-green-600">{project.availablePlotsCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">القطع المباعة:</span>
                          <span className="font-medium text-red-600">
                            {project.plotsCount - project.availablePlotsCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Button asChild className="w-full">
                          <Link href={`/projects/${project.id}`}>
                            <MapPin className="h-4 w-4 ml-2" />
                            عرض المشروع
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
