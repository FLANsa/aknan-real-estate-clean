import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  PROPERTY_STATUS_LABELS, 
  PROPERTY_TYPE_LABELS, 
  PROPERTY_PURPOSE_LABELS, 
  CURRENCY_LABELS 
} from '@/types/property';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Phone, 
  MessageCircle,
  ArrowLeft,
  Star,
  CheckCircle
} from 'lucide-react';

interface PropertyDetailsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PropertyDetailsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const q = query(collection(db, 'properties'), where('slug', '==', resolvedParams.slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    return {
      title: 'العقار غير موجود',
    };
  }
  const property: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
  
  return {
    title: `${property.titleAr} - أكنان القمة العقارية`,
    description: property.descriptionAr || `عقار ${PROPERTY_TYPE_LABELS[property.type]} في ${property.city} بسعر ${property.price.toLocaleString()} ${CURRENCY_LABELS[property.currency]}`,
    openGraph: {
      title: property.titleAr,
      description: property.descriptionAr || `عقار ${PROPERTY_TYPE_LABELS[property.type]} في ${property.city}`,
      images: property.images.length > 0 ? [property.images[0]] : [],
    },
  };
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const resolvedParams = await params;
  const q = query(collection(db, 'properties'), where('slug', '==', resolvedParams.slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) notFound();
  const property: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
  const mainImage = property.images[0];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP;
  
  const whatsappMessage = `مرحباً، أريد الاستفسار عن العقار: ${property.titleAr}`;
  const whatsappUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">الرئيسية</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary">العقارات</Link>
            <span>/</span>
            <span className="text-foreground">{property.titleAr}</span>
          </div>
        </div>

        <div className="container pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{property.titleAr}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.district && `${property.district}, `}{property.city}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {property.featured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-500">
                        <Star className="h-3 w-3 ml-1" />
                        مميز
                      </Badge>
                    )}
                    <Badge 
                      variant={
                        property.status === 'available' ? 'default' :
                        property.status === 'sold' ? 'destructive' :
                        property.status === 'rented' ? 'secondary' : 'outline'
                      }
                    >
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    {property.price.toLocaleString()} {CURRENCY_LABELS[property.currency]}
                  </div>
                  <Badge variant="outline">
                    {PROPERTY_PURPOSE_LABELS[property.purpose]}
                  </Badge>
                  <Badge variant="outline">
                    {PROPERTY_TYPE_LABELS[property.type]}
                  </Badge>
                </div>
              </div>

              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="md:col-span-2 aspect-video relative">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={property.titleAr}
                          fill
                          className="object-cover rounded-t-lg"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                          <span className="text-muted-foreground">لا توجد صورة</span>
                        </div>
                      )}
                    </div>
                    
                    {property.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-video relative">
                        <Image
                          src={image}
                          alt={`${property.titleAr} - صورة ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل العقار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.areaM2 && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-lg font-semibold">{property.areaM2}</div>
                        <div className="text-sm text-muted-foreground">م²</div>
                      </div>
                    )}
                    
                    {property.bedrooms && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-lg font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">غرف نوم</div>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-lg font-semibold">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">دورات مياه</div>
                      </div>
                    )}
                    
                    {property.yearBuilt && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-lg font-semibold">{property.yearBuilt}</div>
                        <div className="text-sm text-muted-foreground">سنة البناء</div>
                      </div>
                    )}
                    
                    {property.floor && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="h-6 w-6 mx-auto mb-2 text-primary flex items-center justify-center">
                          <span className="text-lg font-bold">#</span>
                        </div>
                        <div className="text-lg font-semibold">{property.floor}</div>
                        <div className="text-sm text-muted-foreground">الطابق</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {property.descriptionAr && (
                <Card>
                  <CardHeader>
                    <CardTitle>الوصف</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {property.descriptionAr}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>المميزات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map Placeholder */}
              {(property.lat && property.lng) && (
                <Card>
                  <CardHeader>
                    <CardTitle>الموقع على الخريطة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>الموقع على الخريطة</p>
                        <p className="text-sm">سيتم إضافة الخريطة قريباً</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>تواصل معنا</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full" size="lg">
                    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 ml-2" />
                      واتساب
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="h-4 w-4 ml-2" />
                    اتصل الآن
                  </Button>
                  
                  <Separator />
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>للاستفسار عن هذا العقار</p>
                    <p>نحن متاحون 24/7</p>
                  </div>
                </CardContent>
              </Card>

              {/* Property Facts */}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل العقار</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النوع:</span>
                    <span>{PROPERTY_TYPE_LABELS[property.type]}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المعاملة:</span>
                    <span>{PROPERTY_PURPOSE_LABELS[property.purpose]}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة:</span>
                    <span>{PROPERTY_STATUS_LABELS[property.status]}</span>
                  </div>
                  
                  {property.areaM2 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المساحة:</span>
                      <span>{property.areaM2} م²</span>
                    </div>
                  )}
                  
                  {property.bedrooms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">غرف النوم:</span>
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  
                  {property.bathrooms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">دورات المياه:</span>
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  
                  {property.floor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الطابق:</span>
                      <span>{property.floor}</span>
                    </div>
                  )}
                  
                  {property.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">سنة البناء:</span>
                      <span>{property.yearBuilt}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Button variant="outline" asChild className="w-full">
                <Link href="/properties">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة للعقارات
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
