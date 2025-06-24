"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionContainer } from '@/components/ui/section-container';
import { TestimonialCard } from '@/components/common/TestimonialCard';

/**
 * Social proof section with testimonials and company logos
 */
const SocialProof: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const companies = [
    { name: "Ride", logo: "🚗" },
    { name: "Deliver Addis", logo: "🛵" },
    { name: "Gebeya", logo: "💼" },
    { name: "iCog Labs", logo: "🤖" },
    { name: "Kazana", logo: "💳" },
    { name: "Sheba Platform", logo: "🏪" }
  ];

  const testimonials = [
    {
      name: "Dawit Hailu",
      role: "Product Manager",
      company: "Ethiopian Fintech Startup",
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
      content: "Masada helped us understand how Ethiopian users interact with our mobile payment app. The insights were invaluable - we improved our user onboarding by 60% after implementing their recommendations.",
      rating: 5,
      metric: "60% improvement in onboarding"
    },
    {
      name: "Meron Teshome",
      role: "UX Designer",
      company: "Addis Tech Solutions",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg", 
      content: "Testing with real Ethiopian users through Masada revealed cultural preferences we never considered. Our e-commerce platform now has 40% better conversion rates thanks to their local insights.",
      rating: 5,
      metric: "40% better conversion rates"
    },
    {
      name: "Samuel Bekele",
      role: "Founder",
      company: "EdTech Ethiopia",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      content: "As a startup, we needed affordable user testing that understood our market. Masada provided exactly that - quick turnaround, relevant feedback, and pricing that worked for our budget.",
      rating: 5,
      metric: "24-hour turnaround"
    }
  ];

  const stats = [
    { value: "95%", label: "Client Satisfaction" },
    { value: "24hrs", label: "Average Response Time" },
    { value: "500+", label: "Ethiopian Testers" }
  ];

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const handleGetStarted = useCallback(() => {
    window.location.href = '/auth/register';
  }, []);

  return (
    <SectionContainer background="slate">
      {/* Company Logos */}
      <div className="text-center mb-16">
        <p className="text-slate-600 mb-8 text-lg">
          Trusted by Ethiopian tech companies
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{company.logo}</span>
                <div className="text-sm font-semibold text-slate-600">{company.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Real Results from Ethiopian Companies
          </h2>
          <p className="text-xl text-slate-600">
            See how local tech companies are using Masada to build better products
          </p>
        </div>

        <div className="relative">
          <TestimonialCard {...testimonials[currentTestimonial]} />

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
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
            <div className="text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl p-8 md:p-12 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Join These Success Stories?
          </h3>
          <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
            Start testing with Ethiopian users today and see how local insights can transform your product.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg"
              onClick={handleGetStarted}
            >
              Start Testing Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/product">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default SocialProof;