'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : '');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-luxury-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl text-white hover:text-luxury-gold-400 transition tracking-wide">
          Walk With Me
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { href: '/packages', label: 'Experiences' },
            { href: '/packages?category=date', label: 'Dates' },
            { href: '/packages?category=party', label: 'Parties' },
            { href: '/packages?category=trip', label: 'Trips' },
            { href: '/packages?category=birthday', label: 'Birthdays' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-luxury-cream/70 hover:text-white transition text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 hover:border-white/40 hover:shadow-md transition bg-transparent"
              >
                {/* Hamburger */}
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-luxury-gold-500 flex items-center justify-center text-luxury-black font-bold text-sm uppercase">
                  {displayName?.[0] || 'U'}
                </div>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  className="absolute right-0 top-12 w-64 bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {/* User Info */}
                  <div className="px-5 py-4 border-b border-luxury-gold-500/10">
                    <p className="text-white font-semibold capitalize">{displayName}</p>
                    <p className="text-luxury-cream/50 text-xs mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-2">
                    {profile?.role === 'vendor' && (
                      <Link
                        href="/vendor/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-luxury-cream/80 hover:bg-luxury-gold-500/10 hover:text-white transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Vendor Dashboard
                      </Link>
                    )}
                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-luxury-cream/80 hover:bg-luxury-gold-500/10 hover:text-white transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/bookings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-luxury-cream/80 hover:bg-luxury-gold-500/10 hover:text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      My Bookings
                    </Link>
                    <Link
                      href="/packages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-luxury-cream/80 hover:bg-luxury-gold-500/10 hover:text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      Explore Experiences
                    </Link>
                  </div>

                  <div className="border-t border-luxury-gold-500/10 py-2">
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-luxury-cream/60 hover:bg-red-500/10 hover:text-red-300 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-luxury-cream/80 hover:text-white font-medium transition px-3 py-2 rounded-full hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/login?register=1"
                className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-100 transition shadow"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
