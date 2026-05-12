"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Languages, MapPin, Search, Smartphone, Star, Users } from 'lucide-react';

const testerStats = [
  { label: 'Verified testers', value: '500+', icon: Users },
  { label: 'Avg. rating', value: '4.8', icon: Star },
  { label: 'Regions covered', value: '11', icon: MapPin },
  { label: 'Languages', value: '5+', icon: Languages },
];

const featuredTesters = [
  {
    name: 'Meron Tadesse',
    city: 'Addis Ababa',
    rating: 4.9,
    completedTests: 47,
    languages: ['Amharic', 'English'],
    devices: ['Android', 'Laptop'],
  },
  {
    name: 'Dawit Alemu',
    city: 'Hawassa',
    rating: 4.7,
    completedTests: 32,
    languages: ['Amharic', 'Oromo'],
    devices: ['Android'],
  },
  {
    name: 'Selam Bekele',
    city: 'Bahir Dar',
    rating: 4.8,
    completedTests: 39,
    languages: ['Amharic', 'English'],
    devices: ['iPhone', 'Laptop'],
  },
];

export default function TestersPage() {
  return (
    <ProtectedRoute requiredUserType="customer">
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tester Panel</h1>
              <p className="text-slate-600 mt-2">
                Explore the Ethiopian tester pool available for your studies.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" />
              Find Matching Testers
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {testerStats.map((stat) => (
              <Card key={stat.label} className="border-slate-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-slate-200">
              <CardHeader>
                <CardTitle>Featured Testers</CardTitle>
                <CardDescription>Sample panel members matching common product studies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredTesters.map((tester) => (
                  <div key={tester.name} className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {tester.name.split(' ').map((part) => part[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900">{tester.name}</h3>
                        <p className="text-sm text-slate-600">{tester.city} · {tester.completedTests} completed tests</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tester.languages.map((language) => (
                            <Badge key={language} variant="secondary">{language}</Badge>
                          ))}
                          {tester.devices.map((device) => (
                            <Badge key={device} variant="outline">{device}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {tester.rating}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Panel Readiness</CardTitle>
                <CardDescription>Current coverage for common study requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Mobile device coverage</span>
                    <span className="font-medium text-slate-900">92%</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Bilingual testers</span>
                    <span className="font-medium text-slate-900">76%</span>
                  </div>
                  <Progress value={76} />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Verified profile data
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <Smartphone className="h-4 w-4 mr-2 text-blue-600" />
                    Mobile-first participant pool
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                    Regional targeting supported
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
