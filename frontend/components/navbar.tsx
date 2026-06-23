'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Home, Search, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Search },
  ];

  const dashboardLink = profile?.role === 'admin'
    ? '/admin'
    : profile?.role === 'seller'
    ? '/seller'
    : '/buyer';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/images/image.png" alt="VConnect Properties" width={40} height={40} className="rounded-md" />
            <span className="text-xl font-bold text-[#1A1A1A] hidden sm:inline">VConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#D32F2F] rounded-lg hover:bg-red-50 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/buyer/favorites">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#D32F2F]">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-sm font-medium">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{profile?.full_name || 'Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">{profile?.role}</Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboardLink} className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/buyer/favorites" className="flex items-center gap-2 cursor-pointer">
                        <Heart className="h-4 w-4" /> Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-gray-700 hover:text-[#D32F2F]">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                <link.icon className="h-5 w-5" /> {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashboardLink} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="h-5 w-5" /> Dashboard
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full">
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  <User className="h-5 w-5" /> Sign In
                </Link>
                <Link href="/auth/signup" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium bg-[#D32F2F] text-white rounded-lg" onClick={() => setMobileOpen(false)}>
                  <User className="h-5 w-5" /> Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
