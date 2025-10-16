'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// Schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب').max(15, 'رقم الهاتف طويل جداً'),
  subject: z.enum(['general', 'property_inquiry', 'evaluation', 'support', 'other']),
  message: z.string().min(10, 'الرسالة قصيرة جداً').max(1000, 'الرسالة طويلة جداً'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SUBJECT_LABELS = {
  general: 'استفسار عام',
  property_inquiry: 'استفسار عن عقار',
  evaluation: 'طلب تقييم عقار',
  support: 'دعم فني',
  other: 'أخرى',
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '9665XXXXXXXX';
  const wa = `https://wa.me/${whatsapp}`;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: undefined,
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically send the data to your backend
      console.log('Contact form data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h1 className="text-2xl font-bold mb-4">تم إرسال رسالتك بنجاح</h1>
                <p className="text-muted-foreground mb-6">
                  شكراً لك على تواصلك معنا. سيتواصل معك فريقنا خلال 24 ساعة.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="mt-6"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="space-y-8 md:space-y-12">
            {/* Header */}
            <div className="text-center space-y-3 md:space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">اتصل بنا</h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                نحن هنا لمساعدتك في العثور على العقار المناسب أو الإجابة على أي استفسار
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    أرسل لنا رسالة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="الاسم الكامل"
                          autoComplete="name"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف *</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          placeholder="05xxxxxxxx"
                          autoComplete="tel"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="example@email.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">نوع الاستفسار *</Label>
                      <Select onValueChange={(value) => setValue('subject', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الاستفسار" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">الرسالة *</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="اكتب رسالتك هنا..."
                        rows={5}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 md:h-12 text-base md:text-lg"
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات التواصل</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">الهاتف</p>
                        <p className="text-muted-foreground">+966 5X XXX XXXX</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">البريد الإلكتروني</p>
                        <p className="text-muted-foreground">info@aknan.sa</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">العنوان</p>
                        <p className="text-muted-foreground">بريدة، القصيم، المملكة العربية السعودية</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">ساعات العمل</p>
                        <p className="text-muted-foreground">الأحد - الخميس: 8:00 ص - 6:00 م</p>
                        <p className="text-muted-foreground">الجمعة - السبت: مغلق</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

        <Card>
                  <CardHeader>
                    <CardTitle>تواصل معنا مباشرة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      للحصول على استجابة سريعة، يمكنك التواصل معنا عبر:
                    </p>
                    
                    <div className="space-y-3">
                      <Button asChild className="w-full">
                        <Link href={wa} target="_blank" rel="noopener noreferrer">
                          واتساب
                        </Link>
              </Button>
                      
                      <Button variant="outline" asChild className="w-full">
                        <Link href="tel:+966500000000">
                          اتصل الآن
                        </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>خدماتنا</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>• تقييم العقارات مجاناً</p>
                      <p>• استشارات عقارية متخصصة</p>
                      <p>• إدارة العقارات</p>
                      <p>• خدمات التمويل العقاري</p>
                      <p>• خدمات القانونية</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


