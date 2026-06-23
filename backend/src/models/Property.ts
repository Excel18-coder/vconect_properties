import mongoose, { Document, Schema } from 'mongoose';

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

const propertyImageSchema = new Schema<IPropertyImage>(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
    },
    { _id: false }
);

const propertySchema = new Schema<IProperty>(
    {
        sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        propertyType: {
            type: String,
            enum: ['apartment', 'house', 'villa', 'townhouse', 'commercial', 'office', 'land'],
            required: true,
        },
        listingType: { type: String, enum: ['sale', 'rent'], required: true },
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        parkingSpaces: { type: Number, default: 0 },
        propertySize: { type: Number },
        landSize: { type: Number },
        country: { type: String, required: true },
        county: { type: String, required: true },
        city: { type: String, required: true },
        fullAddress: { type: String },
        amenities: [{ type: String }],
        features: [{ type: String }],
        images: [propertyImageSchema],
        virtualTourLink: { type: String },
        status: {
            type: String,
            enum: ['active', 'sold', 'rented', 'pending_approval', 'rejected'],
            default: 'pending_approval',
        },
        isFeatured: { type: Boolean, default: false },
        featuredUntil: { type: Date },
        viewsCount: { type: Number, default: 0 },
        favoritesCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Text search index
propertySchema.index({ title: 'text', description: 'text', city: 'text', county: 'text', fullAddress: 'text' });
propertySchema.index({ status: 1, isFeatured: 1, createdAt: -1 });
propertySchema.index({ propertyType: 1, listingType: 1, price: 1 });

export default mongoose.model<IProperty>('Property', propertySchema);
