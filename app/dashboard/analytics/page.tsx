"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  Clock, 
  Smartphone,
  Monitor,
  Globe,
  Eye,
  MousePointer,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Share
} from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Mock analytics data
  const overviewMetrics = {
    totalTests: 156,
    totalTesters: 89,
    avgSuccessRate: 78.5,
    avgCompletionTime: '4.2m',
    totalInsights: 342,
    improvementRate: 23.4
  };

  const trendData = {
    successRate: { current: 78.5, previous: 72.1, trend: 'up' },
    completionTime: { current: 4.2, previous: 5.1, trend: 'down' },
    userSatisfaction: { current: 4.6, previous: 4.2, trend: 'up' },
    testVolume: { current: 45, previous: 38, trend: 'up' }
  };

  const deviceBreakdown = [
    { device: 'Mobile', percentage: 68, count: 156, icon: Smartphone },
    { device: 'Desktop', percentage: 25, count: 57, icon: Monitor },
    { device: 'Tablet', percentage: 7, count: 16, icon: Monitor }
  ];

  const regionData = [
    { region: 'Addis Ababa', percentage: 45, testers: 40 },
    { region: 'Dire Dawa', percentage: 18, testers: 16 },
    { region: 'Mekelle', percentage: 12, testers: 11 },
    { region: 'Bahir Dar', percentage: 10, testers: 9 },
    { region: 'Hawassa', percentage: 8, testers: 7 },
    { region: 'Other', percentage: 7, testers: 6 }
  ];

  const topInsights = [
    {
      category: 'Navigation',
      issue: 'Users struggle with main menu on mobile',
      impact: 'High',
      frequency: 78,
      recommendation: 'Simplify navigation structure'
    },
    {
      category: 'Payment',
      issue: 'Mobile money option not prominent',
      impact: 'High',
      frequency: 65,
      recommendation: 'Add mobile payment as primary option'
    },
    {
      category: 'Language',
      issue: 'Amharic text too small on mobile',
      impact: 'Medium',
      frequency: 52,
      recommendation: 'Increase font size for Amharic content'
    },
    {
      category: 'Performance',
      issue: 'Slow loading on 3G connections',
      impact: 'Medium',
      frequency: 43,
      recommendation: 'Optimize images and reduce page size'
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    alert('Analytics export feature coming soon! Data will be available in PDF and CSV formats.');
  };

  const handleShare = () => {
    alert('Share analytics feature coming soon! You\'ll be able to share reports with your team.');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">
              Insights from your Ethiopian user testing campaigns
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{trendData.successRate.current}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +{(trendData.successRate.current - trendData.successRate.previous).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-slate-900">{trendData.completionTime.current}m</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      -{(trendData.completionTime.previous - trendData.completionTime.current).toFixed(1)}m
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Ethiopian Testers</p>
                  <p className="text-2xl font-bold text-slate-900">{overviewMetrics.totalTesters}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">Active this month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">User Satisfaction</p>
                  <p className="text-2xl font-bold text-slate-900">{trendData.userSatisfaction.current}/5</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +{(trendData.userSatisfaction.current - trendData.userSatisfaction.previous).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Rate Trend */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Success Rate Trend
                  </CardTitle>
                  <CardDescription>
                    How your tests are performing over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Interactive chart visualization</p>
                      <p className="text-sm text-slate-400">Success rate trending upward</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Volume */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Test Volume
                  </CardTitle>
                  <CardDescription>
                    Number of tests completed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Test volume chart</p>
                      <p className="text-sm text-slate-400">{trendData.testVolume.current} tests this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Performance Summary
                </CardTitle>
                <CardDescription>
                  Key metrics comparison with previous period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">+23%</div>
                    <div className="text-sm text-slate-600">Success Rate Improvement</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">-18%</div>
                    <div className="text-sm text-slate-600">Completion Time Reduction</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">+34%</div>
                    <div className="text-sm text-slate-600">User Engagement</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">+15%</div>
                    <div className="text-sm text-slate-600">Tester Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Device Distribution
                  </CardTitle>
                  <CardDescription>
                    How Ethiopian users access your tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceBreakdown.map((device, index) => (
                      <div key={device.device} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <device.icon className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-900">{device.device}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-slate-900">{device.percentage}%</span>
                            <span className="text-xs text-slate-500 ml-2">({device.count} tests)</span>
                          </div>
                        </div>
                        <Progress value={device.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Device Performance
                  </CardTitle>
                  <CardDescription>
                    Success rates by device type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Mobile</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">82%</div>
                        <div className="text-xs text-slate-500">Success Rate</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Desktop</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">89%</div>
                        <div className="text-xs text-slate-500">Success Rate</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Tablet</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">76%</div>
                        <div className="text-xs text-slate-500">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Ethiopian Regional Distribution
                </CardTitle>
                <CardDescription>
                  Where your testers are located across Ethiopia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {regionData.map((region, index) => (
                      <div key={region.region} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-900">{region.region}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-slate-900">{region.percentage}%</span>
                            <span className="text-xs text-slate-500 ml-2">({region.testers} testers)</span>
                          </div>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center bg-slate-50 rounded-lg h-64">
                    <div className="text-center">
                      <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Ethiopia Map Visualization</p>
                      <p className="text-sm text-slate-400">Regional distribution overlay</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Top User Experience Insights
                </CardTitle>
                <CardDescription>
                  Most common issues identified by Ethiopian testers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topInsights.map((insight, index) => (
                    <Card key={index} className="border-slate-200 bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.category}
                              </Badge>
                              <Badge className={`text-xs ${
                                insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                                insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {insight.impact} Impact
                              </Badge>
                            </div>
                            <h4 className="font-medium text-slate-900 mb-1">{insight.issue}</h4>
                            <p className="text-sm text-slate-600 mb-2">{insight.recommendation}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span>Reported by {insight.frequency}% of testers</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">{insight.frequency}%</div>
                            <div className="text-xs text-slate-500">Frequency</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;