"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Filter,
  Search,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Tests",
      value: "12",
      change: "+3 this month",
      trend: "up",
      icon: Target,
      color: "blue"
    },
    {
      title: "Ethiopian Testers",
      value: "45",
      change: "Active this week",
      trend: "up", 
      icon: Users,
      color: "green"
    },
    {
      title: "Avg. Success Rate",
      value: "78%",
      change: "+12% improvement",
      trend: "up",
      icon: TrendingUp,
      color: "purple"
    },
    {
      title: "Response Time",
      value: "18hrs",
      change: "Average turnaround",
      trend: "neutral",
      icon: Clock,
      color: "orange"
    }
  ];

  const recentTests = [
    {
      id: 1,
      name: "E-commerce Mobile App",
      status: "completed",
      participants: 8,
      completion: 100,
      successRate: 75,
      date: "2 hours ago",
      insights: 5
    },
    {
      id: 2,
      name: "Banking Website Usability",
      status: "in-progress",
      participants: 5,
      completion: 60,
      successRate: 80,
      date: "6 hours ago",
      insights: 3
    },
    {
      id: 3,
      name: "Food Delivery App Flow",
      status: "completed",
      participants: 10,
      completion: 100,
      successRate: 85,
      date: "1 day ago",
      insights: 7
    },
    {
      id: 4,
      name: "Educational Platform Test",
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
      description: "Start testing with Ethiopian users",
      icon: Plus,
      action: "create",
      color: "blue"
    },
    {
      title: "View Analytics", 
      description: "Analyze your test results",
      icon: BarChart3,
      action: "analytics",
      color: "green"
    },
    {
      title: "Ethiopian Panel",
      description: "Browse available testers",
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
              Here's how your Ethiopian user testing is performing.
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
                    <p className="text-sm mt-1 text-slate-500">
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
          {/* Left Column - Tests */}
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
                      Your Ethiopian user testing sessions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
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
                              {test.participants} Ethiopian testers
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
          </div>

          {/* Right Column - Quick Actions and Account */}
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
                      <span className="text-slate-900">12 / 25</span>
                    </div>
                    <Progress value={48} className="h-2" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;