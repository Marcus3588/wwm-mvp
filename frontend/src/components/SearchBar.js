'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [activeTab, setActiveTab] = useState(null); // 'where', 'when', 'who'
  const router = useRouter();

  const handleSearch = () => {
    let url = '/packages?';
    if (query.trim()) url += `q=${encodeURIComponent(query.trim())}&`;
    if (date) url += `date=${date}&`;
    if (guests) url += `guests=${guests}`;

    // Remove trailing ? or &
    url = url.endsWith('?') ? '/packages' : url.endsWith('&') ? url.slice(0, -1) : url;
    router.push(url);
  };

  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto flex items-center bg-white rounded-full shadow-2xl border border-gray-200 transition-all duration-300"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 18 }}
    >
      <div className="flex w-full divide-x divide-gray-200 items-center">
        {/* Where */}
        <div
          className={`flex-1 relative rounded-full px-8 py-4 hover:bg-gray-100 cursor-pointer transition ${activeTab === 'where' ? 'bg-white shadow-lg' : ''}`}
          onClick={() => setActiveTab('where')}
        >
          <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Where</div>
          <input
            type="text"
            className="w-full bg-transparent outline-none text-gray-600 placeholder-gray-400 font-medium"
            placeholder="Search destinations"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* When */}
        <div
          className={`flex-1 relative px-8 py-4 hover:bg-gray-100 cursor-pointer transition ${activeTab === 'when' ? 'bg-white shadow-lg rounded-full' : ''}`}
          onClick={() => setActiveTab('when')}
        >
          <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">When</div>
          <input
            type="text"
            className="w-full bg-transparent outline-none text-gray-600 placeholder-gray-400 font-medium"
            placeholder="Add dates"
            value={date}
            onChange={e => setDate(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {/* Note: In a full implementation, you'd use a date picker here */}
        </div>

        {/* Who */}
        <div
          className={`flex-[1.2] relative rounded-r-full pl-8 pr-3 py-3 hover:bg-gray-100 cursor-pointer transition flex items-center justify-between ${activeTab === 'who' ? 'bg-white shadow-lg' : ''}`}
          onClick={() => setActiveTab('who')}
        >
          <div>
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Who</div>
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600 placeholder-gray-400 font-medium"
              placeholder="Add guests"
              value={guests}
              onChange={e => setGuests(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="ml-4 px-6 py-4 bg-[#e61e4d] hover:bg-[#d70466] text-white font-semibold rounded-full transition shadow-lg flex items-center gap-2"
            onClick={handleSearch}
          >
            <svg className="w-5 h-5 text-white stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="hidden md:inline">Search</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
