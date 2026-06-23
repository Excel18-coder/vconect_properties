'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SearchFilters } from '@/components/search-filters';
import { PropertyCard } from '@/components/property-card';
import api from '@/lib/api';
import type { Property, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Grid3X3, List, SlidersHorizontal } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [totalCount, setTotalCount] = useState(0);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      if (!params.sort) params.sort = sortBy;

      const response: any = await api.get('/properties', { params });
      if (response.success) {
        setProperties(response.data);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleSort = (value: SortOption) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    window.history.replaceState({}, '', `?${params.toString()}`);
    loadProperties();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Properties</h1>
            <p className="text-gray-500 text-sm mt-1">{totalCount} properties found</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchFilters />
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
              <select value={sortBy} onChange={(e) => handleSort(e.target.value as SortOption)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#D32F2F] text-white' : 'text-gray-500 hover:text-gray-700'}`}><Grid3X3 className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#D32F2F] text-white' : 'text-gray-500 hover:text-gray-700'}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#D32F2F]" /></div>
          ) : properties.length > 0 ? (
            <div className={`mt-6 grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {properties.map((property) => (<PropertyCard key={property._id} property={property} />))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl mt-6">
              <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No properties found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
