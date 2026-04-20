"use client";
import Link from 'next/link';
import PackageGrid from '@/components/PackageGrid';
import SearchBar from '@/components/SearchBar';
import CategoryFilters from '@/components/CategoryFilters';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HomePageClient({ packages }) {
  const [activeCategory, setActiveCategory] = useState('');
  const filteredPackages = activeCategory
    ? packages.filter(pkg => pkg.category?.toLowerCase() === activeCategory)
    : packages;

  return (
    <>
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold-900/40 via-transparent to-luxury-gold-800/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold-600/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, type: 'spring' }}
          className="w-full max-w-2xl mb-8"
        >
          <SearchBar onSearch={q => window.location.href = `/packages?search=${encodeURIComponent(q)}`} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7, type: 'spring' }}
          className="w-full max-w-4xl mx-auto"
        >
          <CategoryFilters active={activeCategory} onChange={setActiveCategory} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, type: 'spring' }}
          className="w-full max-w-7xl px-2"
        >
          <PackageGrid packages={filteredPackages.slice(0, 6)} />
        </motion.div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-white mb-4">
            All Experiences
          </h2>
          <p className="text-center text-luxury-cream/70 max-w-xl mx-auto mb-12">
            Browse our curated collection for every occasion.
          </p>
          <PackageGrid packages={filteredPackages} />
          <div className="text-center mt-12">
            <Link
              href="/packages"
              className="inline-block px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 hover:bg-luxury-gold-500/10 rounded transition"
            >
              View All Experiences
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-luxury-black/90 border-t border-luxury-gold-500/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-luxury-gold-400 mb-8">
            What Our Guests Say
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>
    </>
  );
}