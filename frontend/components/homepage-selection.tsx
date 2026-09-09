'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';

type HomepageSelection = 'featured' | 'newest' | 'popular' | 'rent' | 'sale';

const selectionConfig: Record<HomepageSelection, { label: string; description: string; params: Record<string, string>; cta: string }> = {
  featured: {
    label: 'Featured',
    description: 'Handpicked listings highlighted by our team.',
    params: { isFeatured: 'true', sort: 'views', limit: '6' },
    cta: 'View featured listings',
  },
  newest: {
    label: 'Newest',
    description: 'Fresh listings recently added to the marketplace.',
    params: { sort: 'newest', limit: '6' },
    cta: 'See newest listings',
  },
  popular: {
    label: 'Popular',
    description: 'Properties getting the most attention right now.',
    params: { sort: 'views', limit: '6' },
    cta: 'Browse popular picks',
  },
  rent: {
    label: 'For Rent',
    description: 'Browse flexible rental options across top locations.',
    params: { listing: 'rent', sort: 'newest', limit: '6' },
    cta: 'Explore rentals',
  },
  sale: {
    label: 'For Sale',
    description: 'Browse homes and investments available to buy.',
    params: { listing: 'sale', sort: 'newest', limit: '6' },
    cta: 'Explore properties for sale',
  },
};

export function HomepageSelection() {
  const [selection, setSelection] = useState<HomepageSelection>('featured');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const config = useMemo(() => selectionConfig[selection], [selection]);

  useEffect(() => {
    let isActive = true;

    const loadSelection = async () => {
      setLoading(true);
      try {
        const response: any = await api.get('/properties', { params: config.params });
        if (isActive) {
          setProperties(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error loading homepage selection:', error);
        if (isActive) {
          setProperties([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadSelection();

    return () => {
      isActive = false;
    };
  }, [config.params]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <Badge className="mb-3 bg-red-50 text-[#D32F2F] hover:bg-red-50">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Dynamic Selection
            </Badge>
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Choose your homepage spotlight</h2>
            <p className="text-gray-600 max-w-2xl">Switch between curated property sets and instantly browse live listings without leaving the homepage.</p>
          </div>
          <Link href={`/properties?${new URLSearchParams(config.params).toString()}`} className="hidden sm:inline-flex self-start lg:self-auto">
            <Button variant="outline" className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white">
              {config.cta} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <Tabs value={selection} onValueChange={(value) => setSelection(value as HomepageSelection)} className="mb-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-gray-100 p-1 h-auto rounded-xl">
            {Object.entries(selectionConfig).map(([key, item]) => (
              <TabsTrigger key={key} value={key} className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#D32F2F] data-[state=active]:shadow-sm rounded-lg">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#1A1A1A]">{config.label} properties</h3>
            <p className="text-gray-600">{config.description}</p>
          </div>
          <Link href={`/properties?${new URLSearchParams(config.params).toString()}`} className="sm:hidden inline-flex items-center gap-1 text-sm font-medium text-[#D32F2F]">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" />
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No properties found for this selection right now.</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href={`/properties?${new URLSearchParams(config.params).toString()}`}>
            <Button variant="outline" className="border-[#D32F2F] text-[#D32F2F]">
              {config.cta} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}