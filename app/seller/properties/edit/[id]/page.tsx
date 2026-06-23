'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';
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
import { Loader2, Plus, X } from 'lucide-react';

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
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    property_type: '',
    listing_type: 'sale',
    bedrooms: '0',
    bathrooms: '0',
    parking_spaces: '0',
    property_size: '',
    land_size: '',
    country: 'Kenya',
    county: '',
    city: '',
    full_address: '',
    virtual_tour_link: '',
    status: 'active',
  });

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Property not found');
      router.push('/seller');
      return;
    }

    setForm({
      title: data.title,
      description: data.description || '',
      price: String(data.price),
      property_type: data.property_type,
      listing_type: data.listing_type,
      bedrooms: String(data.bedrooms),
      bathrooms: String(data.bathrooms),
      parking_spaces: String(data.parking_spaces),
      property_size: data.property_size ? String(data.property_size) : '',
      land_size: data.land_size ? String(data.land_size) : '',
      country: data.country,
      county: data.county,
      city: data.city,
      full_address: data.full_address || '',
      virtual_tour_link: data.virtual_tour_link || '',
      status: data.status,
    });

    setSelectedAmenities(data.amenities || []);
    setImages(data.images?.map((img: any) => img.image_url) || []);
    setLoading(false);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) setImages([...images, url]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.property_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        property_type: form.property_type,
        listing_type: form.listing_type,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        parking_spaces: parseInt(form.parking_spaces),
        property_size: form.property_size ? parseFloat(form.property_size) : null,
        land_size: form.land_size ? parseFloat(form.land_size) : null,
        country: form.country,
        county: form.county,
        city: form.city,
        full_address: form.full_address,
        virtual_tour_link: form.virtual_tour_link || null,
        amenities: selectedAmenities,
        status: form.status,
      })
      .eq('id', id);

    if (updateError) {
      toast.error('Failed to update property');
      setSaving(false);
      return;
    }

    // Update images
    await supabase.from('property_images').delete().eq('property_id', id);
    if (images.length > 0) {
      const imageRecords = images.map((url, i) => ({
        property_id: id as string,
        image_url: url,
        is_primary: i === 0,
        sort_order: i,
      }));
      await supabase.from('property_images').insert(imageRecords);
    }

    toast.success('Property updated successfully!');
    router.push('/seller');
    setSaving(false);
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
                    <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((t) => (<SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Listing Type *</Label>
                    <Select value={form.listing_type} onValueChange={(v) => setForm({ ...form, listing_type: v })}>
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
                  <div><Label>Parking</Label><Input type="number" value={form.parking_spaces} onChange={(e) => setForm({ ...form, parking_spaces: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Size (m²)</Label><Input type="number" value={form.property_size} onChange={(e) => setForm({ ...form, property_size: e.target.value })} className="mt-1.5" /></div>
                </div>
                <div><Label>Land Size (m²)</Label><Input type="number" value={form.land_size} onChange={(e) => setForm({ ...form, land_size: e.target.value })} className="mt-1.5" /></div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>Country *</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required className="mt-1.5" /></div>
                  <div><Label>County / State *</Label><Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} required className="mt-1.5" /></div>
                  <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1.5" /></div>
                </div>
                <div><Label>Full Address</Label><Input value={form.full_address} onChange={(e) => setForm({ ...form, full_address: e.target.value })} className="mt-1.5" /></div>
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
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addImage} className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
                    <Plus className="h-6 w-6" /><span className="text-xs mt-1">Add Image</span>
                  </button>
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
