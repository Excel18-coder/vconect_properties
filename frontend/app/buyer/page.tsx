'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { PropertyCard } from '@/components/property-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [favsRes, inqRes] = await Promise.all([
                    api.get('/favorites'),
                    api.get('/inquiries'),
                ]);
                setFavorites(favsRes.data.data);
                setInquiries(inqRes.data.data);
            } catch (error) {
                console.error('Failed to fetch buyer data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <CardTitle>Sign in required</CardTitle>
                            <CardDescription>Please sign in to view your dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Link href="/auth/login" className="bg-[#D32F2F] text-white px-6 py-2 rounded-lg hover:bg-[#B71C1C] transition-colors">
                                Sign In
                            </Link>
                        </CardContent>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome back, {user.fullName}</h1>
                    <p className="text-gray-600">Manage your saved properties and inquiries</p>
                </div>

                <Tabs defaultValue="favorites" className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-lg">
                        <TabsTrigger value="favorites" className="data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
                            <Heart className="h-4 w-4 mr-2" />
                            Saved Properties
                        </TabsTrigger>
                        <TabsTrigger value="inquiries" className="data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            My Inquiries
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="favorites" className="mt-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Clock className="h-8 w-8 animate-spin text-[#D32F2F]" />
                            </div>
                        ) : favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((property: any) => (
                                    <PropertyCard key={property._id} property={property} />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <Heart className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No saved properties yet</h3>
                                    <p className="text-gray-500 mb-6">Start exploring properties and save your favorites!</p>
                                    <Link href="/properties" className="text-[#D32F2F] font-semibold flex items-center hover:underline">
                                        Explore Properties <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="inquiries" className="mt-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Clock className="h-8 w-8 animate-spin text-[#D32F2F]" />
                            </div>
                        ) : inquiries.length > 0 ? (
                            <div className="grid gap-4">
                                {inquiries.map((inquiry: any) => (
                                    <Card key={inquiry._id} className="bg-white overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-[#1A1A1A]">
                                                            Inquiry for: <Link href={`/properties/${inquiry.propertyId?._id}`} className="text-[#D32F2F] hover:underline">{inquiry.propertyId?.title || 'Property'}</Link>
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">Submitted on {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={inquiry.status === 'resolved' ? 'outline' : 'secondary'} className={inquiry.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-gray-700 italic">"{inquiry.message || 'No message provided'}"</p>
                                                </div>
                                                {inquiry.notes && (
                                                    <div className="mt-4 border-t pt-4">
                                                        <p className="text-sm font-semibold text-gray-900 mb-1">Response from Agent:</p>
                                                        <p className="text-gray-600 text-sm">{inquiry.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No inquiries yet</h3>
                                    <p className="text-gray-500">Contact agents to learn more about properties</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
