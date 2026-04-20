import React from 'react';
import Card from './components/Card';
import Button from './components/Button';

const packages = [
  {
    title: 'Romantic Getaway',
    description: 'A luxury experience for couples: private dinner, spa, and city tour.',
    price: '₵2,500',
    icon: '💑',
  },
  {
    title: 'Adventure Explorer',
    description: 'Guided hikes, biking, and adventure sports for thrill-seekers.',
    price: '₵1,800',
    icon: '🚵',
  },
  {
    title: 'Family Fun',
    description: 'Activities and tours for the whole family, including kids events.',
    price: '₵2,200',
    icon: '👨‍👩‍👧‍👦',
  },
];

const PackageListingPage = () => (
  <section className="py-16 bg-gray-50 min-h-screen">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-luxury-black text-center">Our Packages</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {packages.map((pkg, idx) => (
          <Card key={idx} title={pkg.title} description={pkg.description} icon={pkg.icon} className="relative">
            <div className="mt-4 mb-2 text-lg font-bold text-gold-600">{pkg.price}</div>
            <Button variant="primary" className="w-full mt-2">Book Now</Button>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default PackageListingPage;
