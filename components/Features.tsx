"use client";

import React from 'react';
import { 
  Users, 
  BarChart3, 
  Target, 
  Video, 
  Clock, 
  Shield,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Real User Testing",
      description: "Get feedback from actual users in your target demographic with our global panel of 100,000+ testers."
    },
    {
      icon: Video,
      title: "Screen Recording",
      description: "Watch detailed recordings of user sessions to understand exactly how users interact with your product."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive analytics and heatmaps to identify patterns and optimize user experience effectively."
    },
    {
      icon: Target,
      title: "Task-Based Testing",
      description: "Create specific tasks and scenarios to test particular user flows and measure completion rates."
    },
    {
      icon: Clock,
      title: "Quick Turnaround",
      description: "Get results in as little as 1 hour with our rapid testing options and automated analysis tools."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with GDPR compliance and SOC 2 certification for data protection."
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms automatically identify usability issues and provide actionable recommendations."
    },
    {
      icon: Globe,
      title: "Global Testing",
      description: "Test with users from 50+ countries and get insights into cultural and regional preferences."
    },
    {
      icon: Smartphone,
      title: "Mobile & Desktop",
      description: "Comprehensive testing across all devices and platforms to ensure consistent user experience."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need for 
            <span className="text-blue-600"> User Testing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive suite of tools to conduct, analyze, and act on user feedback. 
            From recruitment to reporting, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
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
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-full text-slate-700 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Join 10,000+ companies using TestMata for better user experiences
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;