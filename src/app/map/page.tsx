'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Property } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Filter, Eye } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PROPERTY_TYPE_LABELS, PROPERTY_PURPOSE_LABELS, CURRENCY_LABELS } from '@/types/property';

interface MapProperty extends Property {
  lat?: number;
  lng?: number;
}

export default function PropertiesMapPage() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);

  // Fetch properties with coordinates
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        setError(null);

        const q = query(
          collection(db, 'properties'),
          where('status', '==', 'available')
        );

        const querySnapshot = await getDocs(q);
        const fetchedProperties: MapProperty[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const property = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as MapProperty;

          // Extract coordinates from location if available
          if (data.location && typeof data.location === 'object') {
            property.lat = data.location.lat;
            property.lng = data.location.lng;
          }

          fetchedProperties.push(property);
        });

        setProperties(fetchedProperties);
        setFilteredProperties(fetchedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('فشل في تحميل العقارات');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  // Filter properties
  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => property.type === typeFilter);
    }

    // Purpose filter
    if (purposeFilter !== 'all') {
      filtered = filtered.filter(property => property.purpose === purposeFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, typeFilter, purposeFilter]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency === 'SAR' ? 'SAR' : 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS] || type;
  };

  const getPropertyPurposeLabel = (purpose: string) => {
    return PROPERTY_PURPOSE_LABELS[purpose as keyof typeof PROPERTY_PURPOSE_LABELS] || purpose;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-3xl font-bold">خارطة العقارات</h1>
              <p className="text-muted-foreground">جاري تحميل العقارات...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-destructive text-lg">{error}</div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">خارطة العقارات</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اكتشف جميع العقارات المتاحة لدينا في مواقعها الجغرافية
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فلاتر البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">البحث</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث بالعنوان أو المدينة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع العقار</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأنواع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الغرض</label>
                  <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأغراض" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأغراض</SelectItem>
                      {Object.entries(PROPERTY_PURPOSE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">النتائج</label>
                  <div className="flex items-center justify-center h-10 px-3 py-2 border rounded-md bg-muted">
                    <span className="text-sm font-medium">
                      {filteredProperties.length} عقار
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد عقارات</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على عقارات تطابق معايير البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={property.images?.[0] || '/placeholder-property.jpg'}
                      alt={property.titleAr}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-property.jpg';
                      }}
                    />
                    {property.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-500">
                        مميز
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {property.titleAr}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 ml-1" />
                          {property.city}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(property.price, property.currency)}
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {getPropertyTypeLabel(property.type)}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {getPropertyPurposeLabel(property.purpose)}
                          </div>
                        </div>
                      </div>

                      {property.areaM2 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>المساحة: {property.areaM2} م²</span>
                          {property.bedrooms && (
                            <span>{property.bedrooms} غرف</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link href={`/properties/${property.slug}`}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </Link>
                        </Button>
                        {property.lat && property.lng && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = `https://www.google.com/maps?q=${property.lat},${property.lng}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Map Info */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">خارطة تفاعلية</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  يمكنك النقر على أيقونة الخريطة بجانب كل عقار لعرض موقعه على خرائط جوجل
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>عقار مميز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>عقار عادي</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
