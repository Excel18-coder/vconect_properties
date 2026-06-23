'use client';

import { Shield, Users, Clock, Award, MapPin, Headphones } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Verified Sellers', description: 'All sellers are thoroughly vetted and verified to ensure trust and security in every transaction.' },
  { icon: Users, title: 'Expert Agents', description: 'Connect with experienced real estate professionals who guide you through every step.' },
  { icon: Clock, title: '24/7 Support', description: 'Our dedicated support team is available around the clock to assist with your queries.' },
  { icon: Award, title: 'Premium Listings', description: 'Access exclusive premium properties that you will not find on other platforms.' },
  { icon: MapPin, title: 'Local Expertise', description: 'Deep knowledge of local markets to help you make informed decisions.' },
  { icon: Headphones, title: 'Personalized Service', description: 'Tailored property recommendations based on your preferences and budget.' },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose VConnect</h2>
          <p className="text-gray-400 max-w-xl mx-auto">We provide a seamless property search experience with verified listings and professional support.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="group p-6 rounded-xl bg-[#2D2D2D] hover:bg-[#D32F2F] transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-[#D32F2F] group-hover:bg-white group-hover:text-[#D32F2F] flex items-center justify-center mb-4 transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-white group-hover:text-[#D32F2F]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-white">{feature.title}</h3>
              <p className="text-gray-400 group-hover:text-white/80 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
