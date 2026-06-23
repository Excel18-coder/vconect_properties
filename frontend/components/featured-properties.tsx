'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const response: any = await api.get('/properties', {
          params: { isFeatured: true, status: 'active', limit: 6 }
        });
        if (response.success) {
          setProperties(response.data);
        }
      } catch (error) {
        console.error('Error loading featured properties:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Featured Properties</h2>
            <p className="text-gray-600">Handpicked premium properties for you</p>
          </div>
          <Link href="/properties?featured=true" className="hidden sm:flex">
            <Button variant="outline" className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" /></div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (<PropertyCard key={property._id} property={property} />))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500">No featured properties available at the moment.</p></div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/properties?featured=true">
            <Button variant="outline" className="border-[#D32F2F] text-[#D32F2F]">View All Properties <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
