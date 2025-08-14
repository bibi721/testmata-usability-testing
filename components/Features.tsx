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
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Modern, elegant features section with sophisticated design patterns
 */
const Features: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: "Ethiopian User Panel",
      description: "Access to verified Ethiopian testers across different demographics and tech proficiency levels.",
      highlight: "500+ Active Testers",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Video,
      title: "Screen Recording & Analysis",
      description: "Watch detailed recordings of user sessions to understand exactly how users interact with your product.",
      highlight: "HD Quality Recording",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Local Market Analytics",
      description: "Get insights tailored to Ethiopian market behavior, preferences, and cultural considerations.",
      highlight: "Cultural Context",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Target,
      title: "Task-Based Testing",
      description: "Create specific scenarios relevant to Ethiopian users and measure completion rates.",
      highlight: "Custom Scenarios",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Get feedback within 24 hours from our active Ethiopian user community.",
      highlight: "24-Hour Turnaround",
      color: "from-rose-500 to-rose-600"
    },
    {
      icon: MessageSquare,
      title: "Bilingual Support",
      description: "Conduct tests in both Amharic and English to reach your entire target audience.",
      highlight: "Amharic & English",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Globe,
      title: "Local Context Understanding",
      description: "Understand how Ethiopian internet speeds, devices, and usage patterns affect your app.",
      highlight: "Real Conditions",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Testing",
      description: "Optimized for mobile testing, reflecting the mobile-first nature of Ethiopian internet usage.",
      highlight: "Mobile Optimized",
      color: "from-violet-500 to-violet-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with data protection compliant with Ethiopian regulations.",
      highlight: "Enterprise Security",
      color: "from-slate-500 to-slate-600"
    }
  ];

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-sky-100/30 to-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-blue-700 text-sm font-medium mb-6 border border-blue-200/50">
            <Sparkles className="w-4 h-4 mr-2" />
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Everything You Need for
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Ethiopian User Testing
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            Comprehensive usability testing designed specifically for the Ethiopian market. 
            Get insights that matter for your local and regional success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group relative p-8 bg-white rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon Container */}
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                  {feature.highlight}
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-full text-slate-700 text-sm mb-8 border border-emerald-200/50">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse" />
            Helping Ethiopian startups and SMEs build better digital products
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  size="lg"
                  variant="outline" 
                  className="px-8 py-3 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                No setup fees
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                Ethiopian user panel
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                Results in 24 hours
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;