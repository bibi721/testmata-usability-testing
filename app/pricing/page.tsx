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
  Shield, 
  HeadphonesIcon,
  Crown,
  Building
} from 'lucide-react';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams and individual researchers",
      icon: Users,
      price: { monthly: 29, yearly: 24 },
      features: [
        "Up to 50 tests per month",
        "Basic screen recordings",
        "Standard analytics dashboard",
        "Email support",
        "3 team members",
        "Basic integrations",
        "PDF reports",
        "30-day data retention"
      ],
      limitations: [
        "No advanced heatmaps",
        "No custom branding",
        "Limited export options"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional", 
      description: "Ideal for growing teams and comprehensive testing",
      icon: Zap,
      price: { monthly: 89, yearly: 74 },
      features: [
        "Up to 200 tests per month",
        "HD screen recordings + audio",
        "Advanced heatmaps & click tracking",
        "AI-powered insights",
        "Priority support",
        "10 team members",
        "All integrations",
        "Custom reports & branding",
        "1-year data retention",
        "A/B testing capabilities",
        "Advanced filtering",
        "API access"
      ],
      limitations: [],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      icon: Building,
      price: { monthly: "Custom", yearly: "Custom" },
      features: [
        "Unlimited tests",
        "Advanced security & compliance",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited team members",
        "Custom integrations",
        "White-label solution",
        "Advanced user analytics",
        "Unlimited data retention",
        "SSO integration",
        "Advanced permissions",
        "Custom training",
        "SLA guarantee"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to all features of the Professional plan, including unlimited tests, advanced analytics, and priority support. No credit card required."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers can also pay by invoice."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees for any plan. You only pay the monthly or yearly subscription fee."
    },
    {
      question: "How does the user panel work?",
      answer: "Our global panel includes 100,000+ pre-screened users across 50+ countries. You can target specific demographics, and we'll recruit participants for your tests within hours."
    },
    {
      question: "Do you offer custom integrations?",
      answer: "Yes, Enterprise customers can request custom integrations. We have extensive API documentation and can work with your team to build custom solutions."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with TestMata, we'll refund your payment in full, no questions asked."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We're SOC 2 certified, GDPR compliant, and use enterprise-grade encryption. Your data is stored securely and never shared with third parties."
    }
  ];

  const addOns = [
    {
      name: "Additional Test Credits",
      description: "Extra tests beyond your plan limit",
      price: "$2 per test"
    },
    {
      name: "Advanced Analytics Package",
      description: "Custom dashboards and advanced reporting",
      price: "$50/month"
    },
    {
      name: "Priority Recruiting",
      description: "Faster participant recruitment (2-4 hours)",
      price: "$100/month"
    },
    {
      name: "Custom Integrations",
      description: "Build custom integrations with your tools",
      price: "Contact us"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Simple, Transparent <span className="text-blue-600">Pricing</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your team. Start with a free trial and scale as you grow.
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
                Save 17%
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

      {/* Feature Comparison */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Compare All <span className="text-blue-600">Features</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Detailed feature comparison to help you choose the right plan
            </p>
          </div>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-6 font-semibold text-slate-900">Features</th>
                      <th className="text-center p-6 font-semibold text-slate-900">Starter</th>
                      <th className="text-center p-6 font-semibold text-slate-900 bg-blue-50">
                        Professional
                        <Badge className="ml-2 bg-blue-600 text-white">Popular</Badge>
                      </th>
                      <th className="text-center p-6 font-semibold text-slate-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { feature: "Monthly Tests", starter: "50", professional: "200", enterprise: "Unlimited" },
                      { feature: "Team Members", starter: "3", professional: "10", enterprise: "Unlimited" },
                      { feature: "Screen Recording", starter: "✓", professional: "✓ + Audio", enterprise: "✓ + Audio" },
                      { feature: "Heatmaps", starter: "×", professional: "✓", enterprise: "✓" },
                      { feature: "AI Insights", starter: "×", professional: "✓", enterprise: "✓" },
                      { feature: "Custom Branding", starter: "×", professional: "✓", enterprise: "✓" },
                      { feature: "API Access", starter: "×", professional: "✓", enterprise: "✓" },
                      { feature: "SSO Integration", starter: "×", professional: "×", enterprise: "✓" },
                      { feature: "Support", starter: "Email", professional: "Priority", enterprise: "24/7 Phone" },
                      { feature: "Data Retention", starter: "30 days", professional: "1 year", enterprise: "Unlimited" }
                    ].map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-6 font-medium text-slate-900">{row.feature}</td>
                        <td className="p-6 text-center text-slate-700">{row.starter}</td>
                        <td className="p-6 text-center text-slate-700 bg-blue-50/50">{row.professional}</td>
                        <td className="p-6 text-center text-slate-700">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Extend Your <span className="text-blue-600">Capabilities</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Optional add-ons to customize your testing experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {addOns.map((addOn, index) => (
              <Card key={index} className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{addOn.name}</CardTitle>
                  <CardDescription className="text-slate-600">{addOn.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-4">{addOn.price}</div>
                  <Button variant="outline" className="w-full">
                    Add to Plan
                  </Button>
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
              Everything you need to know about TestMata pricing and features
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
              Start Testing Today
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of companies improving their user experience with TestMata. 
              No credit card required for your 14-day free trial.
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
              ✓ No setup fees  •  ✓ Cancel anytime  •  ✓ 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;