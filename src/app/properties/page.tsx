import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import PropertiesListClient from '@/components/PropertiesListClient';

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">العقارات المتاحة</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                اكتشف مجموعة واسعة من العقارات المتاحة للبيع والإيجار
              </p>
            </div>
          
            <Suspense fallback={
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">جاري التحميل...</div>
                </CardContent>
              </Card>
            }>
              <PropertiesListClient searchParams={resolvedSearchParams} />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
