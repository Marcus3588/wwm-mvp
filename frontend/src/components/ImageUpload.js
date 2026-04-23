'use client';

import { useState, useRef } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'wwm-luxury';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'wwm_unsigned';

export default function ImageUpload({ value, onChange, label = "Upload Image" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      console.error("Cloudinary upload error:", err);
      setError("Failed to upload. Ensure CLOUD_NAME/PRESET are set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-luxury-cream/70">{label}</label>
      
      {value ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-luxury-gold-500/20 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-white text-black hover:bg-luxury-gold-500 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <button 
              type="button"
              onClick={() => onChange('')}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-luxury-gold-500/20 bg-luxury-charcoal/20 hover:bg-luxury-gold-500/5 hover:border-luxury-gold-500/40 transition flex flex-col items-center justify-center group"
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-3 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-luxury-gold-400 font-medium">Uploading to cloud...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-luxury-gold-500/10 flex items-center justify-center text-luxury-gold-400 mb-4 group-hover:scale-110 transition">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-white font-medium">Click to upload cover photo</p>
              <p className="text-luxury-cream/40 text-xs mt-1">Professional high-res images recommended (max 10MB)</p>
            </>
          )}
        </button>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
