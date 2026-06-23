import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type PropertyType = 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial' | 'office' | 'land';
export type ListingType = 'sale' | 'rent';
export type UserRole = 'admin' | 'seller' | 'buyer';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'pending_approval' | 'rejected';
export type InquiryStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed' | 'not_interested';
export type InquiryType = 'information' | 'viewing' | 'callback' | 'offer';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  agency_name: string | null;
  business_details: string | null;
  verification_status: VerificationStatus;
  country: string | null;
  county: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: PropertyType;
  listing_type: ListingType;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  property_size: number | null;
  land_size: number | null;
  country: string;
  county: string;
  city: string;
  full_address: string | null;
  coordinates: { x: number; y: number } | null;
  amenities: string[];
  features: string[];
  virtual_tour_link: string | null;
  status: PropertyStatus;
  is_featured: boolean;
  featured_until: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  seller?: Profile;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_contact: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  buyer?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Review {
  id: string;
  seller_id: string;
  buyer_id: string;
  property_id: string | null;
  rating: number;
  review_text: string | null;
  is_verified: boolean;
  created_at: string;
  buyer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  created_at: string;
}
