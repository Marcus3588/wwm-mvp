import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Accra',
    text: 'The sunset yacht experience was magical. Every detail was perfect. Best anniversary gift ever!',
    avatar: 'SM',
  },
  {
    name: 'James D.',
    location: 'Kumasi',
    text: 'I proposed during the hot air balloon ride and she said yes! The team made everything so special.',
    avatar: 'JD',
  },
  {
    name: 'Emily K.',
    location: 'Takoradi',
    text: 'My 30th birthday party was incredible. The private villa, chef, everything was beyond expectations!',
    avatar: 'EK',
  },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((i) => (i + 1) % testimonials.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-2 mb-4 text-luxury-gold-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            ))}
          </div>
          <p className="text-gray-600 mb-6">"{testimonials[index].text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold-400 to-luxury-gold-500 rounded-full flex items-center justify-center text-white font-semibold">
              {testimonials[index].avatar}
            </div>
            <div>
              <p className="font-semibold">{testimonials[index].name}</p>
              <p className="text-sm text-gray-500">{testimonials[index].location}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={prev} className="w-8 h-8 rounded-full bg-luxury-gold-500/20 hover:bg-luxury-gold-500 text-luxury-black font-bold transition">&#8592;</button>
        <button onClick={next} className="w-8 h-8 rounded-full bg-luxury-gold-500/20 hover:bg-luxury-gold-500 text-luxury-black font-bold transition">&#8594;</button>
      </div>
    </div>
  );
}
