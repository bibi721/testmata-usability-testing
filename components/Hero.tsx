"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Users, Target, BarChart3, CheckCircle } from 'lucide-react';
import { SectionContainer } from '@/components/ui/section-container';
import { StatCard } from '@/components/common/StatCard';

/**
 * Hero section component with call-to-action and key statistics
 */
const Hero: React.FC = () => {
  const valueProps = [
    { text: '500+ Ethiopian Testers' },
    { text: '24-hour Results' },
    { text: 'Affordable Pricing' }
  ];

  const stats = [
    { icon: Users, value: '500+', description: 'Ethiopian Testers' },
    { icon: Target, value: '1,000+', description: 'Tests Completed' },
    { icon: BarChart3, value: '24hrs', description: 'Average Turnaround' }
  ];

  return (
    <SectionContainer background="gradient" className="pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
      </div>

      <div className="relative py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
            Trusted by Ethiopian tech companies
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Test Your Apps with
            <span className="text-blue-600 block">Real Ethiopian Users</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get actionable insights from Ethiopian users to improve your web applications and websites. 
            Understand local user behavior and build products that resonate with your target market.
          </p>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
            {valueProps.map((prop, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-slate-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{prop.text}</span>
              </div>
            ))}
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

        {/* Statistics */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                title=""
                value={stat.value}
                description={stat.description}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default Hero;