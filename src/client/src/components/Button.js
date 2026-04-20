import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'px-6 py-3 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-gold-400';
  const variants = {
    primary: 'bg-gold-500 hover:bg-gold-400 text-luxury-black',
    outline: 'border border-gold-500/50 text-gold-300 hover:bg-gold-500/10',
    secondary: 'bg-luxury-black text-gold-300 hover:bg-gold-700',
  };
  return (
    <button className={`${base} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
