'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyCard from '@/components/PropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Property } from '@/types/property';
import { Project } from '@/types/map';

interface PropertiesListClientProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function PropertiesListClient({
  searchParams,
}: PropertiesListClientProps) {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const filters = useMemo(() => {
    console.log('PropertiesListClient: Raw searchParams:', searchParams);
    
    // Handle both string and object searchParams
    if (typeof searchParams === 'string') {
      const sp = new URLSearchParams(searchParams);
      return Object.fromEntries(sp.entries());
    } else if (searchParams && typeof searchParams === 'object') {
      // Convert object to URLSearchParams
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === 'string') {
          params.set(key, value);
        } else if (Array.isArray(value)) {
          params.set(key, value[0] as string);
        }
      });
      return Object.fromEntries(params.entries());
    }
    
    return {};
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        console.log('PropertiesListClient: Starting fetchData');
        console.log('PropertiesListClient: Firebase db:', db);
        
        let qRef: any = query(
          collection(db, 'properties')
        );

        console.log('PropertiesListClient: Base query created');

        // Apply filters without orderBy to avoid index requirements
        if ((filters as any).city) {
          console.log('PropertiesListClient: Adding city filter:', (filters as any).city);
          qRef = query(qRef, where('city', '==', (filters as any).city));
        }
        if ((filters as any).district) {
          console.log('PropertiesListClient: Adding district filter:', (filters as any).district);
          qRef = query(qRef, where('district', '==', (filters as any).district));
        }
        if ((filters as any).type) {
          console.log('PropertiesListClient: Adding type filter:', (filters as any).type);
          qRef = query(qRef, where('type', '==', (filters as any).type));
        }
        if ((filters as any).purpose) {
          console.log('PropertiesListClient: Adding purpose filter:', (filters as any).purpose);
          qRef = query(qRef, where('purpose', '==', (filters as any).purpose));
        }
        if ((filters as any).status) {
          console.log('PropertiesListClient: Adding status filter:', (filters as any).status);
          qRef = query(qRef, where('status', '==', (filters as any).status));
        }
        if ((filters as any).projectId && (filters as any).projectId !== 'all') {
          console.log('PropertiesListClient: Adding projectId filter:', (filters as any).projectId);
          qRef = query(qRef, where('projectId', '==', (filters as any).projectId));
        }

        const snap = await getDocs(qRef);
        console.log('PropertiesListClient: Found', snap.docs.length, 'properties');
        console.log('PropertiesListClient: Filters applied:', filters);
        
        let items = snap.docs.map((d) => {
          const data = d.data() as any;
          const property = {
            id: d.id,
            ...data,
            // Ensure numeric fields are properly converted
            price: Number(data.price) || 0,
            areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
            bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
            bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
            floor: data.floor ? Number(data.floor) : undefined,
            yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
            lat: data.lat ? Number(data.lat) : undefined,
            lng: data.lng ? Number(data.lng) : undefined,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          console.log('PropertiesListClient: Property:', property.titleAr, property.status);
          return property;
        }) as Property[];

        // Sort locally by updatedAt to avoid Firestore index requirements
        items.sort((a, b) => {
          const aTime = a.updatedAt?.getTime() || 0;
          const bTime = b.updatedAt?.getTime() || 0;
          return bTime - aTime; // Descending order (newest first)
        });

        if ((filters as any).minPrice)
          items = items.filter((p) => p.price >= Number((filters as any).minPrice));
        if ((filters as any).maxPrice)
          items = items.filter((p) => p.price <= Number((filters as any).maxPrice));
        if ((filters as any).minArea)
          items = items.filter((p) => p.areaM2 && p.areaM2 >= Number((filters as any).minArea));
        if ((filters as any).maxArea)
          items = items.filter((p) => p.areaM2 && p.areaM2 <= Number((filters as any).maxArea));
        if ((filters as any).bedrooms)
          items = items.filter((p) => p.bedrooms && p.bedrooms >= Number((filters as any).bedrooms));
        if ((filters as any).bathrooms)
          items = items.filter((p) => p.bathrooms && p.bathrooms >= Number((filters as any).bathrooms));

        console.log('PropertiesListClient: After filters:', items.length, 'properties remain');
        console.log('PropertiesListClient: Final properties:', items.map(p => ({ title: p.titleAr, status: p.status })));

        if (!isMounted) return;
        setProperties(items);

        const citySet = new Set<string>();
        const districtSet = new Set<string>();
        items.forEach((p) => {
          if (p.city) citySet.add(p.city);
          if (p.district) districtSet.add(p.district);
        });
        setCities(Array.from(citySet).sort());
        setDistricts(Array.from(districtSet).sort());

        // Fetch projects
        try {
          const projectsResponse = await fetch('/api/admin/projects');
          const projectsData = await projectsResponse.json();
          if (projectsData.projects) {
            setProjects(projectsData.projects);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      } catch (e) {
        console.error('PropertiesListClient: Error fetching properties:', e);
        console.error('PropertiesListClient: Error details:', {
          message: e instanceof Error ? e.message : 'Unknown error',
          stack: e instanceof Error ? e.stack : undefined,
          name: e instanceof Error ? e.name : undefined,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">جاري التحميل...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PropertyFilters cities={cities} districts={districts} projects={projects} />

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">لا توجد عقارات</h3>
            <p className="text-muted-foreground mb-4">
              لم نجد أي عقارات تطابق معايير البحث الخاصة بك
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/properties'}>
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}