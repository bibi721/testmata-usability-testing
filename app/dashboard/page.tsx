"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Play, 
  Users, 
  BarChart3, 
  Target, 
  Clock, 
  TrendingUp,
  FileText,
  Settings,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Tests",
      value: "47",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "blue"
    },
    {
      title: "Active Participants",
      value: "1,234",
      change: "+23%",
      trend: "up", 
      icon: Users,
      color: "green"
    },
    {
      title: "Avg. Success Rate",
      value: "87.3%",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "purple"
    },
    {
      title: "Tests This Month",
      value: "23",
      change: "8 remaining",
      trend: "neutral",
      icon: BarChart3,
      color: "orange"
    }
  ];

  const recentTests = [
    {
      id: 1,
      name: "E-commerce Checkout Flow",
      status: "completed",
      participants: 25,
      completion: 100,
      successRate: 92,
      date: "2 hours ago",
      insights: 8
    },
    {
      id: 2,
      name: "Mobile App Onboarding",
      status: "in-progress",
      participants: 15,
      completion: 67,
      successRate: 84,
      date: "5 hours ago",
      insights: 5
    },
    {
      id: 3,
      name: "Landing Page Optimization",
      status: "completed",
      participants: 30,
      completion: 100,
      successRate: 78,
      date: "1 day ago",
      insights: 12
    },
    {
      id: 4,
      name: "Dashboard Usability Study",
      status: "scheduled",
      participants: 0,
      completion: 0,
      successRate: 0,
      date: "Starts tomorrow",
      insights: 0
    }
  ];

  const quickActions = [
    {
      title: "Create New Test",
      description: "Start a new usability test",
      icon: Plus,
      action: "create",
      color: "blue"
    },
    {
      title: "View Analytics", 
      description: "Analyze test results",
      icon: BarChart3,
      action: "analytics",
      color: "green"
    },
    {
      title: "Manage Panel",
      description: "Configure test participants",
      icon: Users,
      action: "panel",
      color: "purple"
    },
    {
      title: "Generate Report",
      description: "Export test findings",
      icon: FileText,
      action: "report",
      color: "orange"
    }
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-600">
              Here's what's happening with your tests today.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Badge className="bg-blue-100 text-blue-700">
              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
            </Badge>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>

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
                    <p className={`text-sm mt-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tests and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Tests */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Recent Tests
                    </CardTitle>
                    <CardDescription>
                      Monitor your ongoing and completed tests
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          test.status === 'completed' ? 'bg-green-100' :
                          test.status === 'in-progress' ? 'bg-blue-100' :
                          'bg-slate-100'
                        }`}>
                          {test.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : test.status === 'in-progress' ? (
                            <Play className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Calendar className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{test.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {test.participants} participants
                            </span>
                            <span>{test.date}</span>
                            {test.insights > 0 && (
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {test.insights} insights
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {test.status === 'in-progress' && (
                          <div className="flex items-center space-x-2">
                            <Progress value={test.completion} className="w-16 h-2" />
                            <span className="text-sm text-slate-500">{test.completion}%</span>
                          </div>
                        )}
                        {test.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-700">
                            {test.successRate}% success
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    View All Tests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Overview */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Analytics Overview
                </CardTitle>
                <CardDescription>
                  Key metrics from your recent tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">2:34</div>
                    <div className="text-sm text-slate-600">Avg. Task Time</div>
                    <div className="text-xs text-green-600 mt-1">↓ 23% from last month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                    <div className="text-sm text-slate-600">Success Rate</div>
                    <div className="text-xs text-green-600 mt-1">↑ 5% from last month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">4.2</div>
                    <div className="text-sm text-slate-600">User Satisfaction</div>
                    <div className="text-xs text-green-600 mt-1">↑ 0.3 from last month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Account Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 hover:bg-slate-50"
                    >
                      <div className={`p-2 rounded-lg mr-3 ${
                        action.color === 'blue' ? 'bg-blue-100' :
                        action.color === 'green' ? 'bg-green-100' :
                        action.color === 'purple' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        <action.icon className={`h-4 w-4 ${
                          action.color === 'blue' ? 'text-blue-600' :
                          action.color === 'green' ? 'text-green-600' :
                          action.color === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900">{action.title}</div>
                        <div className="text-sm text-slate-500">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Overview */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Plan Usage</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tests this month</span>
                      <span className="text-slate-900">23 / 50</span>
                    </div>
                    <Progress value={46} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <Button variant="outline" className="w-full mb-3">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-green-100 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="text-slate-900">Test completed</div>
                      <div className="text-slate-500">E-commerce Checkout Flow - 2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="text-slate-900">New participants recruited</div>
                      <div className="text-slate-500">Mobile App Onboarding - 5 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-100 rounded-full">
                      <FileText className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="text-slate-900">Report generated</div>
                      <div className="text-slate-500">Landing Page Optimization - 1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;