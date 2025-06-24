"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  Target, 
  Video, 
  Clock, 
  MessageSquare,
  Globe,
  Smartphone,
  Shield
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Ethiopian User Panel",
      description: "Access to verified Ethiopian testers across different demographics and tech proficiency levels.",
      highlight: "500+ Active Testers"
    },
    {
      icon: Video,
      title: "Screen Recording & Analysis",
      description: "Watch detailed recordings of user sessions to understand exactly how users interact with your product.",
      highlight: "HD Quality Recording"
    },
    {
      icon: BarChart3,
      title: "Local Market Analytics",
      description: "Get insights tailored to Ethiopian market behavior, preferences, and cultural considerations.",
      highlight: "Cultural Context"
    },
    {
      icon: Target,
      title: "Task-Based Testing",
      description: "Create specific scenarios relevant to Ethiopian users and measure completion rates.",
      highlight: "Custom Scenarios"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Get feedback within 24 hours from our active Ethiopian user community.",
      highlight: "24-Hour Turnaround"
    },
    {
      icon: MessageSquare,
      title: "Bilingual Support",
      description: "Conduct tests in both Amharic and English to reach your entire target audience.",
      highlight: "Amharic & English"
    },
    {
      icon: Globe,
      title: "Local Context Understanding",
      description: "Understand how Ethiopian internet speeds, devices, and usage patterns affect your app.",
      highlight: "Real Conditions"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Testing",
      description: "Optimized for mobile testing, reflecting the mobile-first nature of Ethiopian internet usage.",
      highlight: "Mobile Optimized"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with data protection compliant with Ethiopian regulations.",
      highlight: "Enterprise Security"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need for 
            <span className="text-blue-600"> Ethiopian User Testing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive usability testing designed specifically for the Ethiopian market. 
            Get insights that matter for your local and regional success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-full text-slate-700 text-sm mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Helping Ethiopian startups and SMEs build better digital products
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Get Started
                </button>
              </Link>
              <Link href="/pricing">
                <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                  View Pricing
                </button>
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              ✓ No setup fees  •  ✓ Ethiopian user panel  •  ✓ Results in 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;