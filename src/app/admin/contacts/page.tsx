import { requireAdmin } from '@/lib/firebase/auth';
import { getContactMessages, getContactStats } from '@/lib/admin-data';
import { ContactMessage } from '@/types/contact';
import { StatusBadge } from '@/components/StatusBadge';
import ContactStatusSelect from '@/components/ContactStatusSelect';
import StatusSelectClient from '@/components/StatusSelectClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Filter, Eye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ContactsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status as string || 'all';
  
  const contacts = await getContactMessages(undefined, statusFilter === 'all' ? undefined : statusFilter as any);
  const stats = await getContactStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">رسائل الاتصال</h1>
          <p className="text-muted-foreground">إدارة رسائل العملاء والاستفسارات</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            إجمالي الرسائل: {stats.total}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
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
            <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
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
              baseUrl="/admin/contacts"
              statuses={[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'new', label: 'جديد' },
                { value: 'in_progress', label: 'قيد المعالجة' },
                { value: 'replied', label: 'تم الرد' },
                { value: 'completed', label: 'مكتمل' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الرسائل</CardTitle>
          <CardDescription>
            {contacts.length} رسالة {statusFilter !== 'all' ? `في حالة ${statusFilter}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{contact.name}</h3>
                      <StatusBadge status={contact.status} type="contact" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contact.email} • {contact.phone}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">الموضوع:</span> {contact.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contact.message.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.createdAt.toLocaleDateString('ar-SA')} في {contact.createdAt.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ContactStatusSelect
                      id={contact.id}
                      currentStatus={contact.status}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/contacts/${contact.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد رسائل</h3>
              <p>لم يتم العثور على رسائل تطابق المعايير المحددة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
