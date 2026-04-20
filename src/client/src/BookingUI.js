import React, { useState } from 'react';
import Button from './components/Button';

const BookingUI = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    date: '',
    package: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-luxury-black">Book Your Experience</h2>
        {submitted ? (
          <div className="bg-green-100 text-green-700 p-6 rounded-lg text-center">
            Thank you for booking! We will contact you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-gray-50 p-6 rounded-xl shadow">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Package</label>
              <select
                name="package"
                value={form.package}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:ring-gold-400"
              >
                <option value="">Select a package</option>
                <option value="Romantic Getaway">Romantic Getaway</option>
                <option value="Adventure Explorer">Adventure Explorer</option>
                <option value="Family Fun">Family Fun</option>
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full">Book Now</Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default BookingUI;
