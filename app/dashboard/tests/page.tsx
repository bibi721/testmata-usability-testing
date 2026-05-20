"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Clock, Monitor, Plus, RefreshCw, Search, Smartphone, Target, Users } from 'lucide-react';

interface CustomerTest {
  id: string;
  title: string;
  description: string;
  testType: string;
  platform: string;
  targetUrl?: string | null;
  status: string;
  maxTesters: number;
  currentTesters: number;
  paymentPerTester: number;
  estimatedDuration: number;
  tasks?: { items?: Array<{ id: string; instruction: string }> };
  demographics?: Record<string, string[]>;
  createdAt: string;
}

const platformIcons = {
  WEB: Monitor,
  MOBILE_APP: Smartphone,
  DESKTOP: Monitor,
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  RUNNING: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function TestsPageContent() {
  const router = useRouter();
  const [tests, setTests] = useState<CustomerTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTests = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const filteredTests = useMemo(() => tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase())
      || test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [tests, searchTerm, statusFilter]);

  const metrics = useMemo(() => ({
    total: tests.length,
    drafts: tests.filter((test) => test.status === 'DRAFT').length,
    totalSlots: tests.reduce((sum, test) => sum + test.maxTesters, 0),
    averagePayment: tests.length > 0
      ? Math.round(tests.reduce((sum, test) => sum + test.paymentPerTester, 0) / tests.length)
      : 0,
  }), [tests]);

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tests</h1>
            <p className="text-slate-600 mt-2">Create and manage your customer usability test drafts.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => loadTests(true)} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
          <Card className="border-slate-200"><CardContent className="p-6"><p className="text-sm text-slate-600">Total Tests</p><p className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-6"><p className="text-sm text-slate-600">Drafts</p><p className="text-2xl font-bold text-slate-900 mt-1">{metrics.drafts}</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-6"><p className="text-sm text-slate-600">Tester Slots</p><p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalSlots}</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-6"><p className="text-sm text-slate-600">Avg. ETB/Test</p><p className="text-2xl font-bold text-slate-900 mt-1">{metrics.averagePayment}</p></CardContent></Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Customer Tests</CardTitle>
                <CardDescription>Drafts are saved here before Phase 3 publishing.</CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10 sm:w-72"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center text-slate-600">Loading tests...</div>
            ) : filteredTests.length === 0 ? (
              <div className="py-16 text-center">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {tests.length === 0 ? 'No tests yet' : 'No matching tests'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {tests.length === 0 ? 'Create your first draft to start building a real customer testing loop.' : 'Try changing your search or filter.'}
                </p>
                {tests.length === 0 && (
                  <Button onClick={() => router.push('/dashboard/tests/new')} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Draft Test
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTests.map((test) => {
                  const PlatformIcon = platformIcons[test.platform as keyof typeof platformIcons] || Monitor;
                  const taskCount = test.tasks?.items?.length || 0;
                  const targetingCount = test.demographics
                    ? Object.values(test.demographics).reduce((sum, values) => sum + (Array.isArray(values) ? values.length : 0), 0)
                    : 0;

                  return (
                    <Card key={test.id} className="border-slate-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={statusStyles[test.status] || 'bg-slate-100 text-slate-700'}>{test.status}</Badge>
                              <Badge variant="outline">{test.testType}</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <PlatformIcon className="h-3 w-3" />
                                {test.platform.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{test.title}</h3>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{test.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 lg:grid-cols-4">
                              <span className="flex items-center"><Users className="h-4 w-4 mr-1" />{test.maxTesters} slots</span>
                              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{test.estimatedDuration} min</span>
                              <span className="flex items-center"><Target className="h-4 w-4 mr-1" />{taskCount} tasks</span>
                              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(test.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 lg:min-w-48">
                            <p className="font-semibold text-slate-900">{test.paymentPerTester} ETB</p>
                            <p>per tester</p>
                            <p className="mt-2">{targetingCount} targeting filters</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestsPage() {
  return (
    <ProtectedRoute requiredUserType="customer">
      <TestsPageContent />
    </ProtectedRoute>
  );
}
