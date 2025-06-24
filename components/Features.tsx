"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  Target, 
  Video, 
  Clock, 
  Shield,
  Globe,
  Smartphone,
  MessageSquare
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Ethiopian User Panel",
      description: "Access to verified Ethiopian testers across different demographics, education levels, and tech proficiency.",
      link: "/product#user-panel"
    },
    {
      icon: Video,
      title: "Screen Recording",
      description: "Watch detailed recordings of user sessions to understand exactly how Ethiopian users interact with your product.",
      link: "/product#screen-recording"
    },
    {
      icon: BarChart3,
      title: "Local Market Analytics",
      description: "Get insights tailored to Ethiopian market behavior, preferences, and cultural considerations.",
      link: "/product#analytics"
    },
    {
      icon: Target,
      title: "Task-Based Testing",
      description: "Create specific scenarios relevant to Ethiopian users and measure completion rates and satisfaction.",
      link: "/product#task-testing"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Get feedback within 24 hours from our active Ethiopian user community.",
      link: "/product#quick-results"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with data protection compliant with Ethiopian regulations.",
      link: "/product#security"
    },
    {
      icon: MessageSquare,
      title: "Amharic & English Support",
      description: "Conduct tests in both Amharic and English to reach your entire target audience.",
      link: "/product#language-support"
    },
    {
      icon: Globe,
      title: "Local Context",
      description: "Understand how Ethiopian internet speeds, devices, and usage patterns affect your app.",
      link: "/product#local-context"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Testing",
      description: "Optimized for mobile testing, reflecting the mobile-first nature of Ethiopian internet usage.",
      link: "/product#mobile-testing"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for 
            <span className="text-blue-600"> Ethiopian Tech Companies</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive usability testing designed specifically for the Ethiopian market. 
            Get insights that matter for your local and regional success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link key={feature.title} href={feature.link}>
              <div
                className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-full text-slate-700 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Helping Ethiopian startups and SMEs build better digital products
          </div>
          <div className="mt-6">
            <Link href="/auth/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors mr-4">
                Get Started
              </button>
            </Link>
            <Link href="/product">
              <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;