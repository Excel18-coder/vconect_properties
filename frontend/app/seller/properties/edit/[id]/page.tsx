'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X, Upload } from 'lucide-react';

const propertyTypes = ['apartment', 'house', 'villa', 'townhouse', 'commercial', 'office', 'land'];
const commonAmenities = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Balcony',
  'Air Conditioning', 'Furnished', 'Pet Friendly', 'Wheelchair Access',
  'Elevator', 'Generator', 'Borehole', 'Solar Power', 'Internet',
];

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<any[]>([]); // { url, publicId, isPrimary }
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    listingType: 'sale',
    bedrooms: '0',
    bathrooms: '0',
    parkingSpaces: '0',
    propertySize: '',
    landSize: '',
    country: 'Kenya',
    county: '',
    city: '',
    fullAddress: '',
    virtualTourLink: '',
    status: 'active',
  });

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response: any = await api.get(`/properties/${id}`);
      if (response.success) {
        const data = response.data;
        setForm({
          title: data.title,
          description: data.description || '',
          price: String(data.price),
          propertyType: data.propertyType,
          listingType: data.listingType,
          bedrooms: String(data.bedrooms),
          bathrooms: String(data.bathrooms),
          parkingSpaces: String(data.parkingSpaces),
          propertySize: data.propertySize ? String(data.propertySize) : '',
          landSize: data.landSize ? String(data.landSize) : '',
          country: data.country,
          county: data.county,
          city: data.city,
          fullAddress: data.fullAddress || '',
          virtualTourLink: data.virtualTourLink || '',
          status: data.status,
        });

        setSelectedAmenities(data.amenities || []);
        setPropertyImages(data.images || []);
      } else {
        toast.error('Property not found');
        router.push('/seller');
      }
    } catch (error) {
      toast.error('Failed to load property');
      router.push('/seller');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response: any = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.success) {
        setPropertyImages([...propertyImages, { ...response.data, isPrimary: propertyImages.length === 0 }]);
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const img = propertyImages[index];
    if (img.publicId) {
      try {
        await api.delete(`/upload/${encodeURIComponent(img.publicId)}`);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
      }
    }
    setPropertyImages(propertyImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.propertyType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response: any = await api.put(`/properties/${id}`, {
        ...form,
        price: parseFloat(form.price),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        parkingSpaces: parseInt(form.parkingSpaces),
        propertySize: form.propertySize ? parseFloat(form.propertySize) : undefined,
        landSize: form.landSize ? parseFloat(form.landSize) : undefined,
        amenities: selectedAmenities,
        images: propertyImages,
      });

      if (response.success) {
        toast.success('Property updated successfully!');
        router.push('/seller');
      }
    } catch (error) {
      toast.error('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

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
      <main className="flex-1 bg-[#F5F5F5] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Edit Property</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Property Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Property Type *</Label>
                    <Select value={form.propertyType} onValueChange={(v) => setForm({ ...form, propertyType: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((t) => (<SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Listing Type *</Label>
                    <Select value={form.listingType} onValueChange={(v) => setForm({ ...form, listingType: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price (KES) *</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 min-h-[120px]" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><Label>Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Parking</Label><Input type="number" value={form.parkingSpaces} onChange={(e) => setForm({ ...form, parkingSpaces: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Size (m²)</Label><Input type="number" value={form.propertySize} onChange={(e) => setForm({ ...form, propertySize: e.target.value })} className="mt-1.5" /></div>
                </div>
                <div><Label>Land Size (m²)</Label><Input type="number" value={form.landSize} onChange={(e) => setForm({ ...form, landSize: e.target.value })} className="mt-1.5" /></div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>Country *</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required className="mt-1.5" /></div>
                  <div><Label>County / State *</Label><Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} required className="mt-1.5" /></div>
                  <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1.5" /></div>
                </div>
                <div><Label>Full Address</Label><Input value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} className="mt-1.5" /></div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map((amenity) => (
                    <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedAmenities.includes(amenity) ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Images</h2>
                <div className="flex flex-wrap gap-3">
                  {propertyImages.map((img, i) => (
                    <div key={i} className={`relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border-2 ${img.isPrimary ? 'border-[#D32F2F]' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                      {img.isPrimary && <div className="absolute bottom-0 left-0 right-0 bg-[#D32F2F] text-white text-[10px] text-center py-0.5">Primary</div>}
                    </div>
                  ))}
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                    <span className="text-xs mt-1">{uploading ? 'Uploading...' : 'Add Image'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={saving} className="w-full h-12 bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
