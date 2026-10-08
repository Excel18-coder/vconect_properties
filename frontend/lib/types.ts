export type UserRole = 'admin' | 'seller' | 'buyer';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial' | 'office' | 'land';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'pending_approval' | 'rejected';
export type InquiryType = 'information' | 'viewing' | 'callback' | 'offer';
export type InquiryStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed' | 'not_interested';
export type SubscriptionRole = 'seller' | 'buyer';
export type SubscriptionStatus = 'inactive' | 'pending' | 'active' | 'past_due' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentPurpose = 'subscription' | 'inquiry_fee';

export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
    agencyName?: string;
    businessDetails?: string;
    verificationStatus: VerificationStatus;
    subscriptionRole?: SubscriptionRole;
    subscriptionPlan?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionProvider?: string;
    subscriptionReference?: string;
    subscriptionExpiresAt?: string;
    country?: string;
    county?: string;
    city?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyImage {
    url: string;
    publicId: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface Property {
    _id: string;
    sellerId: string | User;
    title: string;
    description?: string;
    price: number;
    propertyType: PropertyType;
    listingType: ListingType;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    propertySize?: number;
    landSize?: number;
    country: string;
    county: string;
    city: string;
    fullAddress?: string;
    amenities: string[];
    features: string[];
    images: PropertyImage[];
    virtualTourLink?: string;
    status: PropertyStatus;
    isFeatured: boolean;
    viewsCount: number;
    favoritesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Inquiry {
    _id: string;
    propertyId: string | Property;
    buyerId?: string | User;
    sellerId: string | User;
    fullName: string;
    email: string;
    phone?: string;
    preferredContact?: string;
    preferredContactTime?: string;
    message?: string;
    inquiryType: InquiryType;
    status: InquiryStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    token?: string;
    user?: User;
}

export interface PaymentPlan {
    id: string;
    name: string;
    role: SubscriptionRole;
    description: string;
    monthly: number;
    yearly: number;
    features: string[];
    popular?: boolean;
}

export interface PaymentRecord {
    _id: string;
    userId: string | User;
    role: SubscriptionRole;
    purpose?: PaymentPurpose;
    planId: string;
    planName: string;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: 'payhero';
    providerReference?: string;
    checkoutUrl?: string;
    metadata?: Record<string, any>;
    paidAt?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}
