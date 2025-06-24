"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Users, Target, BarChart3, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by Ethiopian tech companies
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Test Your Apps with
              <span className="text-blue-600 block">
                Real Ethiopian Users
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get actionable insights from Ethiopian users to improve your web applications and websites. 
              Understand local user behavior and build products that resonate with your target market.
            </p>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-slate-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">500+ Ethiopian Testers</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-slate-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">24-hour Results</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-slate-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Affordable Pricing</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg group">
                  Start Testing Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/product">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-3 text-lg border-slate-300 hover:bg-slate-50 group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Secondary CTA for Testers */}
            <div className="text-center">
              <p className="text-slate-600 mb-4">Want to earn money as a tester?</p>
              <Link href="/tester/signup">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Become a Tester →
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats - Simplified */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-slate-600">Ethiopian Testers</div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-sky-100 rounded-lg mx-auto mb-4">
                  <Target className="h-6 w-6 text-sky-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">1,000+</div>
                <div className="text-slate-600">Tests Completed</div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">24hrs</div>
                <div className="text-slate-600">Average Turnaround</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;