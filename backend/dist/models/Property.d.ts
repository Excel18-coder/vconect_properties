import mongoose, { Document } from 'mongoose';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial' | 'office' | 'land';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'pending_approval' | 'rejected';
export interface IPropertyImage {
    url: string;
    publicId: string;
    isPrimary: boolean;
    sortOrder: number;
}
export interface IProperty extends Document {
    _id: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
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
    images: IPropertyImage[];
    virtualTourLink?: string;
    status: PropertyStatus;
    isFeatured: boolean;
    featuredUntil?: Date;
    viewsCount: number;
    favoritesCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProperty, {}, {}, {}, mongoose.Document<unknown, {}, IProperty, {}, {}> & IProperty & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Property.d.ts.map