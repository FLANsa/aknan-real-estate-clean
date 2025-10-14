import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '9665XXXXXXXX';
  const wa = `https://wa.me/${whatsapp}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8 max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold">اتصل بنا</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">يسعدنا تواصلك معنا لأي استفسار.</p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={wa} target="_blank" rel="noopener noreferrer">واتساب</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="tel:+966500000000">اتصل الآن</Link>
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


