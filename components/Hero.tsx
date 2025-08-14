"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  ArrowRight, 
  Users, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Sparkles,
  Globe,
  Shield,
  Zap,
  LucideIcon
} from 'lucide-react';

/**
 * Modern, elegant hero section with sophisticated design patterns
 */
const Hero: React.FC = () => {
  const features = [
    { icon: Shield, text: 'Enterprise Security', color: 'text-emerald-500' },
    { icon: Zap, text: 'Lightning Fast', color: 'text-amber-500' },
    { icon: Globe, text: 'Local Expertise', color: 'text-blue-500' }
  ];

  const stats = [
    { value: '500+', label: 'Ethiopian Testers', icon: Users },
    { value: '1,000+', label: 'Tests Completed', icon: Target },
    { value: '24hrs', label: 'Average Turnaround', icon: BarChart3 }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0">
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 border border-slate-300 rounded-full" />
          <div className="absolute top-40 right-20 w-80 h-80 border border-slate-300 rounded-full" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 border border-slate-300 rounded-full" />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute top-48 right-1/3 w-3 h-3 bg-indigo-400 rounded-full animate-ping delay-700" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping delay-1000" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-sky-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        {/* Premium Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-sm font-medium mb-8 shadow-lg shadow-blue-500/25">
          <Sparkles className="w-4 h-4 mr-2" />
          Trusted by Leading Ethiopian Tech Companies
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
          <span className="block">Test Your Apps with</span>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Real Ethiopian Users
          </span>
        </h1>

        {/* Sophisticated Subheading */}
        <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          Get actionable insights from Ethiopian users to improve your web applications and websites. 
          Understand local user behavior and build products that resonate with your target market.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm"
            >
              <feature.icon className={`w-4 h-4 mr-2 ${feature.color}`} />
              <span className="text-slate-700 text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link href="/auth/register">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group"
            >
              Start Testing Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
          <Link href="/product">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-10 py-4 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50/80 backdrop-blur-sm transition-all duration-300 group bg-white/80"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Tester CTA */}
        <div className="text-center mb-20">
          <p className="text-slate-600 mb-4 text-lg">Want to earn money as a tester?</p>
          <Link href="/tester/signup">
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 px-6 py-3 text-lg font-medium transition-all duration-300 group"
            >
              Become a Tester
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Statistics Section */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          className="w-full h-24 text-white" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="currentColor"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="currentColor"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default Hero;