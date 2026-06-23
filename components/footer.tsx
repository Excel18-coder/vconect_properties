'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/images/image.png" alt="VConnect" width={40} height={40} className="rounded-md" />
              <span className="text-xl font-bold">VConnect</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We connect buyers with verified sellers across the region.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-[#2D2D2D] flex items-center justify-center hover:bg-[#D32F2F] transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {['Home', 'Properties', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Property Types</h3>
            <ul className="space-y-2.5">
              {['Apartments', 'Houses', 'Villas', 'Townhouses', 'Commercial', 'Land'].map((item) => (
                <li key={item}>
                  <Link href={`/properties?type=${item.toLowerCase()}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-[#D32F2F] shrink-0" /> Nairobi, Kenya
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-[#D32F2F] shrink-0" /> +254 700 000 000
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-[#D32F2F] shrink-0" /> info@vconnect.co.ke
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2D2D2D] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} VConnect Properties. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
