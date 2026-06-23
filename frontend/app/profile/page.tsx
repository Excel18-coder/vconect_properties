'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, User, Phone, MapPin, Building2, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    agencyName: profile?.agencyName || '',
    businessDetails: profile?.businessDetails || '',
    country: profile?.country || '',
    county: profile?.county || '',
    city: profile?.city || '',
    address: profile?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const response: any = await api.put('/profile', form);
      if (response.success) {
        toast.success('Profile updated successfully');
        await refreshProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F5F5] py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-2xl font-medium">{profile?.full_name?.charAt(0) || 'U'}</div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">My Profile</h1>
                <p className="text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><Label className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />Full Name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5" /></div>
                <div><Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />Phone Number</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" /></div>
                <div><Label className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" />Agency Name</Label><Input value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })} className="mt-1.5" placeholder="If applicable" /></div>
                <div><Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />Email</Label><Input value={profile?.email || ''} disabled className="mt-1.5 bg-gray-50" /></div>
                <div><Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1.5" /></div>
                <div><Label>County / State</Label><Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} className="mt-1.5" /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5" /></div>
              </div>
              <div><Label>Business Details</Label><textarea value={form.businessDetails} onChange={(e) => setForm({ ...form, businessDetails: e.target.value })} className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F] text-sm min-h-[100px]" placeholder="Tell us about your business..." /></div>
              <Button type="submit" disabled={loading} className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
