'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Dyvine Eshiuma', role: 'Home Buyer', avatar: 'DE', rating: 5, text: 'VConnect made finding our dream home so easy. The verified sellers gave us confidence, and the team was incredibly supportive throughout the process.' },
  { name: 'Excel Baraka', role: 'Property Investor', avatar: 'EB', rating: 5, text: 'As an investor, I need reliable data and verified listings. VConnect delivers both. Their analytics dashboard helps me make informed decisions quickly.' },
  { name: 'Ian Valinyala', role: 'First-time Buyer', avatar: 'IV', rating: 5, text: 'Being a first-time buyer was daunting, but VConnect guided me every step. From search to closing, the experience was seamless and professional.' },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Hear from buyers and sellers who have successfully used VConnect Properties.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Quote className="h-8 w-8 text-[#D32F2F] mb-4 opacity-30" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-sm font-medium">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
