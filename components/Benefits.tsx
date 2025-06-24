"use client";

import React from 'react';
import { CheckCircle, TrendingUp, Users, Clock, Shield, Lightbulb } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Improve Local Market Success",
      description: "Ethiopian companies using Masada see 40% better user engagement and 25% higher conversion rates by understanding local user behavior.",
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg",
      stats: [
        "40% improvement in user engagement",
        "25% higher conversion rates", 
        "60% faster product-market fit"
      ]
    },
    {
      icon: Users,
      title: "Understand Ethiopian Users",
      description: "Get deep insights into how Ethiopian users interact with technology, their preferences, pain points, and cultural considerations.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      stats: [
        "500+ verified Ethiopian testers",
        "Multiple regions represented",
        "Feedback in Amharic and English"
      ]
    },
    {
      icon: Clock,
      title: "Save Time & Resources",
      description: "Identify usability issues before launch and avoid costly redesigns. Perfect for Ethiopian startups and SMEs with limited budgets.",
      image: "https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg",
      stats: [
        "24-hour turnaround time",
        "50% reduction in development cycles",
        "Affordable pricing for local market"
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Ethiopian Companies Choose <span className="text-blue-600">Masada</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join growing Ethiopian tech companies who are building better products 
            with insights from real local users.
          </p>
        </div>

        <div className="space-y-20">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {benefit.title}
                  </h3>
                </div>

                <p className="text-lg text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>

                <div className="space-y-3">
                  {benefit.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{stat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group">
                    Learn more about this feature
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl transform rotate-3"></div>
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="relative rounded-2xl w-full h-64 sm:h-80 object-cover shadow-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-8 md:p-12">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Ready to Understand Your Ethiopian Users?
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join Ethiopian startups and SMEs who are building better products with Masada. 
              Start testing with real Ethiopian users today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Testing Now
              </button>
              <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;