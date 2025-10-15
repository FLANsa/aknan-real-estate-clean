'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

export default function FeaturedPropertiesCarousel() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      direction: 'rtl', // RTL for Arabic
      loop: true,
      skipSnaps: false,
      dragFree: false,
    },
    []
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    onSelect();
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Fetch featured properties
  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        setLoading(true);
        setError(null);

        const q = query(
          collection(db, 'properties'),
          where('featured', '==', true),
          where('status', '==', 'available'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const fetchedProperties: Property[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProperties.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Property);
        });

        // ترتيب محلي حسب التاريخ (الأحدث أولاً)
        fetchedProperties.sort((a, b) => {
          const dateA = a.createdAt.getTime();
          const dateB = b.createdAt.getTime();
          return dateB - dateA;
        });

        // إذا لم توجد عقارات مميزة، جلب عقارات عادية
        if (fetchedProperties.length === 0) {
          console.log('No featured properties found, fetching regular properties...');
          const regularQuery = query(
            collection(db, 'properties'),
            where('status', '==', 'available'),
            limit(6)
          );
          
          const regularSnapshot = await getDocs(regularQuery);
          regularSnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedProperties.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Property);
          });
          
          // ترتيب محلي
          fetchedProperties.sort((a, b) => {
            const dateA = a.createdAt.getTime();
            const dateB = b.createdAt.getTime();
            return dateB - dateA;
          });
        }

        setProperties(fetchedProperties);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        
        // معالجة أخطاء محددة
        if (err instanceof Error) {
          if (err.message.includes('index')) {
            setError('فشل في تحميل العقارات المميزة: يرجى إنشاء index في Firestore');
          } else if (err.message.includes('permission')) {
            setError('فشل في تحميل العقارات المميزة: مشكلة في الصلاحيات');
          } else {
            setError('فشل في تحميل العقارات المميزة');
          }
        } else {
          setError('فشل في تحميل العقارات المميزة');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">العقارات المميزة</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة لدينا
            </p>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل العقارات المميزة...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">العقارات المميزة</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة لدينا
            </p>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">العقارات المميزة</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة لدينا
            </p>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">لا توجد عقارات مميزة متاحة حالياً</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">العقارات المميزة</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اكتشف مجموعة مختارة من أفضل العقارات المتاحة لدينا
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            
            <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
              {Math.floor(selectedIndex / 3) + 1} من {Math.ceil(properties.length / 3)}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3"
                >
                  <div className="transform transition-transform duration-300 hover:scale-105">
                    <PropertyCard property={property} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicators */}
          {properties.length > 3 && (
            <div className="flex justify-center mt-8 space-x-3">
              {Array.from({ length: Math.ceil(properties.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index * 3)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                    Math.floor(selectedIndex / 3) === index
                      ? 'bg-primary shadow-lg scale-110'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`انتقل إلى المجموعة ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <a href="/properties">عرض جميع العقارات</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
