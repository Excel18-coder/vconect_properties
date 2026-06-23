'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Home, TrendingUp } from 'lucide-react';

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

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [listingType, setListingType] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType !== 'all') params.set('type', propertyType);
    if (listingType !== 'all') params.set('listing', listingType);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920)' }}>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
          <TrendingUp className="h-4 w-4" />Over 10,000+ properties listed
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Find Your Perfect <span className="text-[#D32F2F]">Home</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Discover premium properties from verified sellers. Buy, rent, or invest in your dream property today.
        </p>
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Enter location..." value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10 h-12" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="sm:col-span-3">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12"><Home className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="Property Type" /></SelectTrigger>
                <SelectContent>{propertyTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="sale">Buy</SelectItem><SelectItem value="rent">Rent</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button onClick={handleSearch} className="w-full h-12 bg-[#D32F2F] hover:bg-[#B71C1C] text-white"><Search className="h-5 w-5 mr-2" />Search</Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10">
          {[{ value: '10K+', label: 'Properties' }, { value: '500+', label: 'Agents' }, { value: '50K+', label: 'Happy Clients' }, { value: '15+', label: 'Cities' }].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
