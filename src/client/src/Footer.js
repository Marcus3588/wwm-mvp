import React from 'react';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-6 mt-10">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <span className="font-bold text-lg">WWM</span> &copy; {new Date().getFullYear()}
      </div>
      <div className="flex space-x-4">
        <a href="#services" className="hover:underline">Services</a>
        <a href="#packages" className="hover:underline">Packages</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
  </footer>
);

export default Footer;
