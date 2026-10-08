'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PropertyCard } from '@/components/property-card';
import api from '@/lib/api';
import type { Property } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bed, Bath, Car, Maximize, MapPin, Heart, Share2, Phone, Mail, Calendar,
  MessageSquare, CheckCircle, Loader2, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [inquiryPaid, setInquiryPaid] = useState(false);
  const [inquiryPaymentId, setInquiryPaymentId] = useState<string | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    preferredContactTime: '',
    message: '',
    inquiryType: 'information' as const,
  });
  const [viewingForm, setViewingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [res, favRes]: [any, any] = await Promise.all([
          api.get(`/properties/${id}`),
          user ? api.get(`/favorites/check/${id}`) : Promise.resolve({ isFavorited: false })
        ]);

        if (res.success) {
          setProperty(res.data);
          // Load similar properties
          const similarRes: any = await api.get('/properties', {
            params: { type: res.data.propertyType, limit: 3 }
          });
          if (similarRes.success) {
            setSimilarProperties(similarRes.data.filter((p: Property) => p._id !== id));
          }
        }
        if (favRes && favRes.isFavorited !== undefined) {
          setIsFavorited(favRes.isFavorited);
        }

        if (user) {
          const inquiryAccessRes: any = await api.get(`/payments/entitlements/inquiry/${id}`);
          setInquiryPaid(Boolean(inquiryAccessRes?.data?.eligible));
        } else {
          setInquiryPaid(false);
        }
      } catch (error) {
        console.error('Failed to load property details:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  useEffect(() => {
    if (!user) return;

    const fullName = user.fullName || '';
    const email = user.email || '';
    const phone = user.phone || '';

    setInquiryForm((prev) => ({
      ...prev,
      fullName: prev.fullName || fullName,
      email: prev.email || email,
      phone: prev.phone || phone,
    }));

    setViewingForm((prev) => ({
      ...prev,
      fullName: prev.fullName || fullName,
      email: prev.email || email,
      phone: prev.phone || phone,
    }));
  }, [user]);

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);
    return type === 'rent' ? `${formatted}/mo` : formatted;
  };

  const toggleFavorite = async () => {
    if (!user) { toast.error('Please sign in to save favorites'); return; }
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await api.post('/favorites', { propertyId: id });
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  useEffect(() => {
    if (!inquiryPaymentId) return;

    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const response: any = await api.get(`/payments/status/${inquiryPaymentId}`);
        const payment = response?.data?.payment;

        if (!payment || cancelled) return;

        if (payment.status === 'paid') {
          setInquiryPaid(true);
          setInquiryPaymentId(null);
          window.clearInterval(interval);
          toast.success('PayHero payment confirmed. You can now send the inquiry.');
        }

        if (payment.status === 'failed' || payment.status === 'cancelled') {
          setInquiryPaymentId(null);
          window.clearInterval(interval);
          toast.error('Payment did not complete');
        }
      } catch (error) {
        // keep polling until timeout or success
      }
    }, 5000);

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        toast.message('Still waiting for PayHero confirmation. You can retry if needed.');
      }
      setInquiryPaymentId(null);
      window.clearInterval(interval);
    }, 120000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [inquiryPaymentId]);

  const startInquiryPayment = async () => {
    if (!property) return;
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    const phone = inquiryForm.phone || user.phone || '';
    if (!phone.trim()) {
      toast.error('Add a phone number so PayHero can send the STK push');
      return;
    }

    setSubmitting(true);
    try {
      const response: any = await api.post('/payments/initiate', {
        role: 'buyer',
        purpose: 'inquiry_fee',
        propertyId: property._id,
        phone,
        billingCycle: 'monthly',
      });

      const paymentId = response?.data?.paymentId;
      const checkoutUrl = response?.data?.checkoutUrl;

      if (paymentId) {
        setInquiryPaymentId(paymentId);
      }

      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }

      toast.message('Complete the KES 350 PayHero payment to unlock the inquiry form.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start the PayHero payment');
    } finally {
      setSubmitting(false);
    }
  };

  const submitInquiry = async () => {
    if (!property) return;
    if (!user) {
      toast.error('Please sign in to send an inquiry');
      return;
    }
    if (!inquiryPaid) {
      toast.error('Please complete the KES 350 payment first');
      return;
    }
    setSubmitting(true);
    try {
      const response: any = await api.post('/inquiries', {
        propertyId: property._id,
        ...inquiryForm,
      });
      if (response.success) {
        toast.success('Inquiry sent successfully!');
        setShowContact(true);
      }
    } catch (error) {
      toast.error('Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const submitViewingRequest = async () => {
    if (!property) return;
    if (!user) {
      toast.error('Please sign in to request a viewing');
      return;
    }

    setSubmitting(true);
    try {
      const viewingMessage = [
        viewingForm.notes?.trim(),
        viewingForm.preferredDate || viewingForm.preferredTime
          ? `Preferred viewing: ${viewingForm.preferredDate || 'Any date'} ${viewingForm.preferredTime || 'Any time'}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const response: any = await api.post('/inquiries', {
        propertyId: property._id,
        fullName: viewingForm.fullName,
        email: viewingForm.email,
        phone: viewingForm.phone,
        preferredContact: 'phone',
        preferredContactTime: viewingForm.preferredTime,
        message: viewingMessage,
        inquiryType: 'viewing',
      });

      if (response.success) {
        toast.success('Viewing request sent successfully!');
        setShowContact(true);
      }
    } catch (error) {
      toast.error('Failed to send viewing request');
    } finally {
      setSubmitting(false);
    }
  };

  const shareProperty = async () => {
    if (navigator.share) {
      await navigator.share({ title: property?.title, text: `Check out this property: ${property?.title}`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) return (<div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#D32F2F]" /></div><Footer /></div>);
  if (!property) return (<div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><div className="text-center"><h2 className="text-xl font-semibold text-gray-700">Property not found</h2><Link href="/properties"><Button className="mt-4 bg-[#D32F2F]">Browse Properties</Button></Link></div></div><Footer /></div>);

  const images = (property.images && property.images.length > 0) ? [...property.images].sort((a, b) => a.sortOrder - b.sortOrder) : [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', isPrimary: true }];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative h-[400px] sm:h-[500px] bg-gray-900">
          <Image src={images[currentImage]?.url || images[0]?.url} alt={property.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          {images.length > 1 && (<>
            <button onClick={() => setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
          </>)}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (<button key={i} onClick={() => setCurrentImage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />))}
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-[#D32F2F] text-white">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
            {property.isFeatured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{property.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{property.fullAddress || `${property.city}, ${property.county}, ${property.country}`}</span>
                </div>
                <p className="text-2xl font-bold text-[#D32F2F] mt-3">{formatPrice(property.price, property.listingType)}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms > 0 && (<div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg"><Bed className="h-6 w-6 text-[#D32F2F]" /><div><p className="text-lg font-semibold">{property.bedrooms}</p><p className="text-xs text-gray-500">Bedrooms</p></div></div>)}
                {property.bathrooms > 0 && (<div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg"><Bath className="h-6 w-6 text-[#D32F2F]" /><div><p className="text-lg font-semibold">{property.bathrooms}</p><p className="text-xs text-gray-500">Bathrooms</p></div></div>)}
                {property.parkingSpaces > 0 && (<div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg"><Car className="h-6 w-6 text-[#D32F2F]" /><div><p className="text-lg font-semibold">{property.parkingSpaces}</p><p className="text-xs text-gray-500">Parking</p></div></div>)}
                {property.propertySize && (<div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg"><Maximize className="h-6 w-6 text-[#D32F2F]" /><div><p className="text-lg font-semibold">{property.propertySize}</p><p className="text-xs text-gray-500">m²</p></div></div>)}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description || 'No description available.'}</p>
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (<div key={amenity} className="flex items-center gap-2 text-gray-700"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">{amenity}</span></div>))}
                  </div>
                </div>
              )}
              {property.features && property.features.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.features.map((feature) => (<div key={feature} className="flex items-center gap-2 text-gray-700"><CheckCircle className="h-4 w-4 text-[#D32F2F]" /><span className="text-sm">{feature}</span></div>))}
                  </div>
                </div>
              )}
              {similarProperties.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarProperties.map((p) => (<PropertyCard key={p._id} property={p} showFavorite={false} />))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
                <div className="flex gap-2">
                  <Button onClick={toggleFavorite} variant="outline" className={`flex-1 ${isFavorited ? 'text-[#D32F2F] border-[#D32F2F]' : ''}`}>
                    <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-[#D32F2F]' : ''}`} />{isFavorited ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={shareProperty}><Share2 className="h-4 w-4" /></Button>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white h-12"><MessageSquare className="h-4 w-4 mr-2" />Request Information</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Request Information</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      {!inquiryPaid && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
                          <p className="font-medium">KES 350 PayHero payment required</p>
                          <p>Pay once to unlock the property inquiry form and send your request to the seller.</p>
                          <Button onClick={startInquiryPayment} disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay KES 350 with PayHero'}
                          </Button>
                        </div>
                      )}
                      <div><Label>Full Name</Label><Input value={inquiryForm.fullName} onChange={(e) => setInquiryForm({ ...inquiryForm, fullName: e.target.value })} /></div>
                      <div><Label>Email</Label><Input type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })} /></div>
                      <div><Label>Phone</Label><Input value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} /></div>
                      <div><Label>Message</Label><Textarea value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} placeholder="I am interested in this property..." /></div>
                      <Button onClick={submitInquiry} disabled={submitting || !inquiryPaid} className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : inquiryPaid ? 'Send Inquiry' : 'Pay to Continue'}</Button>
                      {!inquiryPaid && <p className="text-xs text-gray-500 text-center">The inquiry form will unlock immediately after PayHero confirms payment.</p>}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12"><Calendar className="h-4 w-4 mr-2" />Schedule Viewing</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Schedule a Viewing</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Full Name</Label><Input value={viewingForm.fullName} onChange={(e) => setViewingForm({ ...viewingForm, fullName: e.target.value })} /></div>
                      <div><Label>Email</Label><Input type="email" value={viewingForm.email} onChange={(e) => setViewingForm({ ...viewingForm, email: e.target.value })} /></div>
                      <div><Label>Phone</Label><Input value={viewingForm.phone} onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })} /></div>
                      <div><Label>Preferred Date</Label><Input type="date" value={viewingForm.preferredDate} onChange={(e) => setViewingForm({ ...viewingForm, preferredDate: e.target.value })} /></div>
                      <div><Label>Preferred Time</Label><Input type="time" value={viewingForm.preferredTime} onChange={(e) => setViewingForm({ ...viewingForm, preferredTime: e.target.value })} /></div>
                      <div><Label>Notes</Label><Textarea value={viewingForm.notes} onChange={(e) => setViewingForm({ ...viewingForm, notes: e.target.value })} placeholder="Any special requests..." /></div>
                      <Button onClick={submitViewingRequest} disabled={submitting} className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Viewing'}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-lg mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-xl font-medium">{(property.sellerId as any)?.fullName?.charAt(0) || 'A'}</div>
                  <div>
                    <p className="font-semibold">{(property.sellerId as any)?.fullName || 'Agent'}</p>
                    <p className="text-sm text-gray-500">{(property.sellerId as any)?.agencyName || 'Independent'}</p>
                    {(property.sellerId as any)?.verificationStatus === 'verified' && (<div className="flex items-center gap-1 text-green-600 text-xs mt-1"><CheckCircle className="h-3.5 w-3.5" /><span>Verified Seller</span></div>)}
                  </div>
                </div>
                {showContact ? (
                  <div className="space-y-2">
                    {(property.sellerId as any)?.phone && (<div className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-[#D32F2F]" /><span>{(property.sellerId as any).phone}</span></div>)}
                    <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-[#D32F2F]" /><span>{(property.sellerId as any)?.email}</span></div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">Contact details will be revealed after you submit an inquiry.</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-lg mb-4">Property Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Property Type</span><span className="font-medium capitalize">{property.propertyType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Listing Type</span><span className="font-medium capitalize">{property.listingType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Country</span><span className="font-medium">{property.country}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">County</span><span className="font-medium">{property.county}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium">{property.city}</span></div>
                  {property.landSize && (<div className="flex justify-between"><span className="text-gray-500">Land Size</span><span className="font-medium">{property.landSize} m²</span></div>)}
                  <div className="flex justify-between"><span className="text-gray-500">Listed</span><span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Views</span><span className="font-medium">{property.viewsCount.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
