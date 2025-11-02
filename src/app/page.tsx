'use client';

import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Eye, 
  Target, 
  Award, 
  Building2, 
  CheckCircle, 
  Shield, 
  Landmark,
  Home as HomeIcon,
  Settings,
  TrendingUp,
  FileCheck,
  Users,
  Zap,
  Award as Trophy,
  Building,
  Wrench,
  BarChart
} from 'lucide-react';

// Lazy load heavy components
const FeaturedPropertiesCarousel = dynamic(
  () => import("@/components/FeaturedPropertiesCarousel"),
  {
    loading: () => (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">العقارات المميزة</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة لدينا
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border p-6 space-y-4 animate-pulse">
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden pt-32">
          <div className="absolute inset-0">
            <video
              id="hero-video-1"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-105 transition-opacity duration-3000 ease-in-out"
              poster="/hero.jpg"
              preload="metadata"
              onEnded={() => {
                const video1 = document.getElementById('hero-video-1') as HTMLVideoElement;
                const video2 = document.getElementById('hero-video-2') as HTMLVideoElement;
                if (video1 && video2) {
                  setTimeout(() => {
                    video1.style.opacity = '0';
                    video2.style.opacity = '1';
                    video2.play();
                  }, 100);
                }
              }}
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              {/* Fallback للصورة إذا لم يعمل الفيديو */}
              <div className="w-full h-full bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat" />
            </video>
            <video
              id="hero-video-2"
              muted
              playsInline
              className="w-full h-full object-cover scale-105 transition-opacity duration-3000 ease-in-out absolute inset-0 opacity-0"
              preload="metadata"
              onEnded={() => {
                const video1 = document.getElementById('hero-video-1') as HTMLVideoElement;
                const video2 = document.getElementById('hero-video-2') as HTMLVideoElement;
                if (video1 && video2) {
                  setTimeout(() => {
                    video2.style.opacity = '0';
                    video1.style.opacity = '1';
                    video1.currentTime = 0;
                    video1.play();
                  }, 100);
                }
              }}
            >
              <source src="/hero-video-2.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
          </div>
          <div className="relative z-10 text-center text-white space-y-4 md:space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              اكتشف منزل أحلامك
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100">
              مع أكنان القمة العقارية، نقدم لك أفضل العقارات في المملكة العربية السعودية
            </p>
          </div>
        </section>

        {/* Vision, Mission, Values Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">رؤيتنا رسالتنا قيمنا</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  نؤمن بالعمل وفق معايير عالية من الجودة والشفافية
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Vision */}
                <AnimatedSection delay={0.1}>
                  <Card className="h-full relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">رؤيتنا</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        أن نكون النموذج الأمثل للتطوير العقاري في المملكة، عبر تقديم مشاريع عقارية ذات جودة عالية، وخلق مجتمعات عمرانية متكاملة تواكب متطلبات التنمية المستدامة
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Mission */}
                <AnimatedSection delay={0.2}>
                  <Card className="h-full relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">رسالتنا</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        العمل على تطوير مشاريع سكنية وتجارية متكاملة البنية والخدمات، وفق أعلى المعايير الهندسية والتنظيمية، بما يحقق قيمة مضافة للملاك والمستثمرين، ويسهم في رفع جودة الحياة للمجتمع
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Values */}
                <AnimatedSection delay={0.3}>
                  <Card className="h-full relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">قيمنا</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>الموثوقية النظامية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>الجودة التنفيذية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>الشفافية والحوكمة</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>الابتكار والتطوير</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* About Company Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">نبذة عن الشركة</h2>
              </div>
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      نحن شركة متخصصة في التطوير العقاري، حاصلة على التراخيص الرسمية والمعتمدة من الجهات المختصة، مما يؤهلنا لتقديم خدمات عقارية متكاملة ومضمونة وفقاً للأطر النظامية المعمول بها.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <FileCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">ترخيص مطور مؤهل للمساهمات العقارية</h3>
                          <p className="text-sm text-muted-foreground">من الهيئة العامة للعقار</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">تأهيل رسمي لمشاريع البيع على الخارطة</h3>
                          <p className="text-sm text-muted-foreground">نظام (وافي)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">ترخيص التسويق العقاري</h3>
                          <p className="text-sm text-muted-foreground">معتمد من الجهات المختصة</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">إدارة وتطوير الأملاك الخاصة</h3>
                          <p className="text-sm text-muted-foreground">والمشاريع المملوكة للشركة</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 p-4 bg-primary/5 border-r-4 border-primary rounded">
                      <p className="text-muted-foreground">
                        نلتزم بأعلى معايير الحوكمة والشفافية في جميع أعمالنا، مما يضمن الثقة والأمان لجميع عملائنا وشركائنا.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  نقدم مجموعة شاملة من الخدمات العقارية المتخصصة
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatedSection delay={0.1}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>تطوير وتنفيذ مشاريع البنية التحتية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        تطوير البنية التحتية الشاملة للمشاريع العقارية
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>إدارة وتنفيذ المساهمات العقارية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        وفق الأطر النظامية المعتمدة من الهيئة العامة للعقار
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <BarChart className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>تطوير وتسويق المشاريع بنظام البيع على الخارطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        نظام (وافي) المعتمد من الجهات المختصة
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>إدارة وتطوير الأملاك الخاصة والمشاريع الاستثمارية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        إدارة احترافية للمشاريع الاستثمارية
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Real Estate Contributions Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Landmark className="h-8 w-8 text-primary" />
                      <CardTitle className="text-2xl md:text-3xl">المساهمات العقارية</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      نحن مطورون مؤهلون للمساهمات العقارية من الهيئة العامة للعقار، ملتزمون بتطبيق جميع الأطر النظامية لضمان حماية أموال المساهمين وتحقيق عوائد استثمارية مجزية.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">إشراف مباشر على جميع مراحل التنفيذ</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">حماية أموال المساهمين وفق الأنظمة</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">دراسات جدوى شاملة ودقيقة</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">إدارة احترافية ومتابعة مستمرة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Off-Plan Sales Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">البيع على الخارطة</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  نظام (وافي) المضمون لحماية حقوق العملاء
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedSection delay={0.1}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>ضمان حقوق العملاء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        عبر الحسابات البنكية المخصصة والمراقبة من الجهات المختصة
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <HomeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>منتجات عقارية متنوعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        بأسعار منافسة وخطط دفع مرنة
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>تسريع دورة التطوير</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        ضمان استمرارية التمويل وتسريع إنجاز المشاريع
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Achievements Section */}
        <AnimatedSection>
          <section className="py-16 md:py-24 bg-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">الإنجازات</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  رحلة من الإنجازات والتطوير المستمر
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <AnimatedSection delay={0.1}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <HomeIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">تنفيذ وتطوير فلل سكنية</h3>
                          <p className="text-muted-foreground text-sm">بمواصفات عصرية وحديثة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BarChart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">تجاوز حاجز 750,000 م²</h3>
                          <p className="text-muted-foreground text-sm">من المساحات المنجزة وقيد التطوير</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">إنشاء شقق سكنية</h3>
                          <p className="text-muted-foreground text-sm">ضمن مجتمعات متكاملة الخدمات</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">تطوير بنية تحتية شاملة</h3>
                          <p className="text-muted-foreground text-sm">طرق، كهرباء، مياه، صرف صحي، اتصالات، إنارة عامة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Featured Properties Carousel */}
        <FeaturedPropertiesCarousel />
      </main>
      
      <Footer />
    </div>
  );
}
