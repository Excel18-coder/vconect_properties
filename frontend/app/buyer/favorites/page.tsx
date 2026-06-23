'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Heart, Loader2, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    try {
      const response: any = await api.get('/favorites');
      if (response.success) {
        setFavorites(response.data.map((f: any) => f.propertyId).filter(Boolean));
      }
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      await api.delete(`/favorites/${propertyId}`);
      setFavorites(favorites.filter((f) => f._id !== propertyId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#D32F2F]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F5F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">My Favorites</h1>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <div key={property._id} className="relative">
                  <PropertyCard property={property} showFavorite={false} />
                  <button
                    onClick={() => removeFavorite(property._id)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No favorites yet. Start browsing!</p>
              <Link href="/properties">
                <Button className="mt-4 bg-[#D32F2F]">Browse Properties</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
