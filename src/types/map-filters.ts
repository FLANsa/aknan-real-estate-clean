export interface MapFiltersState {
  showProperties: boolean;
  showProjects: boolean;
  statusFilter: 'all' | 'available' | 'sold' | 'rented' | 'reserved';
  propertyTypeFilter: 'all' | 'apartment' | 'villa' | 'townhouse' | 'land' | 'office' | 'shop';
  priceRange: [number, number];
}

