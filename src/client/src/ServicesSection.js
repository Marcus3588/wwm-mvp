import React from 'react';

const services = [
  {
    title: 'Guided City Walks',
    description: 'Explore the city with our expert guides and discover hidden gems, history, and culture.',
    icon: '🗺️',
  },
  {
    title: 'Adventure Packages',
    description: 'Experience thrilling adventures, from hiking to biking, tailored for all levels.',
    icon: '⛰️',
  },
  {
    title: 'Luxury Experiences',
    description: 'Indulge in premium tours, fine dining, and exclusive events for a memorable journey.',
    icon: '✨',
  },
];

const ServicesSection = () => (
  <section id="services" className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-luxury-black">Our Services & Packages</h2>
      <p className="mb-12 text-lg text-gray-600">Choose from a variety of curated experiences designed for every traveler.</p>
      <div className="grid gap-8 md:grid-cols-3">
        {services.map((service, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg shadow p-8 flex flex-col items-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-luxury-black">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
