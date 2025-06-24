"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Check, 
  X, 
  Star, 
  ArrowRight, 
  Users, 
  Zap, 
  Building,
  HeadphonesIcon
} from 'lucide-react';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for Ethiopian startups and small businesses",
      icon: Users,
      price: { monthly: 15, yearly: 12 },
      features: [
        "Up to 10 tests per month",
        "Ethiopian user panel access",
        "Basic screen recordings",
        "Email support",
        "2 team members",
        "Mobile & desktop testing",
        "Basic analytics",
        "Amharic & English support"
      ],
      limitations: [
        "No advanced analytics",
        "Limited export options"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional", 
      description: "Ideal for growing Ethiopian tech companies",
      icon: Zap,
      price: { monthly: 45, yearly: 38 },
      features: [
        "Up to 50 tests per month",
        "Priority Ethiopian tester access",
        "HD recordings + audio feedback",
        "Advanced analytics dashboard",
        "Priority support",
        "5 team members",
        "Custom task scenarios",
        "Detailed reports & insights",
        "Cultural context analysis",
        "API access",
        "Advanced filtering"
      ],
      limitations: [],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large Ethiopian organizations",
      icon: Building,
      price: { monthly: "Custom", yearly: "Custom" },
      features: [
        "Unlimited tests",
        "Dedicated Ethiopian tester pool",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 support",
        "Unlimited team members",
        "White-label solution",
        "Advanced security",
        "Custom reporting",
        "On-site training",
        "SLA guarantee",
        "Regional tester distribution"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the Ethiopian user panel work?",
      answer: "Our panel includes 500+ verified Ethiopian users from different regions, age groups, and backgrounds. We recruit participants based on your target demographics and provide feedback in both Amharic and English."
    },
    {
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to the Professional plan features, including 5 tests with Ethiopian users, advanced analytics, and priority support."
    },
    {
      question: "Do you support testing in Amharic?",
      answer: "Yes! Our Ethiopian testers can provide feedback in both Amharic and English. We also support testing interfaces in Amharic to ensure cultural relevance."
    },
    {
      question: "How quickly do I get results?",
      answer: "Most tests are completed within 24 hours. Our Ethiopian user panel is active throughout the day, ensuring quick turnaround times for your testing needs."
    },
    {
      question: "What types of businesses use Masada?",
      answer: "Ethiopian startups, SMEs, e-commerce sites, fintech companies, educational platforms, and any business wanting to understand Ethiopian user behavior and preferences."
    },
    {
      question: "Can I test mobile apps?",
      answer: "Absolutely! We support testing of mobile apps, websites, and web applications across different devices commonly used in Ethiopia, with focus on mobile-first experiences."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayPal, and are working on integrating Ethiopian mobile payment solutions like M-Birr and HelloCash for local convenience."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security and comply with international data protection standards. All user data is encrypted and stored securely."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Affordable Testing for <span className="text-blue-600">Ethiopian Businesses</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Pricing designed for the Ethiopian market. Start with a free trial and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly
              </span>
              <Badge className="bg-green-100 text-green-700 ml-2">
                Save 20%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative ${
                  plan.popular 
                    ? 'border-blue-500 shadow-xl scale-105 ring-2 ring-blue-500 ring-opacity-20' 
                    : 'border-slate-200 shadow-lg hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 text-sm font-medium">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    plan.popular ? 'bg-blue-100' : 'bg-slate-100'
                  } mx-auto`}>
                    <plan.icon className={`h-6 w-6 ${
                      plan.popular ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 mb-6">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-slate-900">
                      {typeof plan.price.monthly === 'number' ? (
                        <>
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                          <span className="text-lg font-normal text-slate-500">/month</span>
                        </>
                      ) : (
                        <span className="text-3xl">{plan.price.monthly}</span>
                      )}
                    </div>
                    {typeof plan.price.monthly === 'number' && isYearly && (
                      <p className="text-sm text-slate-500">
                        Billed annually (${plan.price.yearly * 12}/year)
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button 
                    className={`w-full py-3 text-lg ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.cta}
                    {plan.cta !== "Contact Sales" && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Everything included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Not included:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start space-x-3">
                              <X className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to know about Masada pricing and Ethiopian user testing
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <Card className="border-slate-200">
                    <AccordionTrigger className="px-6 py-4 text-left font-semibold text-slate-900 hover:no-underline hover:bg-slate-50">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">Still have questions?</p>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-100">
              <HeadphonesIcon className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-sky-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Start Testing with Ethiopian Users Today
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join Ethiopian companies improving their products with real user insights. 
              No setup fees, no long-term commitments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                Schedule Demo Call
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-6">
              ✓ No setup fees  •  ✓ Ethiopian user panel  •  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;