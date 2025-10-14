import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="أكنان القمة العقارية"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-bold">أكنان القمة العقارية</span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/properties" className="text-sm font-medium hover:text-primary">
            العقارات
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            من نحن
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            اتصل بنا
          </Link>
          <Button asChild>
            <Link href="/admin">لوحة التحكم</Link>
          </Button>
        </nav>
        </div>
      </div>
    </header>
  );
}

