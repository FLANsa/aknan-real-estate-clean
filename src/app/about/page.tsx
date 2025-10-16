import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  Shield, 
  Heart,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '9665XXXXXXXX';
  const wa = `https://wa.me/${whatsapp}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold">من نحن</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                أكنان القمة العقارية - شركة رائدة في مجال العقارات بالسعودية، نقدم حلولاً شاملة 
                وخدمات متميزة لعملائنا الكرام
              </p>
            </div>

            {/* Company Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">عن أكنان القمة العقارية</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    تأسست شركة أكنان القمة العقارية بهدف تقديم خدمات عقارية متطورة ومتميزة 
                    في المملكة العربية السعودية. نحن نؤمن بأن كل عميل يستحق الحصول على أفضل 
                    الخدمات والاستشارات العقارية المتخصصة.
                  </p>
                  <p>
                    فريقنا المختص يضم نخبة من الخبراء في مجال العقارات والتسويق العقاري، 
                    مما يمكننا من تقديم حلول مبتكرة تلبي احتياجات عملائنا المتنوعة.
                  </p>
                  <p>
                    نسعى لأن نكون الشريك الموثوق لعملائنا في رحلتهم العقارية، من خلال 
                    توفير معلومات دقيقة وخدمات احترافية تساهم في اتخاذ القرارات الصحيحة.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-muted-foreground">عقار متاح</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-sm text-muted-foreground">عميل راضي</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm text-muted-foreground">سنوات خبرة</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm text-muted-foreground">معدل النجاح</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mission, Vision, Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    رؤيتنا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    أن نكون الشركة الرائدة في مجال العقارات بالسعودية، معتمدين على الابتكار 
                    والتميز في الخدمة لتحقيق أحلام عملائنا العقارية.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    رسالتنا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    تقديم خدمات عقارية شاملة ومتميزة لعملائنا، مع التركيز على الشفافية 
                    والمهنية في كل تعامل، لضمان تجربة استثنائية تتفوق على التوقعات.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    قيمنا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      الشفافية والمصداقية
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      التميز في الخدمة
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      الابتكار والتطوير
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      رضا العملاء أولاً
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">خدماتنا</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  نقدم مجموعة شاملة من الخدمات العقارية المصممة خصيصاً لتلبية احتياجات عملائنا
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <Building2 className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">بيع وشراء العقارات</h3>
                    <p className="text-muted-foreground text-sm">
                      مساعدتك في العثور على العقار المناسب أو بيع عقارك بأفضل الأسعار
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <TrendingUp className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">تقييم العقارات</h3>
                    <p className="text-muted-foreground text-sm">
                      تقييم دقيق ومجاني لعقارك من قبل خبراء معتمدين في السوق العقاري
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">إدارة العقارات</h3>
                    <p className="text-muted-foreground text-sm">
                      خدمات إدارة شاملة للعقارات المؤجرة مع متابعة دورية
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <MapPin className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">الاستشارات العقارية</h3>
                    <p className="text-muted-foreground text-sm">
                      استشارات متخصصة لاتخاذ القرارات العقارية الصحيحة
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">الخدمات القانونية</h3>
                    <p className="text-muted-foreground text-sm">
                      مساعدة في إجراءات العقود والتراخيص القانونية
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Award className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">خدمات التمويل</h3>
                    <p className="text-muted-foreground text-sm">
                      ربطك بأفضل خيارات التمويل العقاري من البنوك المعتمدة
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Team Section */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">فريقنا</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
                  فريق من الخبراء المتخصصين في مجال العقارات والتسويق العقاري
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">فريق المبيعات</h3>
                    <p className="text-muted-foreground text-sm">
                      خبراء في التسويق العقاري مع سنوات من الخبرة في السوق السعودي
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">خبراء التقييم</h3>
                    <p className="text-muted-foreground text-sm">
                      معتمدون من الجهات الرسمية لتقييم العقارات بدقة وموضوعية
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">المستشارون القانونيون</h3>
                    <p className="text-muted-foreground text-sm">
                      محامين متخصصين في القانون العقاري لضمان سلامة المعاملات
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">هل تريد معرفة المزيد؟</h2>
                <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                  تواصل معنا اليوم للحصول على استشارة مجانية أو لمعرفة المزيد عن خدماتنا
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary" size="lg">
                    <Link href={wa} target="_blank" rel="noopener noreferrer">
                      تواصل عبر واتساب
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <Link href="/contact">
                      اتصل بنا
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


