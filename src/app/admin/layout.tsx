import { getServerUser } from '@/lib/firebase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Building2, Plus } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="text-xl font-bold">لوحة التحكم</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="h-4 w-4 ml-2" />
                الموقع الرئيسي
              </Link>
            </Button>
            
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-2">
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/properties">
                  <Building2 className="h-4 w-4 ml-2" />
                  العقارات
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/properties/new">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء عقار جديد
                </Link>
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


