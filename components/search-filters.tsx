'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Home, Bed, Bath, SlidersHorizontal, X } from 'lucide-react';

const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartments' },
  { value: 'house', label: 'Houses' },
  { value: 'villa', label: 'Villas' },
  { value: 'townhouse', label: 'Townhouses' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Offices' },
  { value: 'land', label: 'Land' },
];

const listingTypes = [
  { value: 'all', label: 'All Listings' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || 'all',
    listing: searchParams.get('listing') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || 'any',
    bathrooms: searchParams.get('bathrooms') || 'any',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.listing !== 'all') params.set('listing', filters.listing);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms !== 'any') params.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms !== 'any') params.set('bathrooms', filters.bathrooms);
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ location: '', type: 'all', listing: 'all', minPrice: '', maxPrice: '', bedrooms: 'any', bathrooms: 'any' });
    router.push('/properties');
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all' && v !== 'any');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search by city, county, or address..." value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="pl-10 h-12" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <div className="flex gap-2">
          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
            <SelectTrigger className="w-[160px] h-12"><Home className="h-4 w-4 mr-2 text-gray-400" /><SelectValue /></SelectTrigger>
            <SelectContent>{propertyTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={filters.listing} onValueChange={(v) => setFilters({ ...filters, listing: v })}>
            <SelectTrigger className="w-[160px] h-12"><SelectValue /></SelectTrigger>
            <SelectContent>{listingTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
          <Button onClick={handleSearch} className="h-12 px-6 bg-[#D32F2F] hover:bg-[#B71C1C] text-white"><Search className="h-5 w-5 mr-2" />Search</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-[#D32F2F] font-medium hover:underline">
          <SlidersHorizontal className="h-4 w-4" />{showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        {hasActiveFilters && (<button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"><X className="h-4 w-4" />Clear all</button>)}
      </div>
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Min Price (KES)</label><Input type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Max Price (KES)</label><Input type="number" placeholder="Any" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Bedrooms</label><Select value={filters.bedrooms} onValueChange={(v) => setFilters({ ...filters, bedrooms: v })}><SelectTrigger><Bed className="h-4 w-4 mr-2 text-gray-400" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem>{[1,2,3,4,5].map((n) => (<SelectItem key={n} value={String(n)}>{n}+ Beds</SelectItem>))}</SelectContent></Select></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Bathrooms</label><Select value={filters.bathrooms} onValueChange={(v) => setFilters({ ...filters, bathrooms: v })}><SelectTrigger><Bath className="h-4 w-4 mr-2 text-gray-400" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem>{[1,2,3,4,5].map((n) => (<SelectItem key={n} value={String(n)}>{n}+ Baths</SelectItem>))}</SelectContent></Select></div>
        </div>
      )}
    </div>
  );
}
