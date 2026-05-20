"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, BarChart3, Calendar, CheckCircle, Clock, FileText, MoreHorizontal, Plus, Target, Users } from 'lucide-react';

interface CustomerTest {
  id: string;
  title: string;
  description: string;
  status: string;
  maxTesters: number;
  currentTesters: number;
  paymentPerTester: number;
  estimatedDuration: number;
  createdAt: string;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const planName = user?.plan || 'free';
  const [tests, setTests] = useState<CustomerTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTests = useCallback(async () => {
    setError('');

    try {
      const response = await fetch('/api/tests', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tests');
      }

      setTests(data.tests || []);
    } catch (loadError: any) {
      setError(loadError.message || 'Failed to load tests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const metrics = useMemo(() => {
    const totalSlots = tests.reduce((sum, test) => sum + test.maxTesters, 0);
    const draftCount = tests.filter((test) => test.status === 'DRAFT').length;
    const estimatedSpend = tests.reduce((sum, test) => sum + (test.maxTesters * test.paymentPerTester), 0);

    return [
      {
        title: 'Total Tests',
        value: tests.length.toString(),
        change: draftCount > 0 ? `${draftCount} draft${draftCount === 1 ? '' : 's'}` : 'No drafts yet',
        icon: Target,
        color: 'blue',
      },
      {
        title: 'Tester Slots',
        value: totalSlots.toString(),
        change: 'Planned capacity',
        icon: Users,
        color: 'green',
      },
      {
        title: 'Draft Budget',
        value: `${estimatedSpend} ETB`,
        change: 'Before payment processing',
        icon: BarChart3,
        color: 'purple',
      },
      {
        title: 'Avg. Duration',
        value: tests.length > 0 ? `${Math.round(tests.reduce((sum, test) => sum + test.estimatedDuration, 0) / tests.length)}m` : '0m',
        change: 'Estimated per test',
        icon: Clock,
        color: 'orange',
      },
    ];
  }, [tests]);

  const recentTests = tests.slice(0, 4);

  const quickActions = [
    {
      title: 'Create New Test',
      description: 'Save a real draft test',
      icon: Plus,
      href: '/dashboard/tests/new',
      color: 'blue',
    },
    {
      title: 'View Tests',
      description: 'Manage saved drafts',
      icon: Target,
      href: '/dashboard/tests',
      color: 'green',
    },
    {
      title: 'Ethiopian Panel',
      description: 'Browse available testers',
      icon: Users,
      href: '/dashboard/testers',
      color: 'purple',
    },
    {
      title: 'Analytics',
      description: 'Review future results',
      icon: FileText,
      href: '/dashboard/analytics',
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-600">
              Create and manage Ethiopian usability test drafts.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Badge className="bg-blue-100 text-blue-700">
              {planName.charAt(0).toUpperCase()}{planName.slice(1)} Plan
            </Badge>
            <Button onClick={() => router.push('/dashboard/tests/new')} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((stat) => (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : stat.value}</p>
                    <p className="text-sm mt-1 text-slate-500">{stat.change}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">Recent Tests</CardTitle>
                    <CardDescription>Your latest saved draft tests</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/tests')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-12 text-center text-slate-600">Loading tests...</div>
                ) : recentTests.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No tests yet</h3>
                    <p className="text-slate-600 mb-6">Create your first draft to start turning this dashboard into a real product workflow.</p>
                    <Button onClick={() => router.push('/dashboard/tests/new')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Draft Test
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTests.map((test) => (
                      <div key={test.id} className="flex flex-col gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-slate-100">
                            {test.status === 'DRAFT' ? (
                              <Calendar className="h-5 w-5 text-slate-600" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{test.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                              <span>{test.maxTesters} tester slots</span>
                              <span>{test.estimatedDuration} min</span>
                              <span>{test.paymentPerTester} ETB/tester</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-100 text-slate-700">{test.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Button key={action.title} variant="ghost" onClick={() => router.push(action.href)} className="w-full justify-start h-auto p-4 hover:bg-slate-50">
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

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-slate-900">{user?.name}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                    <div className="text-sm text-slate-500">{user?.company}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Draft usage</span>
                    <span className="text-slate-900">{tests.length} / 25</span>
                  </div>
                  <Progress value={Math.min((tests.length / 25) * 100, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
