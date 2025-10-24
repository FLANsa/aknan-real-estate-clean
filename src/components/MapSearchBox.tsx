'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X, MapPin } from 'lucide-react';
import { MapFiltersState } from '@/types/map-filters';

interface MapSearchBoxProps {
  map: google.maps.Map | null;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

export default function MapSearchBox({ map, onPlaceSelected }: MapSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (!inputRef.current || !map) return;

    // Load recent searches from localStorage
    const saved = localStorage.getItem('map-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }

    // Initialize Google Places Autocomplete using the new API
    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'sa' }, // Restrict to Saudi Arabia
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['geocode', 'establishment'], // Cities, neighborhoods, and places
    });

    // Bind to map to adjust bounds
    autocompleteInstance.bindTo('bounds', map);

    // Listen for place selection
    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.error('No geometry found for place:', place.name);
        return;
      }

      // Pan to location
      map.panTo(place.geometry.location);
      
      // Adjust zoom based on place type
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setZoom(15); // Default zoom for specific locations
      }

      // Save to recent searches
      const searchTerm = place.formatted_address || place.name || '';
      if (searchTerm) {
        const updatedSearches = [
          searchTerm,
          ...recentSearches.filter(s => s !== searchTerm),
        ].slice(0, 5); // Keep last 5 searches
        
        setRecentSearches(updatedSearches);
        localStorage.setItem('map-recent-searches', JSON.stringify(updatedSearches));
      }

      // Callback
      if (onPlaceSelected) {
        onPlaceSelected(place);
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      google.maps.event.clearInstanceListeners(autocompleteInstance);
    };
  }, [map, onPlaceSelected, recentSearches]);

  const handleClear = () => {
    setSearchValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRecentSearchClick = (search: string) => {
    if (inputRef.current) {
      inputRef.current.value = search;
      setSearchValue(search);
      // Trigger autocomplete
      google.maps.event.trigger(autocomplete, 'place_changed');
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('map-recent-searches');
  };

  return (
    <div className="relative">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن مدينة أو حي..."
              className="pr-10 pl-10"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={handleClear}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchValue && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">عمليات البحث الأخيرة</span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                مسح
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center gap-2 p-2 text-sm text-right hover:bg-muted rounded-md transition-colors"
                >
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1 truncate">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

