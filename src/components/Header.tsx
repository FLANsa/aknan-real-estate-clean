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
    <header className="fixed top-0 z-50 w-full bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="أكنان القمة العقارية"
                width={50}
                height={50}
                className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">أكنان القمة العقارية</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden bg-white/20 hover:bg-white/30 text-white border-white/30"
            aria-label="فتح القائمة"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              العقارات
            </Link>
            <Link href="/map" className="text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              الخريطة العقارية
            </Link>
            <Link href="/evaluation" className="text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              تقييم العقار
            </Link>
            <Link href="/about" className="text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              من نحن
            </Link>
            <Link href="/contact" className="text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              اتصل بنا
            </Link>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/20 backdrop-blur-md border-t border-white/20 rounded-b-lg">
              <Link
                href="/properties"
                className="block px-3 py-2 text-base font-medium text-white hover:text-blue-200 hover:bg-white/20 rounded-md transition-colors duration-300"
                onClick={closeMenu}
              >
                العقارات
              </Link>
              <Link
                href="/map"
                className="block px-3 py-2 text-base font-medium text-white hover:text-blue-200 hover:bg-white/20 rounded-md transition-colors duration-300"
                onClick={closeMenu}
              >
                الخريطة العقارية
              </Link>
              <Link
                href="/evaluation"
                className="block px-3 py-2 text-base font-medium text-white hover:text-blue-200 hover:bg-white/20 rounded-md transition-colors duration-300"
                onClick={closeMenu}
              >
                تقييم العقار
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-white hover:text-blue-200 hover:bg-white/20 rounded-md transition-colors duration-300"
                onClick={closeMenu}
              >
                من نحن
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-white hover:text-blue-200 hover:bg-white/20 rounded-md transition-colors duration-300"
                onClick={closeMenu}
              >
                اتصل بنا
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

