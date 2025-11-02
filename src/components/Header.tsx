'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronLeft } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  
  const toggle = () => setOpen(v => !v);
  const close = () => setOpen(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      window.addEventListener("keydown", onKey);
      setTimeout(() => firstLinkRef.current?.focus(), 0);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-32 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center group">
            <div className="relative flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="أكنان القمة العقارية"
                width={800}
                height={800}
                className="group-hover:scale-105 transition-transform duration-300 object-contain"
                style={{ maxHeight: '256px', width: 'auto' }}
              />
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggle}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl
                       bg-aknan-500 hover:bg-aknan-600 text-white border border-aknan-500
                       focus:outline-none focus:ring-2 focus:ring-aknan-400 focus:ring-offset-2 focus:ring-offset-black"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            aria-controls="drawer-menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/properties" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">العقارات</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/projects" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">المشاريع السكنية</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/map" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">الخريطة العقارية</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/evaluation" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">تقييم العقار</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/about" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">من نحن</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/contact" 
              className="relative group px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-aknan-400 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">اتصل بنا</span>
              <div className="absolute inset-0 bg-gradient-to-r from-aknan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </nav>
        </div>

        {/* DRAWER – لوح جانبي يمين ملء الشاشة */}
        {open && (
          <div
            id="drawer-menu"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.target === e.currentTarget && close()}
            className="fixed inset-0 z-50"
          >
            {/* خلفية بتدرج وهوية */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_20%_20%,black,transparent_60%)]">
              <div className="absolute left-0 top-0 h-72 w-72 rounded-full blur-3xl opacity-30 bg-aknan-500" />
              <div className="absolute right-1/3 bottom-0 h-52 w-52 rounded-full blur-3xl opacity-20 bg-aknan-600" />
            </div>

            {/* اللوح */}
            <aside
              className="absolute inset-y-0 left-0 w-[92%] xs:w-[86%] max-w-sm
                         bg-gradient-to-b from-neutral-950/95 to-neutral-900/90
                         border-r border-white/10 shadow-2xl
                         animate-[slideInLeft_.25s_ease-out] focus:outline-none"
            >
              {/* رأس اللوح */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-white font-semibold">القائمة</span>
                <button
                  onClick={close}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                             bg-white/5 hover:bg-white/10 text-white
                             focus:outline-none focus:ring-2 focus:ring-aknan-400"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>


              {/* روابط الأساسية – بطاقات زجاجية */}
              <nav className="px-2 space-y-2">
                <MenuItem href="/properties" onClick={close} refEl={firstLinkRef}>
                  العقارات
                </MenuItem>
                <MenuItem href="/projects" onClick={close}>
                  المشاريع السكنية
                </MenuItem>
                <MenuItem href="/map" onClick={close}>الخريطة العقارية</MenuItem>
                <MenuItem href="/evaluation" onClick={close}>تقييم العقار</MenuItem>
                <MenuItem href="/about" onClick={close}>من نحن</MenuItem>
                <MenuItem href="/contact" onClick={close}>اتصل بنا</MenuItem>
              </nav>

              {/* CTA ملوّن */}
              <div className="px-4 pt-3">
                <Link
                  href="/contact"
                  onClick={close}
                  className="block text-center rounded-2xl px-4 py-3 font-semibold
                             bg-aknan-500 hover:bg-aknan-600 text-white
                             shadow-lg shadow-black/30 border border-aknan-500
                             focus:outline-none focus:ring-2 focus:ring-aknan-400"
                >
                  احجز تقييم مجاني الآن
                </Link>
              </div>

              {/* روابط سريعة/سوشال */}
              <div className="mt-auto px-4 py-4 border-t border-white/10 text-sm text-white/70">
                <div className="flex items-center justify-center gap-4">
                  <a href="tel:+966000000000" className="hover:text-aknan-400">اتصال</a>
                  <span className="opacity-50">•</span>
                  <a href="mailto:info@aknan.sa" className="hover:text-aknan-400">البريد</a>
                  <span className="opacity-50">•</span>
                  <a href="#" className="hover:text-aknan-400">واتساب</a>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
}

/* عنصر رابط كبطاقة */
function MenuItem({
  href,
  children,
  onClick,
  refEl,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  refEl?: React.MutableRefObject<HTMLAnchorElement | null>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      ref={refEl as any}
      className="group flex items-center justify-between rounded-2xl px-4 py-4
                 bg-white/5 hover:bg-aknan-500/10 text-white
                 border border-white/10 hover:border-aknan-500/40
                 focus:outline-none focus:ring-2 focus:ring-aknan-400"
    >
      <span className="text-lg font-medium">{children}</span>
      <ChevronLeft className="h-5 w-5 text-white/60 group-hover:text-aknan-400 transition-colors" />
    </Link>
  );
}

