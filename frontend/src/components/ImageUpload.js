'use client';

import { useState, useRef } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUpload({ value, onChange, label = "Upload Image" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fallback if Cloudinary is not configured
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.warn("Cloudinary not configured. Using a placeholder image for demo purposes.");
      setLoading(true);
      // Simulate a small delay for "uploading" feel
      setTimeout(() => {
        const placeholderUrl = `https://images.unsplash.com/photo-1512453979436-5a536f44020e?w=800`;
        onChange(placeholderUrl);
        setLoading(false);
      }, 1000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-luxury-cream/70 mb-2">{label}</label>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-luxury-gold-500/20 rounded-2xl p-8 bg-black/20 hover:bg-black/30 hover:border-luxury-gold-500/40 transition">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
        
        {value ? (
          <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-luxury-gold-500/20">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
               <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex flex-col items-center gap-3 text-luxury-cream/50 hover:text-luxury-gold-400 transition"
          >
            <div className="w-12 h-12 rounded-full bg-luxury-gold-500/10 flex items-center justify-center text-luxury-gold-400">
              {loading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              )}
            </div>
            <span className="text-sm font-medium">{loading ? 'Processing...' : 'Upload Image'}</span>
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-2 italic flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {error}
      </p>}
    </div>
  );
}
