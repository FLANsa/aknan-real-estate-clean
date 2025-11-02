import { requireAdmin } from '@/lib/firebase/auth';
import { getContactMessage } from '@/lib/admin-data';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusSelect } from '@/components/StatusSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Mail, Phone, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const { id } = await params;
  const contact = await getContactMessage(id);

  if (!contact) {
    redirect('/admin/contacts');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/contacts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل الرسالة</h1>
            <p className="text-muted-foreground">عرض تفاصيل رسالة الاتصال</p>
          </div>
        </div>
        <StatusSelect
          id={contact.id}
          currentStatus={contact.status}
          type="contact"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات المرسل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">الاسم</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{contact.email}</p>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{contact.phone}</p>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {contact.createdAt.toLocaleDateString('ar-SA')}
                </p>
                <p className="text-sm text-muted-foreground">
                  في {contact.createdAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              تفاصيل الرسالة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">نوع الاستفسار</h3>
              <StatusBadge status={contact.status} type="contact" />
              <p className="text-sm text-muted-foreground mt-1">
                {contact.subject}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">الرسالة</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {contact.readAt && (
              <div>
                <h3 className="font-medium mb-2">تاريخ القراءة</h3>
                <p className="text-sm text-muted-foreground">
                  {contact.readAt.toLocaleDateString('ar-SA')} في {contact.readAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            )}

            {contact.updatedAt && contact.updatedAt !== contact.createdAt && (
              <div>
                <h3 className="font-medium mb-2">آخر تحديث</h3>
                <p className="text-sm text-muted-foreground">
                  {contact.updatedAt.toLocaleDateString('ar-SA')} في {contact.updatedAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





