import React from 'react';

const Card = ({ title, description, icon, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow p-6 flex flex-col items-center ${className}`}>
    {icon && <div className="text-4xl mb-3">{icon}</div>}
    {title && <h3 className="text-lg font-semibold mb-2 text-luxury-black">{title}</h3>}
    {description && <p className="text-gray-600 mb-2 text-center">{description}</p>}
    {children}
  </div>
);

export default Card;
