'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function PackageCard({ pkg }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const images = pkg.images?.length ? pkg.images : ['https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800'];

  const nextImage = (e) => {
    e.preventDefault();
    if (currentImage < images.length - 1) setCurrentImage(prev => prev + 1);
  };

  const prevImage = (e) => {
    e.preventDefault();
    if (currentImage > 0) setCurrentImage(prev => prev - 1);
  };

  const toggleLike = (e) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex flex-col gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-luxury-charcoal">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentImage * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative w-full h-full flex-shrink-0">
              <Image
                src={img}
                alt={pkg.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 z-10 p-1 rounded-full transition-transform active:scale-90"
        >
          <Heart fill={isLiked ? '#ff385c' : 'rgba(0,0,0,0.5)'} color={isLiked ? '#ff385c' : 'white'} strokeWidth={isLiked ? 0 : 2} size={26} />
        </button>

        {/* Carousel Controls */}
        <AnimatePresence>
          {isHovered && images.length > 1 && (
            <>
              {currentImage > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md z-10 transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronLeft size={16} />
                </motion.button>
              )}
              {currentImage < images.length - 1 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md z-10 transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={16} />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full bg-white ${currentImage === idx ? 'w-1.5 h-1.5 opacity-100' : 'w-1 h-1 opacity-60'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-white/90 truncate">{pkg.title}</h3>
          {/* Mock Rating */}
          <div className="flex items-center gap-1 shrink-0 text-sm">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="block h-3 w-3 fill-current"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
            <span>{(Math.random() * (5.0 - 4.5) + 4.5).toFixed(2)}</span>
          </div>
        </div>
        <p className="text-luxury-cream/50 text-sm mt-0.5 capitalize">{pkg.category} Experience</p>
        <p className="text-luxury-cream/50 text-sm line-clamp-1">{pkg.short_description}</p>
        <p className="mt-1 text-white/90">
          <span className="font-semibold">{(pkg.base_price_cents / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
          <span className="text-luxury-cream/50"> base minimum</span>
        </p>
      </div>
    </Link>
  );
}

export default function PackageGrid({ packages }) {
  if (!packages?.length) {
    return (
      <div className="text-center py-12 text-luxury-cream/60">
        No packages available. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
