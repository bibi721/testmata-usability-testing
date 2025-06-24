"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, DollarSign, Clock, Users, Star } from 'lucide-react';

const TesterSignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    age: '',
    education: '',
    occupation: '',
    experience: '',
    languages: [],
    devices: [],
    internetSpeed: '',
    availability: '',
    motivation: ''
  });
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn $10-25 per test",
      description: "Get paid for each completed usability test"
    },
    {
      icon: Clock,
      title: "Flexible schedule",
      description: "Test when it's convenient for you"
    },
    {
      icon: Users,
      title: "Help Ethiopian businesses",
      description: "Contribute to better digital products in Ethiopia"
    },
    {
      icon: Star,
      title: "Build your reputation",
      description: "Earn ratings and unlock higher-paying tests"
    }
  ];

  const requirements = [
    "Be 18 years or older",
    "Live in Ethiopia",
    "Have access to internet and devices",
    "Speak Amharic and/or English",
    "Complete a qualification test"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError('Please fill in all required fields');
      return;
    }

    // Simulate API call
    console.log('Tester signup data:', formData);
    // Redirect to qualification test or success page
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Masada</span>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Become a Masada Tester
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Earn money by testing Ethiopian apps and websites. Help improve digital products 
            while getting paid for your valuable feedback.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-slate-200 text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requirements Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Requirements
                </CardTitle>
                <CardDescription>
                  Make sure you meet these requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{requirement}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Complete application</li>
                    <li>2. Take qualification test</li>
                    <li>3. Get approved</li>
                    <li>4. Start earning!</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Tester Application
                    </CardTitle>
                    <CardDescription>
                      Step {currentStep} of 3 - Tell us about yourself
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-6">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="mt-1"
                            placeholder="+251..."
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Select onValueChange={(value) => handleInputChange('city', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
                              <SelectItem value="dire-dawa">Dire Dawa</SelectItem>
                              <SelectItem value="mekelle">Mekelle</SelectItem>
                              <SelectItem value="gondar">Gondar</SelectItem>
                              <SelectItem value="hawassa">Hawassa</SelectItem>
                              <SelectItem value="bahir-dar">Bahir Dar</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age">Age Range</Label>
                          <Select onValueChange={(value) => handleInputChange('age', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18-24">18-24</SelectItem>
                              <SelectItem value="25-34">25-34</SelectItem>
                              <SelectItem value="35-44">35-44</SelectItem>
                              <SelectItem value="45-54">45-54</SelectItem>
                              <SelectItem value="55+">55+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="education">Education Level</Label>
                          <Select onValueChange={(value) => handleInputChange('education', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high-school">High School</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                              <SelectItem value="master">Master's Degree</SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Technical Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900">Technical Information</h3>
                      
                      <div>
                        <Label>Languages (select all that apply)</Label>
                        <div className="mt-2 space-y-2">
                          {['Amharic', 'English', 'Oromo', 'Tigrinya', 'Somali'].map((language) => (
                            <div key={language} className="flex items-center space-x-2">
                              <Checkbox
                                id={language}
                                checked={formData.languages.includes(language)}
                                onCheckedChange={(checked) => 
                                  handleArrayChange('languages', language, checked)
                                }
                              />
                              <Label htmlFor={language}>{language}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Available Devices (select all that apply)</Label>
                        <div className="mt-2 space-y-2">
                          {[
                            'Smartphone (Android)',
                            'Smartphone (iPhone)',
                            'Tablet (Android)',
                            'Tablet (iPad)',
                            'Desktop Computer',
                            'Laptop'
                          ].map((device) => (
                            <div key={device} className="flex items-center space-x-2">
                              <Checkbox
                                id={device}
                                checked={formData.devices.includes(device)}
                                onCheckedChange={(checked) => 
                                  handleArrayChange('devices', device, checked)
                                }
                              />
                              <Label htmlFor={device}>{device}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="internetSpeed">Internet Connection</Label>
                        <Select onValueChange={(value) => handleInputChange('internetSpeed', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select your internet speed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Slow (under 5 Mbps)</SelectItem>
                            <SelectItem value="medium">Medium (5-25 Mbps)</SelectItem>
                            <SelectItem value="fast">Fast (25+ Mbps)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="experience">Tech Experience Level</Label>
                        <Select onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select your tech experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Availability and Motivation */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900">Availability & Motivation</h3>
                      
                      <div>
                        <Label htmlFor="availability">How many hours per week can you dedicate to testing?</Label>
                        <Select onValueChange={(value) => handleInputChange('availability', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select your availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1-5 hours</SelectItem>
                            <SelectItem value="6-10">6-10 hours</SelectItem>
                            <SelectItem value="11-20">11-20 hours</SelectItem>
                            <SelectItem value="20+">20+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="motivation">Why do you want to become a tester? (Optional)</Label>
                        <Textarea
                          id="motivation"
                          value={formData.motivation}
                          onChange={(e) => handleInputChange('motivation', e.target.value)}
                          className="mt-1"
                          rows={4}
                          placeholder="Tell us what motivates you to help improve Ethiopian digital products..."
                        />
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                        <p className="text-sm text-blue-800">
                          After submitting your application, you'll receive an email with a qualification test. 
                          This test helps us understand your testing skills and ensures you're ready to provide 
                          valuable feedback to our clients.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" required />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep}>
                        Next Step
                      </Button>
                    ) : (
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Submit Application
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-slate-500">
          <p>
            Already a tester?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TesterSignupPage;