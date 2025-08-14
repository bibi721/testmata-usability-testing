"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Users, 
  BarChart3, 
  Target, 
  Clock, 
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  Headphones,
  Video,
  Smartphone,
  Monitor,
  Globe,
  Award,
  TrendingUp,
  MessageSquare,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';

const TesterDashboardComponent = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'available');

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['available', 'history', 'earnings', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Mock tester profile data
  const testerProfile = {
    name: user?.name || "New Tester",
    email: user?.email || "",
    location: "Addis Ababa, Ethiopia",
    joinDate: "January 2025",
    rating: user?.rating || 0,
    completedTests: user?.completedTests || 0,
    earnings: user?.earnings || 0,
    level: user?.level || "New Tester",
    languages: ["Amharic", "English"],
    devices: ["iPhone 13", "Samsung Galaxy A54", "MacBook Pro"],
    demographics: {
      age: "25-34",
      education: "University Graduate",
      occupation: "Software Developer",
      income: "Middle Income"
    }
  };

  // Mock available tests
  const availableTests = [
    {
      id: 1,
      title: "E-commerce Mobile App Checkout Flow",
      company: "Ethiopian Online Store",
      duration: "15-20 minutes",
      payment: "$12",
      difficulty: "Easy",
      requirements: ["Mobile device", "English fluency"],
      description: "Test the checkout process of a new e-commerce app targeting Ethiopian consumers.",
      deadline: "2 days",
      tasks: 5,
      type: "Mobile App"
    },
    {
      id: 2,
      title: "Banking Website Navigation Test",
      company: "Local Bank",
      duration: "25-30 minutes", 
      payment: "$18",
      difficulty: "Medium",
      requirements: ["Desktop/Laptop", "Banking experience"],
      description: "Evaluate the usability of online banking features and navigation.",
      deadline: "1 day",
      tasks: 7,
      type: "Website"
    },
    {
      id: 3,
      title: "Food Delivery App User Experience",
      company: "Delivery Startup",
      duration: "20-25 minutes",
      payment: "$15",
      difficulty: "Easy",
      requirements: ["Mobile device", "Food delivery app experience"],
      description: "Test ordering food through a new delivery application.",
      deadline: "3 days",
      tasks: 6,
      type: "Mobile App"
    }
  ];

  // Mock test history
  const testHistory = [
    {
      id: 1,
      title: "Educational Platform Usability",
      company: "EdTech Ethiopia",
      completedDate: "2025-01-15",
      duration: "22 minutes",
      payment: "$16",
      rating: 5,
      status: "completed",
      feedback: "Excellent feedback provided. Very detailed observations."
    },
    {
      id: 2,
      title: "Mobile Banking Security Test",
      company: "Ethiopian Bank",
      completedDate: "2025-01-12",
      duration: "28 minutes",
      payment: "$20",
      rating: 4,
      status: "completed",
      feedback: "Good insights on security concerns."
    }
  ];

  // Mock earnings data
  const earningsData = {
    thisMonth: user?.earnings || 0,
    lastMonth: Math.max(0, (user?.earnings || 0) - 50),
    thisWeek: Math.floor((user?.earnings || 0) / 4),
    pending: 25,
    totalEarnings: user?.earnings || 0
  };

  const stats = [
    {
      title: "Tests Completed",
      value: testerProfile.completedTests.toString(),
      change: testerProfile.completedTests > 0 ? "+2 this week" : "Get started!",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Average Rating",
      value: testerProfile.rating > 0 ? testerProfile.rating.toString() : "N/A",
      change: testerProfile.rating > 0 ? "Excellent" : "Complete tests to get rated",
      icon: Star,
      color: "yellow"
    },
    {
      title: "Total Earnings",
      value: `$${earningsData.totalEarnings}`,
      change: earningsData.totalEarnings > 0 ? `+$${earningsData.thisMonth - earningsData.lastMonth} this month` : "Start earning!",
      icon: DollarSign,
      color: "blue"
    },
    {
      title: "Available Tests",
      value: availableTests.length.toString(),
      change: "Ready to start",
      icon: Target,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/api/placeholder/64/64" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {testerProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {testerProfile.name.split(' ')[0]}!
              </h1>
              <p className="text-slate-600">
                {testerProfile.level} • {testerProfile.location}
              </p>
              {testerProfile.rating > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(testerProfile.rating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    ))}
                    <span className="ml-1 text-sm text-slate-600">{testerProfile.rating}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Active Tester
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-slate-300">
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </Button>
            <Button variant="outline" className="border-slate-300">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>
          </div>
        </div>

        {/* Welcome Message for New Users */}
        {testerProfile.completedTests === 0 && (
          <Card className="border-blue-200 bg-blue-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Welcome to Masada Tester Community! 🎉
                  </h3>
                  <p className="text-blue-800 mb-4">
                    You&apos;re now part of Ethiopia&apos;s premier user testing community. Start earning by testing apps and websites from Ethiopian companies.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Take Your First Test
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-700">
                      Complete Your Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-sm mt-1 text-slate-500">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Available Tests Tab */}
          <TabsContent value="available" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Available Tests
                </CardTitle>
                <CardDescription>
                  Choose from available usability tests that match your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availableTests.map((test) => (
                    <Card key={test.id} className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <Badge className="bg-blue-100 text-blue-700">
                                {test.type}
                              </Badge>
                              <Badge variant="outline" className={
                                test.difficulty === 'Easy' ? 'border-green-300 text-green-700' :
                                test.difficulty === 'Medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-red-300 text-red-700'
                              }>
                                {test.difficulty}
                              </Badge>
                              <span className="text-2xl font-bold text-green-600">{test.payment}</span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {test.title}
                            </h3>
                            <p className="text-slate-600 mb-3">
                              {test.description}
                            </p>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {test.duration}
                              </div>
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {test.tasks} tasks
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {test.deadline} left
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {test.company}
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm text-slate-600 mb-2">Requirements:</p>
                              <div className="flex flex-wrap gap-2">
                                {test.requirements.map((req, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 lg:ml-6">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Play className="h-4 w-4 mr-2" />
                              Start Test
                            </Button>
                            <Button variant="outline" className="border-slate-300">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {availableTests.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No tests available</h3>
                    <p className="text-slate-600">Check back later for new testing opportunities.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Test History
                </CardTitle>
                <CardDescription>
                  Your completed usability tests and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testHistory.length > 0 ? (
                  <div className="space-y-4">
                    {testHistory.map((test) => (
                      <Card key={test.id} className="border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge className="bg-green-100 text-green-700">
                                  Completed
                                </Badge>
                                <span className="text-lg font-bold text-green-600">{test.payment}</span>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < test.rating 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-slate-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {test.title}
                              </h3>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600 mb-3">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(test.completedDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {test.duration}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {test.company}
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-sm text-slate-600 mb-1">Client Feedback:</p>
                                <p className="text-sm text-slate-900">{test.feedback}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 lg:ml-6">
                              <Button variant="outline" className="border-slate-300">
                                View Report
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No completed tests yet</h3>
                    <p className="text-slate-600 mb-4">Start testing to build your history and earn money!</p>
                    <Button onClick={() => setActiveTab('available')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Find Available Tests
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">${earningsData.thisMonth}</p>
                      <p className="text-sm text-green-600">+${earningsData.thisMonth - earningsData.lastMonth} from last month</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">This Week</p>
                      <p className="text-2xl font-bold text-slate-900">${earningsData.thisWeek}</p>
                      <p className="text-sm text-slate-500">2 tests completed</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-slate-900">${earningsData.pending}</p>
                      <p className="text-sm text-slate-500">Processing payment</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-slate-900">${earningsData.totalEarnings}</p>
                      <p className="text-sm text-slate-500">All time</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Payment History
                </CardTitle>
                <CardDescription>
                  Your payment transactions and earnings breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testHistory.length > 0 ? (
                  <div className="space-y-4">
                    {testHistory.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-900">{test.title}</h4>
                          <p className="text-sm text-slate-600">{new Date(test.completedDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{test.payment}</p>
                          <Badge className="bg-green-100 text-green-700">Paid</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No earnings yet</h3>
                    <p className="text-slate-600">Complete your first test to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Tester Profile
                  </CardTitle>
                  <CardDescription>
                    Your testing profile and qualifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/api/placeholder/80/80" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                        {testerProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{testerProfile.name}</h3>
                      <p className="text-slate-600">{testerProfile.email}</p>
                      <p className="text-slate-600">{testerProfile.location}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-700">{testerProfile.level}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Languages</h4>
                      <div className="flex space-x-2">
                        {testerProfile.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Available Devices</h4>
                      <div className="space-y-2">
                        {testerProfile.devices.map((device, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {device.includes('iPhone') || device.includes('Samsung') ? (
                              <Smartphone className="h-4 w-4 text-slate-600" />
                            ) : (
                              <Monitor className="h-4 w-4 text-slate-600" />
                            )}
                            <span className="text-sm text-slate-700">{device}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Demographics
                  </CardTitle>
                  <CardDescription>
                    Your demographic information for test matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Age Range</p>
                      <p className="text-slate-900">{testerProfile.demographics.age}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Education</p>
                      <p className="text-slate-900">{testerProfile.demographics.education}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Occupation</p>
                      <p className="text-slate-900">{testerProfile.demographics.occupation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Income Level</p>
                      <p className="text-slate-900">{testerProfile.demographics.income}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Profile Completion</span>
                      <span className="text-sm text-slate-900">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">Complete your profile to get more test opportunities</p>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TesterDashboardComponent;