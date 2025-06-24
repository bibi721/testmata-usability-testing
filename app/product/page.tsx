"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Users, 
  BarChart3, 
  Target, 
  Video, 
  Clock, 
  Shield,
  Zap,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Monitor,
  MousePointer,
  Eye,
  MessageSquare,
  FileText,
  TrendingUp
} from 'lucide-react';

const ProductPage = () => {
  const [activeDemo, setActiveDemo] = useState('recording');

  const features = [
    {
      icon: Video,
      title: "Screen Recording & Replay",
      description: "Watch every click, scroll, and interaction in high-definition recordings",
      highlight: "HD Quality Recording",
      demo: "recording"
    },
    {
      icon: Eye,
      title: "Eye Tracking & Heatmaps",
      description: "See exactly where users look and what captures their attention",
      highlight: "AI-Powered Analysis",
      demo: "heatmap"
    },
    {
      icon: MessageSquare,
      title: "Think-Aloud Protocol",
      description: "Capture user thoughts and feedback in real-time during testing",
      highlight: "Voice & Video Feedback",
      demo: "feedback"
    },
    {
      icon: Target,
      title: "Task-Based Testing",
      description: "Create specific scenarios to test user flows and measure success rates",
      highlight: "Custom Scenarios",
      demo: "tasks"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights with conversion funnels and user behavior patterns",
      highlight: "Real-time Dashboard",
      demo: "analytics"
    },
    {
      icon: Users,
      title: "Global Test Panel",
      description: "Access to 100,000+ diverse users across 50+ countries",
      highlight: "Demographic Targeting",
      demo: "panel"
    }
  ];

  const useCases = [
    {
      title: "E-commerce Optimization",
      description: "Improve checkout flows and product discovery",
      image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg",
      metrics: ["34% increase in conversions", "67% reduction in cart abandonment", "2.3x faster checkout completion"],
      steps: [
        "Record user shopping sessions",
        "Analyze drop-off points in checkout",
        "Test alternative designs",
        "Implement data-driven improvements"
      ]
    },
    {
      title: "SaaS Onboarding",
      description: "Streamline user activation and feature adoption",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      metrics: ["89% improvement in feature adoption", "45% faster time-to-value", "78% reduction in support tickets"],
      steps: [
        "Test onboarding flow completion",
        "Identify confusion points",
        "Optimize tutorial sequences",
        "Measure activation improvements"
      ]
    },
    {
      title: "Marketing Campaigns",
      description: "Validate landing pages and ad effectiveness",
      image: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg",
      metrics: ["156% boost in landing page conversions", "43% increase in ad click-through", "92% improvement in message clarity"],
      steps: [
        "A/B test campaign variations",
        "Analyze user engagement patterns",
        "Test call-to-action effectiveness",
        "Optimize conversion elements"
      ]
    }
  ];

  const integrations = [
    { name: "Figma", logo: "🎨", description: "Test prototypes directly" },
    { name: "Slack", logo: "💬", description: "Get results in your workspace" },
    { name: "Jira", logo: "📋", description: "Create tickets from findings" },
    { name: "Google Analytics", logo: "📊", description: "Correlate with your data" },
    { name: "Hotjar", logo: "🔥", description: "Complement heatmap insights" },
    { name: "Zapier", logo: "⚡", description: "Automate your workflows" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              🚀 Enterprise-Grade Testing Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              The Complete
              <span className="text-blue-600 block">Usability Testing Solution</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              From concept to launch, TestMata provides everything you need to understand your users, 
              validate designs, and build products that people love to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Product Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for <span className="text-blue-600">Every Testing Need</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive suite of tools designed for UX researchers, product managers, and designers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card 
                  key={feature.demo}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeDemo === feature.demo 
                      ? 'border-blue-500 shadow-lg bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setActiveDemo(feature.demo)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        activeDemo === feature.demo ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <feature.icon className={`h-6 w-6 ${
                          activeDemo === feature.demo ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 mb-3">
                          {feature.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {feature.highlight}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Demo Area */}
            <div className="sticky top-24">
              <Card className="border-slate-200 shadow-xl">
                <CardContent className="p-0">
                  <div className="bg-slate-900 rounded-t-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="ml-4 text-slate-400 text-sm">TestMata Dashboard</div>
                    </div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[400px] flex items-center justify-center">
                    {activeDemo === 'recording' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <Video className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Screen Recording Active</h3>
                        <p className="text-slate-600">High-definition user session recording in progress</p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                          <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> 03:24</span>
                          <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> 1080p</span>
                          <span className="flex items-center"><MousePointer className="h-4 w-4 mr-1" /> Tracked</span>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'heatmap' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          <Target className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Heatmap Analysis</h3>
                        <p className="text-slate-600">AI-powered attention mapping and click tracking</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-red-100 p-3 rounded-lg">
                            <div className="text-red-600 font-semibold">Hot Zones</div>
                            <div className="text-slate-600">89% attention</div>
                          </div>
                          <div className="bg-yellow-100 p-3 rounded-lg">
                            <div className="text-yellow-600 font-semibold">Medium</div>
                            <div className="text-slate-600">45% attention</div>
                          </div>
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <div className="text-blue-600 font-semibold">Cold Zones</div>
                            <div className="text-slate-600">12% attention</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'feedback' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Live User Feedback</h3>
                        <p className="text-slate-600">Real-time think-aloud protocol capture</p>
                        <div className="bg-slate-100 p-4 rounded-lg text-left max-w-sm mx-auto">
                          <div className="text-sm text-slate-600 mb-2">User says:</div>
                          <div className="text-slate-900">"I'm not sure where to click next. The button isn't very obvious to me..."</div>
                          <div className="text-xs text-slate-500 mt-2">03:45 - Task: Find checkout button</div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'tasks' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Task Management</h3>
                        <p className="text-slate-600">Custom scenarios and success measurement</p>
                        <div className="space-y-3 text-left max-w-sm mx-auto">
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <span className="text-sm">Find product page</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <span className="text-sm">Add to cart</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                            <span className="text-sm">Complete checkout</span>
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'analytics' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Advanced Analytics</h3>
                        <p className="text-slate-600">Comprehensive insights and reporting</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-blue-600 font-semibold">Success Rate</div>
                            <div className="text-2xl font-bold text-slate-900">87%</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-green-600 font-semibold">Avg. Time</div>
                            <div className="text-2xl font-bold text-slate-900">2:34</div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-orange-600 font-semibold">Drop-off</div>
                            <div className="text-2xl font-bold text-slate-900">13%</div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-purple-600 font-semibold">NPS Score</div>
                            <div className="text-2xl font-bold text-slate-900">8.3</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'panel' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                          <Users className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Global Test Panel</h3>
                        <p className="text-slate-600">100,000+ users across 50+ countries</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-left">
                            <div className="text-slate-600 mb-2">Demographics</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Age 18-65</span>
                                <span className="text-slate-500">✓</span>
                              </div>
                              <div className="flex justify-between">
                                <span>All income levels</span>
                                <span className="text-slate-500">✓</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tech proficiency</span>
                                <span className="text-slate-500">✓</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-slate-600 mb-2">Coverage</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>50+ countries</span>
                                <span className="text-green-600">🌍</span>
                              </div>
                              <div className="flex justify-between">
                                <span>25+ languages</span>
                                <span className="text-green-600">🗣️</span>
                              </div>
                              <div className="flex justify-between">
                                <span>24/7 availability</span>
                                <span className="text-green-600">⏰</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Real Results for <span className="text-blue-600">Real Businesses</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how leading companies use TestMata to solve their biggest UX challenges
            </p>
          </div>

          <div className="space-y-20">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      <img
                        src={useCase.image}
                        alt={useCase.title}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />
                      <div className="p-6">
                        <Badge className="mb-3 bg-blue-100 text-blue-700">
                          Case Study
                        </Badge>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                          {useCase.title}
                        </h3>
                        <p className="text-slate-600 mb-6">
                          {useCase.description}
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Results:</h4>
                            <div className="space-y-2">
                              {useCase.metrics.map((metric, metricIndex) => (
                                <div key={metricIndex} className="flex items-center space-x-2">
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-slate-700">{metric}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-1 space-y-6">
                  <h4 className="text-xl font-semibold text-slate-900">Testing Process:</h4>
                  <div className="space-y-4">
                    {useCase.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-semibold text-sm rounded-full flex-shrink-0">
                          {stepIndex + 1}
                        </div>
                        <div className="pt-1">
                          <p className="text-slate-900 font-medium">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                    View Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Seamless <span className="text-blue-600">Integrations</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect TestMata with your existing workflow and favorite tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <Card 
                key={integration.name}
                className="text-center p-6 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{integration.logo}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-slate-600">{integration.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-sky-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your User Experience?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of companies who trust TestMata to deliver exceptional user experiences. 
              Start your free trial today and see the difference user testing can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-6">
              ✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Full access to all features
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;