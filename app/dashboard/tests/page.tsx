"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause,
  Square,
  Users, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Monitor,
  Smartphone,
  Globe,
  Eye,
  Calendar,
  FileText,
  Bell,
  MoreHorizontal
} from 'lucide-react';

const TestDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Mock test data
  const testMetrics = {
    totalTests: 156,
    activeTests: 12,
    completedTests: 132,
    failedTests: 12,
    successRate: 89.7,
    avgExecutionTime: '2.4m',
    totalTesters: 45,
    avgRating: 4.6
  };

  const recentTests = [
    {
      id: 'TST-001',
      name: 'E-commerce Checkout Flow',
      status: 'running',
      progress: 75,
      testers: 8,
      startTime: '2025-01-20 14:30',
      estimatedCompletion: '2025-01-20 16:00',
      successRate: 87.5,
      device: 'mobile',
      priority: 'high'
    },
    {
      id: 'TST-002', 
      name: 'Banking App Navigation',
      status: 'completed',
      progress: 100,
      testers: 12,
      startTime: '2025-01-20 10:00',
      completedTime: '2025-01-20 12:30',
      successRate: 92.3,
      device: 'desktop',
      priority: 'medium'
    },
    {
      id: 'TST-003',
      name: 'Food Delivery UX Test',
      status: 'failed',
      progress: 45,
      testers: 5,
      startTime: '2025-01-20 09:15',
      failedTime: '2025-01-20 11:00',
      successRate: 23.1,
      device: 'mobile',
      priority: 'low'
    },
    {
      id: 'TST-004',
      name: 'Educational Platform Test',
      status: 'pending',
      progress: 0,
      testers: 0,
      scheduledTime: '2025-01-21 09:00',
      successRate: 0,
      device: 'tablet',
      priority: 'medium'
    }
  ];

  const systemHealth = {
    cpu: 67,
    memory: 82,
    network: 94,
    storage: 45
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-slate-500';
    }
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
              Test Dashboard
            </h1>
            <p className="text-slate-600">
              Monitor and manage your Ethiopian user testing sessions
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Play className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Tests</p>
                  <p className="text-2xl font-bold text-slate-900">{testMetrics.totalTests}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{testMetrics.successRate}%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2% improvement
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Tests</p>
                  <p className="text-2xl font-bold text-slate-900">{testMetrics.activeTests}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    Running now
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Play className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Ethiopian Testers</p>
                  <p className="text-2xl font-bold text-slate-900">{testMetrics.totalTesters}</p>
                  <p className="text-sm text-slate-600 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Active this week
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">CPU Usage</span>
                  <span className="text-slate-900">{systemHealth.cpu}%</span>
                </div>
                <Progress value={systemHealth.cpu} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Memory</span>
                  <span className="text-slate-900">{systemHealth.memory}%</span>
                </div>
                <Progress value={systemHealth.memory} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Network</span>
                  <span className="text-slate-900">{systemHealth.network}%</span>
                </div>
                <Progress value={systemHealth.network} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Storage</span>
                  <span className="text-slate-900">{systemHealth.storage}%</span>
                </div>
                <Progress value={systemHealth.storage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Test Activity */}
              <div className="lg:col-span-2">
                <Card className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold text-slate-900">
                        Recent Test Activity
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search tests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTests.map((test) => (
                        <Card key={test.id} className={`border-l-4 ${getPriorityColor(test.priority)} hover:shadow-md transition-shadow`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Badge className={getStatusColor(test.status)}>
                                  {getStatusIcon(test.status)}
                                  <span className="ml-1 capitalize">{test.status}</span>
                                </Badge>
                                <span className="text-sm font-medium text-slate-900">{test.id}</span>
                                <div className="flex items-center text-sm text-slate-600">
                                  {test.device === 'mobile' && <Smartphone className="h-4 w-4 mr-1" />}
                                  {test.device === 'desktop' && <Monitor className="h-4 w-4 mr-1" />}
                                  {test.device === 'tablet' && <Monitor className="h-4 w-4 mr-1" />}
                                  {test.device}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {test.name}
                            </h3>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {test.testers} testers
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {test.status === 'running' ? test.estimatedCompletion?.split(' ')[1] : 
                                 test.status === 'completed' ? test.completedTime?.split(' ')[1] :
                                 test.status === 'failed' ? test.failedTime?.split(' ')[1] :
                                 test.scheduledTime?.split(' ')[1]}
                              </div>
                              <div className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                {test.successRate}% success
                              </div>
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {test.priority} priority
                              </div>
                            </div>
                            
                            {test.status === 'running' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Progress</span>
                                  <span className="text-slate-900">{test.progress}%</span>
                                </div>
                                <Progress value={test.progress} className="h-2" />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                {test.status === 'running' && (
                                  <>
                                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                      <Square className="h-3 w-3 mr-1" />
                                      Stop
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                                      <Pause className="h-3 w-3 mr-1" />
                                      Pause
                                    </Button>
                                  </>
                                )}
                                {test.status === 'completed' && (
                                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                    <Download className="h-3 w-3 mr-1" />
                                    Export
                                  </Button>
                                )}
                                {test.status === 'pending' && (
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Play className="h-3 w-3 mr-1" />
                                    Start
                                  </Button>
                                )}
                              </div>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Notifications */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Create New Test
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-slate-300">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Testers
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-slate-300">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-slate-300">
                      <Download className="h-4 w-4 mr-2" />
                      Export Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-slate-300">
                      <Settings className="h-4 w-4 mr-2" />
                      Test Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Test Failed</p>
                        <p className="text-xs text-red-700">Food Delivery UX Test failed due to low success rate</p>
                        <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Test Completed</p>
                        <p className="text-xs text-green-700">Banking App Navigation test completed successfully</p>
                        <p className="text-xs text-green-600 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">New Testers</p>
                        <p className="text-xs text-blue-700">5 new Ethiopian testers joined your panel</p>
                        <p className="text-xs text-blue-600 mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Active Tests Tab */}
          <TabsContent value="active" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Active Test Sessions
                </CardTitle>
                <CardDescription>
                  Monitor real-time testing sessions with Ethiopian users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.filter(test => test.status === 'running').map((test) => (
                    <Card key={test.id} className="border-slate-200 bg-blue-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <h3 className="text-lg font-semibold text-slate-900">{test.name}</h3>
                            <Badge className="bg-blue-100 text-blue-700">Live</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                              <Square className="h-3 w-3 mr-1" />
                              Stop Test
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                              <Eye className="h-3 w-3 mr-1" />
                              Watch Live
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{test.testers}</p>
                            <p className="text-sm text-slate-600">Active Testers</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{test.progress}%</p>
                            <p className="text-sm text-slate-600">Progress</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">{test.successRate}%</p>
                            <p className="text-sm text-slate-600">Success Rate</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">1.2m</p>
                            <p className="text-sm text-slate-600">Avg. Time</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Test Progress</span>
                            <span className="text-slate-900">{test.progress}% Complete</span>
                          </div>
                          <Progress value={test.progress} className="h-3" />
                          <p className="text-xs text-slate-500">
                            Estimated completion: {test.estimatedCompletion}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Test Execution History
                    </CardTitle>
                    <CardDescription>
                      Complete history of all test sessions and results
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="border-slate-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <Card key={test.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusIcon(test.status)}
                              <span className="ml-1 capitalize">{test.status}</span>
                            </Badge>
                            <div>
                              <h3 className="font-semibold text-slate-900">{test.name}</h3>
                              <p className="text-sm text-slate-600">{test.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">{test.successRate}% Success</p>
                            <p className="text-xs text-slate-600">
                              {test.status === 'completed' ? test.completedTime :
                               test.status === 'failed' ? test.failedTime :
                               test.status === 'running' ? 'In Progress' :
                               test.scheduledTime}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Success Rate Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Device Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-slate-700">Mobile</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-700">Desktop</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-slate-700">Tablet</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestDashboard;