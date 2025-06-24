"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Ethiopian tech companies and testimonials
  const companies = [
    { name: "Ride", logo: "🚗", link: "#" },
    { name: "Deliver Addis", logo: "🛵", link: "#" },
    { name: "Gebeya", logo: "💼", link: "#" },
    { name: "iCog Labs", logo: "🤖", link: "#" },
    { name: "Kazana", logo: "💳", link: "#" },
    { name: "Sheba Platform", logo: "🏪", link: "#" }
  ];

  const testimonials = [
    {
      name: "Dawit Hailu",
      role: "Product Manager",
      company: "Ethiopian Fintech Startup",
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
      content: "Masada helped us understand how Ethiopian users interact with our mobile payment app. The insights were invaluable - we improved our user onboarding by 60% after implementing their recommendations.",
      rating: 5
    },
    {
      name: "Meron Teshome",
      role: "UX Designer",
      company: "Addis Tech Solutions",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg", 
      content: "Testing with real Ethiopian users through Masada revealed cultural preferences we never considered. Our e-commerce platform now has 40% better conversion rates thanks to their local insights.",
      rating: 5
    },
    {
      name: "Samuel Bekele",
      role: "Founder",
      company: "EdTech Ethiopia",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      content: "As a startup, we needed affordable user testing that understood our market. Masada provided exactly that - quick turnaround, relevant feedback, and pricing that worked for our budget.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleCompanyClick = (company: any) => {
    // In a real app, this would link to case studies or company pages
    alert(`Learn more about how ${company.name} uses Masada for Ethiopian user testing!`);
  };

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Logos */}
        <div className="text-center mb-16">
          <p className="text-slate-600 mb-8 text-lg">
            Trusted by Ethiopian tech companies
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {companies.map((company, index) => (
              <button
                key={company.name}
                onClick={() => handleCompanyClick(company)}
                className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{company.logo}</span>
                  <div className="text-sm font-semibold text-slate-600">{company.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What Ethiopian Companies Say
            </h2>
            <p className="text-xl text-slate-600">
              See how local tech companies are using Masada to build better products
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
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-slate-600">Client Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24hrs</div>
            <div className="text-slate-600">Average Response Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-slate-600">Ethiopian Testers</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Join These Success Stories?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Start testing with Ethiopian users today and see how local insights can transform your product.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={handleGetStarted}
            >
              Start Free Trial
            </Button>
            <Link href="/product">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-100 px-8 py-3">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;