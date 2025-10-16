'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden"
            aria-label="فتح القائمة"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="text-sm font-medium hover:text-primary">
              العقارات
            </Link>
            <Link href="/map" className="text-sm font-medium hover:text-primary">
              الخريطة العقارية
            </Link>
            <Link href="/evaluation" className="text-sm font-medium hover:text-primary">
              تقييم العقار
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t">
              <Link
                href="/properties"
                className="block px-3 py-2 text-base font-medium hover:text-primary hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                العقارات
              </Link>
              <Link
                href="/map"
                className="block px-3 py-2 text-base font-medium hover:text-primary hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                الخريطة العقارية
              </Link>
              <Link
                href="/evaluation"
                className="block px-3 py-2 text-base font-medium hover:text-primary hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                تقييم العقار
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium hover:text-primary hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                من نحن
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium hover:text-primary hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                اتصل بنا
              </Link>
              <div className="px-3 py-2">
                <Button asChild className="w-full">
                  <Link href="/admin" onClick={closeMenu}>لوحة التحكم</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

