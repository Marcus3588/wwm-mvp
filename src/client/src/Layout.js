
import React from 'react';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream font-sans text-luxury-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-luxury-black/95 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span className="text-luxury-black font-serif font-bold text-sm sm:text-lg">W</span>
              </div>
              <span className="font-serif text-lg sm:text-xl text-white tracking-wide">Walk With Me</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button className="text-gold-200 hover:text-gold-400 transition text-sm tracking-wider uppercase">Experiences</button>
              <button className="text-gold-200 hover:text-gold-400 transition text-sm tracking-wider uppercase">Become a Vendor</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gold-300 hover:text-gold-400 transition text-sm">Sign In</button>
              <button className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-luxury-black rounded text-sm font-medium transition">Join</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 pt-20 sm:pt-24">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
