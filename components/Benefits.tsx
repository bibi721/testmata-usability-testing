"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, TrendingUp, Users, Clock, Shield, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      ],
      learnMoreLink: "/product#market-success",
      color: "from-emerald-500 to-emerald-600"
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
      ],
      learnMoreLink: "/product#user-insights",
      color: "from-blue-500 to-blue-600"
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
      ],
      learnMoreLink: "/pricing",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-100/20 to-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-full text-emerald-700 text-sm font-medium mb-6 border border-emerald-200/50">
            <Sparkles className="w-4 h-4 mr-2" />
            Success Stories
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Why Ethiopian Companies Choose 
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Masada
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            Join growing Ethiopian tech companies who are building better products 
            with insights from real local users.
          </p>
        </div>

        <div className="space-y-24">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex flex-col lg:flex-row items-center gap-16 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className="flex-1 space-y-8">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl shadow-lg`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                    {benefit.title}
                  </h3>
                </div>

                <p className="text-xl text-slate-600 leading-relaxed font-light">
                  {benefit.description}
                </p>

                <div className="space-y-4">
                  {benefit.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-center space-x-4 group">
                      <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-lg text-slate-700 font-medium">{stat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link href={benefit.learnMoreLink}>
                    <Button 
                      variant="ghost" 
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group transition-all duration-300 hover:bg-blue-50 px-6 py-3"
                    >
                      Learn more about this feature
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1">
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500`}></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <Image
                      src={benefit.image}
                      alt={benefit.title}
                      width={400}
                      height={384}
                      className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-24 text-center">
          <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12 md:p-16 border border-blue-200/50 shadow-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 border border-blue-300 rounded-full" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border border-indigo-300 rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mx-auto mb-8 shadow-lg">
                <Lightbulb className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Ready to Understand Your Ethiopian Users?
              </h3>
              <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                Join Ethiopian startups and SMEs who are building better products with Masada. 
                Start testing with real Ethiopian users today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/register">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group"
                  >
                    Start Testing Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/product">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="px-10 py-4 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                  >
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;