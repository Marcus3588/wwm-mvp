import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { label: 'All', value: '' },
  { label: 'Dates', value: 'date' },
  { label: 'Trips', value: 'trip' },
  { label: 'Parties', value: 'party' },
  { label: 'Birthdays', value: 'birthday' },
  { label: 'Proposals', value: 'proposal' },
];

export default function CategoryFilters({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((cat, i) => (
        <motion.button
          key={cat.value}
          onClick={() => onChange?.(cat.value)}
          className={`px-5 py-2 rounded-full border-2 font-medium transition text-sm focus:outline-none ${active === cat.value ? 'bg-luxury-gold-500 text-luxury-black border-luxury-gold-500 shadow' : 'bg-white/80 text-luxury-gold-500 border-luxury-gold-400 hover:bg-luxury-gold-500/10'}`}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 80, damping: 18 }}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}
