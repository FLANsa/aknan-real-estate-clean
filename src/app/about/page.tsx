import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold">من نحن</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          أكنان القمة العقارية شركة متخصصة في بيع وشراء وإدارة العقارات في المملكة العربية السعودية.
          نسعى لتقديم تجربة مميزة لعملائنا عبر توفير أفضل الخيارات العقارية وخدمات ما بعد البيع.
        </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


