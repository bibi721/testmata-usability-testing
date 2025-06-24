"use client";

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Mock company logos
  const companies = [
    { name: "Microsoft", logo: "https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg" },
    { name: "Google", logo: "https://images.pexels.com/photos/5325854/pexels-photo-5325854.jpeg" },
    { name: "Netflix", logo: "https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg" },
    { name: "Airbnb", logo: "https://images.pexels.com/photos/5325854/pexels-photo-5325854.jpeg" },
    { name: "Spotify", logo: "https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg" },
    { name: "Uber", logo: "https://images.pexels.com/photos/5325854/pexels-photo-5325854.jpeg" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Head of UX Design",
      company: "TechFlow Inc.",
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
      content: "TestMata transformed how we approach user testing. The insights we get are incredibly detailed and actionable. Our conversion rates improved by 35% after implementing their recommendations.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "InnovateLabs",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", 
      content: "The speed and quality of user feedback we get through TestMata is unmatched. We can now iterate on designs much faster and with confidence. It's become an essential part of our product development process.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Researcher",
      company: "Digital Solutions Co.",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
      content: "What I love most about TestMata is how it democratizes user research. Our entire team can now access user insights without needing specialized research skills. The AI-powered analysis is phenomenal.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Logos */}
        <div className="text-center mb-16">
          <p className="text-slate-600 mb-8 text-lg">
            Trusted by leading companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
              >
                <div className="w-24 h-8 bg-slate-400 rounded flex items-center justify-center text-xs font-semibold text-white">
                  {company.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-600">
              See how teams like yours are using TestMata to build better products
            </p>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-200">
              <Quote className="h-8 w-8 text-blue-600 mb-6" />
              
              <blockquote className="text-xl text-slate-700 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-slate-600 text-sm">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-slate-600">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-slate-600">Support Available</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-slate-600">Platform Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;