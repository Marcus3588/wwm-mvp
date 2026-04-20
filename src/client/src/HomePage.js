
import React from 'react';
import ServicesSection from './ServicesSection';
import PackageListingPage from './PackageListingPage';
import BookingUI from './BookingUI';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-luxury-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-900/40 via-transparent to-gold-800/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-gold-300 text-sm tracking-wider uppercase">Ghana's Premier Experience Curator</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mb-6 leading-tight">
            Curate Your<br />
            <span className="text-gold-400">Perfect Moment</span>
          </h1>
          <p className="text-gold-200/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Luxury experiences crafted for life's finest occasions. From intimate dates to grand celebrations, we orchestrate moments that become memories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium rounded-lg transition transform hover:scale-105 text-lg">
              Explore Experiences
            </button>
            <button className="px-8 py-4 border border-gold-500/50 text-gold-300 hover:bg-gold-500/10 rounded-lg transition">
              Partner With Us
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </div>
    {/* Services / Packages Section */}
    <ServicesSection />
    {/* Package Listing Section */}
    <PackageListingPage />
    {/* Booking UI Section */}
    <BookingUI />
  );
}
