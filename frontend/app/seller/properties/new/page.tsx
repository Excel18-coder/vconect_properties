'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Loader2,
    Upload,
    X,
    Plus,
    Building2,
    MapPin,
    Info,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const steps = [
    { id: 'basic', title: 'Basic Info', icon: <Info className="h-4 w-4" /> },
    { id: 'location', title: 'Location', icon: <MapPin className="h-4 w-4" /> },
    { id: 'details', title: 'Specs & Features', icon: <Building2 className="h-4 w-4" /> },
    { id: 'images', title: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
];

export default function NewProperty() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        propertyType: 'apartment',
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
        amenities: [],
        features: [],
        virtualTourLink: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedImages: any[] = [...images];

        for (const file of files) {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            try {
                const res: any = await api.post('/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImages.push({
                    url: res.data.url,
                    publicId: res.data.publicId,
                    isPrimary: uploadedImages.length === 0,
                    sortOrder: uploadedImages.length
                });
            } catch (error: any) {
                const msg = error.response?.data?.message || error.message || 'Unknown error';
                toast.error(`Failed to upload ${file.name}: ${msg}`);
            }
        }

        setImages(uploadedImages as any);
        setUploading(false);
    };

    const removeImage = async (publicId: string) => {
        try {
            await api.delete(`/upload/${encodeURIComponent(publicId)}`);
            setImages(prev => prev.filter((img: any) => img.publicId !== publicId));
        } catch (error) {
            toast.error('Failed to delete image from server');
        }
    };

    const setPrimaryImage = (index: number) => {
        setImages(prev => prev.map((img: any, i: number) => ({
            ...img,
            isPrimary: i === index
        })));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.price || !formData.city || !formData.county) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (images.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                parkingSpaces: Number(formData.parkingSpaces),
                propertySize: formData.propertySize ? Number(formData.propertySize) : undefined,
                landSize: formData.landSize ? Number(formData.landSize) : undefined,
                images
            };

            await api.post('/properties', payload);
            toast.success('Property listed successfully! Waiting for admin approval.');
            router.push('/seller/properties');
        } catch (error: any) {
            toast.error(error.message || 'Failed to list property');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    if (!user || user.role !== 'seller') {
        return <div className="p-8 text-center">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">List New Property</h1>
                    <p className="text-gray-600 font-medium">Follow the steps to showcase your property to millions of buyers.</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= index ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-lg' : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {currentStep > index ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                            </div>
                            <span className={`text-xs mt-2 font-semibold ${currentStep >= index ? 'text-[#D32F2F]' : 'text-gray-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <Card className="shadow-xl border-none">
                    <CardHeader className="bg-white border-b">
                        <CardTitle>{steps[currentStep].title}</CardTitle>
                        <CardDescription>Fill in the details for your property listing.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">

                        {/* Step 0: Basic Info */}
                        {currentStep === 0 && (
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-[#1A1A1A] font-bold">Listing Title *</Label>
                                    <Input
                                        id="title" name="title" value={formData.title} onChange={handleChange}
                                        placeholder="e.g. Modern 3-Bedroom Apartment in Kilimani"
                                        className="h-12 border-gray-300 focus:border-[#D32F2F] text-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="listingType" className="font-bold">Listing Type *</Label>
                                        <Select value={formData.listingType} onValueChange={(v) => handleSelectChange('listingType', v)}>
                                            <SelectTrigger className="h-12 border-gray-300">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sale">For Sale</SelectItem>
                                                <SelectItem value="rent">For Rent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price" className="font-bold">Price (KES) *</Label>
                                        <Input
                                            id="price" name="price" type="number" value={formData.price} onChange={handleChange}
                                            placeholder="e.g. 15000000"
                                            className="h-12 border-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="propertyType" className="font-bold">Property Category *</Label>
                                    <Select value={formData.propertyType} onValueChange={(v) => handleSelectChange('propertyType', v)}>
                                        <SelectTrigger className="h-12 border-gray-300">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="apartment">Apartment</SelectItem>
                                            <SelectItem value="house">House / Villa</SelectItem>
                                            <SelectItem value="commercial">Commercial</SelectItem>
                                            <SelectItem value="land">Land / Plot</SelectItem>
                                            <SelectItem value="office">Office Space</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="font-bold">Description</Label>
                                    <Textarea
                                        id="description" name="description" value={formData.description} onChange={handleChange}
                                        placeholder="Describe the property's key selling points..."
                                        className="min-h-[150px] border-gray-300"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 1: Location */}
                        {currentStep === 1 && (
                            <div className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="county" className="font-bold">County *</Label>
                                        <Input id="county" name="county" value={formData.county} onChange={handleChange} placeholder="e.g. Nairobi" className="h-12" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="city" className="font-bold">City / Area *</Label>
                                        <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Westlands" className="h-12" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullAddress" className="font-bold">Detailed Address</Label>
                                    <Textarea id="fullAddress" name="fullAddress" value={formData.fullAddress} onChange={handleChange} placeholder="e.g. Rhapta Road, Block B, Apt 4" className="border-gray-300" />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Specs & Features */}
                        {currentStep === 2 && (
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="bedrooms" className="font-bold">Bedrooms</Label>
                                        <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="h-12" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bathrooms" className="font-bold">Bathrooms</Label>
                                        <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="h-12" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="parkingSpaces" className="font-bold">Parking</Label>
                                        <Input id="parkingSpaces" name="parkingSpaces" type="number" value={formData.parkingSpaces} onChange={handleChange} className="h-12" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="propertySize" className="font-bold">Property Size (m²)</Label>
                                        <Input id="propertySize" name="propertySize" type="number" value={formData.propertySize} onChange={handleChange} placeholder="e.g. 120" className="h-12" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="virtualTourLink" className="font-bold">Virtual Tour URL</Label>
                                        <Input id="virtualTourLink" name="virtualTourLink" value={formData.virtualTourLink} onChange={handleChange} placeholder="https://..." className="h-12" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <div className="grid gap-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" /> : <Upload className="h-8 w-8 text-[#D32F2F]" />}
                                        </div>
                                        <h3 className="text-lg font-bold">Click or drag images to upload</h3>
                                        <p className="text-gray-500 text-sm mt-1">Upload high-quality images of your property (Max 10MB per file)</p>
                                    </div>
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {images.map((img, index) => (
                                            <div key={img.publicId} className="relative aspect-square rounded-lg overflow-hidden border group border-gray-200">
                                                <img src={img.url} alt="Property" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {!img.isPrimary && (
                                                        <Button size="sm" variant="secondary" onClick={() => setPrimaryImage(index)} className="h-8 px-2 text-xs">Set Primary</Button>
                                                    )}
                                                    <button onClick={() => removeImage(img.publicId)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {img.isPrimary && (
                                                    <div className="absolute top-1 left-1 bg-[#D32F2F] text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">Primary</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-12 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                className="h-11 px-6 border-[#D32F2F] text-[#D32F2F]"
                                disabled={currentStep === 0 || loading}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button onClick={nextStep} className="bg-[#D32F2F] hover:bg-[#B71C1C] h-11 px-8">
                                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-green-600 hover:bg-green-700 h-11 px-10 shadow-lg"
                                    disabled={loading || images.length === 0}
                                >
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : 'Publish Listing'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
