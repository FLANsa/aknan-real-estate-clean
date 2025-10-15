import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
        <section className="relative h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <div className="w-full h-full bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 text-center text-white space-y-6 max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              اكتشف منزل أحلامك
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              مع أكنان القمة العقارية، نقدم لك أفضل العقارات في المملكة العربية السعودية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link href="/properties">استكشف العقارات</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/contact">اطلب تقييم عقارك</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">عقار متاح</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">عميل راضٍ</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">سنة خبرة</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">مدينة</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties Carousel */}
        <FeaturedPropertiesCarousel />
      </main>
      
      <Footer />
    </div>
  );
}
