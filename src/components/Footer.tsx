import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">أكنان القمة العقارية</h3>
            <p className="text-sm text-muted-foreground">
              نقدم أفضل العقارات في المملكة العربية السعودية مع ضمان الجودة والخدمة المتميزة.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties" className="hover:text-primary">العقارات</Link></li>
              <li><Link href="/about" className="hover:text-primary">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-primary">اتصل بنا</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">خدماتنا</h4>
            <ul className="space-y-2 text-sm">
              <li>بيع العقارات</li>
              <li>إيجار العقارات</li>
              <li><Link href="/evaluation" className="hover:text-primary">تقييم العقارات</Link></li>
              <li>الاستشارات العقارية</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">معلومات الاتصال</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>الرياض، المملكة العربية السعودية</li>
              <li>الهاتف: +966 5X XXX XXXX</li>
              <li>البريد الإلكتروني: info@aknan.sa</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t text-center text-xs md:text-sm text-muted-foreground">
          <p>&copy; 2024 أكنان القمة العقارية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

