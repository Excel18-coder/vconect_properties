'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    MapPin,
    Bed,
    Bath,
    Maximize,
    Trash2,
    Edit3,
    ExternalLink,
    Loader2,
    AlertCircle,
    Heart,
    Building2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function SellerProperties() {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProperties = async () => {
        try {
            const res: any = await api.get('/properties/seller/mine');
            if (res.success) {
                setProperties(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch seller properties:', error);
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'seller') {
            fetchProperties();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

        try {
            await api.delete(`/properties/${id}`);
            setProperties(properties.filter((p: any) => p._id !== id));
            toast.success('Property deleted successfully');
        } catch (error) {
            toast.error('Failed to delete property');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>;
            case 'pending_approval':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Pending Approval</Badge>;
            case 'sold':
            case 'rented':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredProperties = properties.filter((p: any) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-[#D32F2F] mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-6">You must be logged in as a seller to access this page.</p>
                        <Link href="/auth/signin" className="bg-[#D32F2F] text-white px-6 py-2 rounded-lg hover:bg-[#B71C1C]">Sign In</Link>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">My Listings</h1>
                        <p className="text-gray-600">You have total {properties.length} properties listed</p>
                    </div>
                    <Link href="/seller/properties/new">
                        <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add New Property
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search properties by title or location..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#D32F2F] mb-4" />
                        <p className="text-gray-500 font-medium">Loading your properties...</p>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredProperties.map((property: any) => (
                            <Card key={property._id} className="overflow-hidden hover:shadow-md transition-shadow group border-none">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row h-full">
                                        {/* Image Section */}
                                        <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                                            <Image
                                                src={property.images?.find((img: any) => img.isPrimary)?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                                                alt={property.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 left-2">
                                                {getStatusBadge(property.status)}
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#D32F2F] transition-colors">{property.title}</h3>
                                                        <div className="flex items-center text-gray-500 text-sm mt-1">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {property.city}, {property.county}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-[#D32F2F]">
                                                            KES {property.price.toLocaleString()}
                                                            {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500">/mo</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 py-4 border-y border-gray-100 my-4 text-gray-600">
                                                    <div className="flex items-center gap-1.5"><Bed className="h-4 w-4" /><span className="text-sm">{property.bedrooms} Bed</span></div>
                                                    <div className="flex items-center gap-1.5"><Bath className="h-4 w-4" /><span className="text-sm">{property.bathrooms} Bath</span></div>
                                                    <div className="flex items-center gap-1.5"><Maximize className="h-4 w-4" /><span className="text-sm">{property.propertySize} m²</span></div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1"><ExternalLink className="h-4 w-4" /> {property.viewsCount} views</div>
                                                        <div className="flex items-center gap-1"><Heart className="h-4 w-4" /> {property.favoritesCount} saves</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/properties/${property._id}`}>
                                                            <Button variant="outline" size="sm" className="h-9">View</Button>
                                                        </Link>
                                                        <Link href={`/seller/properties/edit/${property._id}`}>
                                                            <Button variant="outline" size="sm" className="h-9 border-amber-200 text-amber-700 hover:bg-amber-50">
                                                                <Edit3 className="h-4 w-4 mr-1" /> Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(property._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-dashed border-2 py-20">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Building2 className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No properties found</h3>
                            <p className="text-gray-500 max-w-md mb-8">
                                {searchTerm ? `We couldn't find any properties matching "${searchTerm}"` : "You haven't listed any properties yet. Start selling today!"}
                            </p>
                            {!searchTerm && (
                                <Link href="/seller/properties/new">
                                    <Button className="bg-[#D32F2F] hover:bg-[#B71C1C]">Post Your First Listing</Button>
                                </Link>
                            )}
                            {searchTerm && (
                                <Button variant="link" className="text-[#D32F2F]" onClick={() => setSearchTerm('')}>Clear search</Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}
