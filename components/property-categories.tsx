'use client';

import Link from 'next/link';
import { Building2, Home, Castle, Warehouse, Store, Briefcase, TreePine } from 'lucide-react';

const categories = [
  { id: 'apartment', label: 'Apartments', icon: Building2, count: 2340, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400' },
  { id: 'house', label: 'Houses', icon: Home, count: 1850, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { id: 'villa', label: 'Villas', icon: Castle, count: 420, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
  { id: 'townhouse', label: 'Townhouses', icon: Warehouse, count: 680, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
  { id: 'commercial', label: 'Commercial', icon: Store, count: 890, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400' },
  { id: 'office', label: 'Offices', icon: Briefcase, count: 560, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
  { id: 'land', label: 'Land', icon: TreePine, count: 320, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
];

export function PropertyCategories() {
  return (
    <section className="py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">Browse by Category</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Explore properties across different categories to find exactly what you are looking for.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/properties?type=${cat.id}`} className="group relative overflow-hidden rounded-xl aspect-square bg-white shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundImage: `url(${cat.image})` }} />
              <div className="relative h-full flex flex-col items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3 group-hover:bg-[#D32F2F] group-hover:text-white transition-colors duration-300">
                  <cat.icon className="h-7 w-7 text-[#D32F2F] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#1A1A1A] text-sm text-center">{cat.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.count.toLocaleString()} listings</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
