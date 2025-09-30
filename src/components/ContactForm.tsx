"use client";

import { brand } from "@/constants/values";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // You can add API call or other logic here
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif text-gray-800 text-center mb-12">
        Contact
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-500 placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-500 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Phone number */}
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-500 placeholder-gray-400"
          />
        </div>
        
        {/* Comment */}
        <div>
          <textarea
            name="comment"
            placeholder="Comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-500 placeholder-gray-400 resize-none"
          />
        </div>
        
        {/* Submit button */}
        <div className="flex justify-start">
          <button
            type="submit"
            style={{ backgroundColor: brand.primary }}
            className="text-white px-8 py-3 cursor-pointer font-medium transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
