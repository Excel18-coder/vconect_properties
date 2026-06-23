'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import { supabase, type Property, type Profile, type Inquiry } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  Building2,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Home,
  Shield,
  BarChart3,
  Settings,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalProperties: 0,
    pendingListings: 0,
    activeListings: 0,
    featuredListings: 0,
    totalViews: 0,
    totalInquiries: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    loadAdminData();
  }, [profile]);

  const loadAdminData = async () => {
    setLoading(true);

    // Stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: sellerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller');
    const { count: buyerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer');
    const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval');
    const { count: activeCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: featuredCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_featured', true);
    const { count: inqCount } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });

    setStats({
      totalUsers: userCount || 0,
      totalSellers: sellerCount || 0,
      totalBuyers: buyerCount || 0,
      totalProperties: propCount || 0,
      pendingListings: pendingCount || 0,
      activeListings: activeCount || 0,
      featuredListings: featuredCount || 0,
      totalViews: 0,
      totalInquiries: inqCount || 0,
    });

    // Users
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (userData) setUsers(userData as Profile[]);

    // Properties
    const { data: propData } = await supabase
      .from('properties')
      .select('*, seller:profiles!properties_seller_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (propData) setProperties(propData as Property[]);

    // Inquiries
    const { data: inqData } = await supabase
      .from('inquiries')
      .select('*, property:properties(title)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (inqData) setInquiries(inqData as Inquiry[]);

    setLoading(false);
  };

  const approveProperty = async (id: string) => {
    const { error } = await supabase.from('properties').update({ status: 'active' }).eq('id', id);
    if (error) {
      toast.error('Failed to approve');
    } else {
      setProperties(properties.map((p) => p.id === id ? { ...p, status: 'active' } : p));
      toast.success('Property approved');
    }
  };

  const rejectProperty = async (id: string) => {
    const { error } = await supabase.from('properties').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      toast.error('Failed to reject');
    } else {
      setProperties(properties.map((p) => p.id === id ? { ...p, status: 'rejected' } : p));
      toast.success('Property rejected');
    }
  };

  const verifySeller = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ verification_status: 'verified' }).eq('user_id', userId);
    if (error) {
      toast.error('Failed to verify');
    } else {
      setUsers(users.map((u) => u.user_id === userId ? { ...u, verification_status: 'verified' } : u));
      toast.success('Seller verified');
    }
  };

  const suspendUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ verification_status: 'suspended' }).eq('user_id', userId);
    if (error) {
      toast.error('Failed to suspend');
    } else {
      setUsers(users.map((u) => u.user_id === userId ? { ...u, verification_status: 'suspended' } : u));
      toast.success('User suspended');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_approval': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'sold': return 'bg-blue-100 text-blue-700';
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Building2 },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
            <p className="text-gray-500">You do not have permission to view this page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
              { label: 'Sellers', value: stats.totalSellers, icon: UserCheck, color: 'text-green-500' },
              { label: 'Buyers', value: stats.totalBuyers, icon: Users, color: 'text-purple-500' },
              { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'text-red-500' },
              { label: 'Pending', value: stats.pendingListings, icon: TrendingUp, color: 'text-amber-500' },
              { label: 'Active', value: stats.activeListings, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Featured', value: stats.featuredListings, icon: Eye, color: 'text-blue-500' },
              { label: 'Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'text-orange-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-100 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#D32F2F] text-white'
                    : 'text-gray-600 hover:text-[#D32F2F] hover:bg-red-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-sm font-medium">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                        <Badge className={`text-xs ${getStatusColor(u.verification_status)}`}>{u.verification_status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold mb-4">Pending Listings</h3>
                <div className="space-y-3">
                  {properties.filter((p) => p.status === 'pending_approval').slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.city}, {p.county}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => approveProperty(p.id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-red-500" onClick={() => rejectProperty(p.id)}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {properties.filter((p) => p.status === 'pending_approval').length === 0 && (
                    <p className="text-gray-500 text-sm">No pending listings</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-xs font-medium">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium">{u.full_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{u.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(u.verification_status)}>{u.verification_status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {u.role === 'seller' && u.verification_status !== 'verified' && (
                              <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => verifySeller(u.user_id)}>
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-red-500" onClick={() => suspendUser(u.user_id)}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Seller</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {properties.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.city}, {p.county}</p>
                        </td>
                        <td className="px-4 py-3">KES {p.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {(p.seller as any)?.full_name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {p.status === 'pending_approval' && (
                              <>
                                <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => approveProperty(p.id)}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-red-500" onClick={() => rejectProperty(p.id)}>
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Buyer</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{inq.full_name}</p>
                          <p className="text-xs text-gray-500">{inq.email}</p>
                        </td>
                        <td className="px-4 py-3">{(inq.property as any)?.title || 'N/A'}</td>
                        <td className="px-4 py-3 capitalize">{inq.inquiry_type}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(inq.status)}>{inq.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold mb-4">Listings by Type</h3>
                <div className="space-y-3">
                  {['apartment', 'house', 'villa', 'townhouse', 'commercial', 'office', 'land'].map((type) => {
                    const count = properties.filter((p) => p.property_type === type).length;
                    const total = properties.length || 1;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{type}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#D32F2F] h-2 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold mb-4">Listings by Status</h3>
                <div className="space-y-3">
                  {['active', 'pending_approval', 'sold', 'rented', 'rejected'].map((status) => {
                    const count = properties.filter((p) => p.status === status).length;
                    const total = properties.length || 1;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#D32F2F] h-2 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
