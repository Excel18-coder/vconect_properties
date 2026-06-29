'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Building2,
    Eye,
    Heart,
    Clock,
    CheckCircle,
    TrendingUp,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
        totalViews: 0,
        totalFavorites: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res: any = await api.get('/properties/seller/stats');
                if (res.success && res.data) {
                    setStats(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch seller stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'seller') {
            fetchStats();
        }
    }, [user]);

    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <CardTitle>Seller Account Required</CardTitle>
                            <CardDescription>Only seller accounts can access this dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Link href="/auth/signin" className="w-full">
                                <Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C]">Sign In</Button>
                            </Link>
                            <Link href="/auth/signup" className="w-full">
                                <Button variant="outline" className="w-full border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F]/10">
                                    Register as Seller
                                </Button>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Seller Dashboard</h1>
                        <p className="text-gray-600 font-medium">Hello, {user.fullName}! Track your property performance here.</p>
                    </div>
                    <Link href="/seller/properties/new">
                        <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
                            <Plus className="mr-2 h-4 w-4" /> List New Property
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Listings"
                        value={stats?.totalListings ?? 0}
                        icon={<Building2 className="h-5 w-5 text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Active Properties"
                        value={stats?.activeListings ?? 0}
                        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                        color="bg-green-50"
                    />
                    <StatCard
                        title="Pending Approval"
                        value={stats?.pendingListings ?? 0}
                        icon={<Clock className="h-5 w-5 text-amber-600" />}
                        color="bg-amber-50"
                    />
                    <StatCard
                        title="Total Property Views"
                        value={stats?.totalViews ?? 0}
                        icon={<Eye className="h-5 w-5 text-[#D32F2F]" />}
                        color="bg-red-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Inquiries Section */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-xl">Recent Activity</CardTitle>
                                <CardDescription>Latest interactions with your listings</CardDescription>
                            </div>
                            <Link href="/seller/properties" className="text-sm text-[#D32F2F] hover:underline flex items-center">
                                Manage Properties <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Placeholder for list, could fetch recent activities */}
                                <div className="p-4 border rounded-lg bg-white flex items-center justify-between hover:border-[#D32F2F] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#D32F2F]">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Someone favorited your property</p>
                                            <p className="text-sm text-gray-500">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg bg-white flex items-center justify-between hover:border-[#D32F2F] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">New inquiry received</p>
                                            <p className="text-sm text-gray-500">5 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/seller/properties">
                                <Button variant="outline" className="w-full justify-start text-gray-700">
                                    <Building2 className="mr-2 h-4 w-4" /> View My Listings
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="outline" className="w-full justify-start text-gray-700">
                                    <Plus className="mr-2 h-4 w-4" /> Edit Business Profile
                                </Button>
                            </Link>
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-4">
                                <h4 className="font-semibold text-amber-900 flex items-center">
                                    <TrendingUp className="mr-2 h-4 w-4" /> Boost your sales
                                </h4>
                                <p className="text-sm text-amber-800 mt-1">
                                    Complete your agent profile to build trust with potential buyers. Verified sellers get 3x more inquiries!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
    return (
        <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-[#1A1A1A]">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${color}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
