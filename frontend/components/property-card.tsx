'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from './auth-provider';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, Bed, Bath, Car, Maximize, MapPin, Eye, CheckCircle } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
}

export function PropertyCard({ property, showFavorite = true }: PropertyCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = property.images?.find((img) => img.isPrimary)?.url
    || property.images?.[0]?.url
    || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);
    return type === 'rent' ? `${formatted}/mo` : formatted;
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to save favorites'); return; }
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${property._id}`);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await api.post('/favorites', { propertyId: property._id });
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const seller = property.sellerId as any;

  return (
    <Link href={`/properties/${property._id}`}>
      <div className="property-card-hover bg-white rounded-xl overflow-hidden border border-gray-100 h-full flex flex-col group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={imageError ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' : primaryImage} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImageError(true)} />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-[#D32F2F] text-white hover:bg-[#B71C1C]">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
            {property.isFeatured && <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>}
          </div>
          {showFavorite && (
            <button onClick={toggleFavorite} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-[#D32F2F] text-[#D32F2F]' : 'text-gray-600'}`} />
            </button>
          )}
          <div className="absolute bottom-3 left-3">
            <p className="text-white text-xl font-bold drop-shadow-lg">{formatPrice(property.price, property.listingType)}</p>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-[#1A1A1A] text-lg mb-1 line-clamp-1 group-hover:text-[#D32F2F] transition-colors">{property.title}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{property.city}, {property.county}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
            {property.bedrooms > 0 && <div className="flex items-center gap-1"><Bed className="h-4 w-4" /><span>{property.bedrooms}</span></div>}
            {property.bathrooms > 0 && <div className="flex items-center gap-1"><Bath className="h-4 w-4" /><span>{property.bathrooms}</span></div>}
            {property.parkingSpaces > 0 && <div className="flex items-center gap-1"><Car className="h-4 w-4" /><span>{property.parkingSpaces}</span></div>}
            {property.propertySize && <div className="flex items-center gap-1"><Maximize className="h-4 w-4" /><span>{property.propertySize} m²</span></div>}
          </div>
          {seller && (
            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{seller.fullName?.charAt(0) || 'A'}</div>
                <span className="text-sm text-gray-600 line-clamp-1">{seller.agencyName || seller.fullName || 'Agent'}</span>
                {seller.verificationStatus === 'verified' && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs"><Eye className="h-3.5 w-3.5" /><span>{property.viewsCount}</span></div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
