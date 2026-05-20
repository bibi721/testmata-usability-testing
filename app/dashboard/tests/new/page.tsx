"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Plus, Save, Trash2 } from 'lucide-react';

type TestType = 'USABILITY' | 'FEEDBACK' | 'SURVEY' | 'INTERVIEW' | '';
type TestPlatform = 'WEB' | 'MOBILE_APP' | 'DESKTOP' | '';

interface TaskDraft {
  id: string;
  instruction: string;
}

interface FormData {
  title: string;
  description: string;
  targetUrl: string;
  testType: TestType;
  platform: TestPlatform;
  tasks: TaskDraft[];
  regions: string[];
  languages: string[];
  devices: string[];
  ageRanges: string[];
  educationLevels: string[];
  occupations: string[];
  maxTesters: string;
  estimatedDuration: string;
  paymentPerTester: string;
}

const steps = ['Basics', 'Tasks', 'Targeting', 'Budget', 'Review'];

const regionOptions = ['Addis Ababa', 'Dire Dawa', 'Oromia', 'Amhara', 'Tigray', 'Sidama', 'SNNPR', 'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 'Harari'];
const languageOptions = ['Amharic', 'English', 'Oromo', 'Tigrinya', 'Somali'];
const deviceOptions = ['Android phone', 'iPhone', 'Tablet', 'Laptop', 'Desktop'];
const ageOptions = ['18-24', '25-34', '35-44', '45-54', '55+'];
const educationOptions = ['High School', 'Diploma', 'Bachelor Degree', 'Master Degree', 'PhD'];
const occupationOptions = ['Student', 'Employee', 'Business Owner', 'Freelancer', 'Homemaker', 'Unemployed'];

const initialFormData: FormData = {
  title: '',
  description: '',
  targetUrl: '',
  testType: '',
  platform: '',
  tasks: [{ id: 'task-1', instruction: '' }],
  regions: [],
  languages: [],
  devices: [],
  ageRanges: [],
  educationLevels: [],
  occupations: [],
  maxTesters: '10',
  estimatedDuration: '20',
  paymentPerTester: '150',
};

const toggleValue = (values: string[], value: string) => (
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
);

function CreateTestWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const progress = ((currentStep + 1) / steps.length) * 100;

  const selectedTargeting = useMemo(() => [
    ...formData.regions,
    ...formData.languages,
    ...formData.devices,
    ...formData.ageRanges,
    ...formData.educationLevels,
    ...formData.occupations,
  ], [formData]);

  const updateField = (field: keyof FormData, value: string | string[] | TaskDraft[]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const updateTask = (id: string, instruction: string) => {
    updateField('tasks', formData.tasks.map((task) => (
      task.id === id ? { ...task, instruction } : task
    )));
  };

  const addTask = () => {
    updateField('tasks', [
      ...formData.tasks,
      { id: `task-${Date.now()}`, instruction: '' },
    ]);
  };

  const removeTask = (id: string) => {
    if (formData.tasks.length === 1) return;
    updateField('tasks', formData.tasks.filter((task) => task.id !== id));
  };

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.title.trim()) nextErrors.title = 'Title is required';
      if (!formData.description.trim()) nextErrors.description = 'Description is required';
      if (formData.targetUrl && !/^https?:\/\/.+/i.test(formData.targetUrl)) {
        nextErrors.targetUrl = 'Enter a URL beginning with http:// or https://';
      }
      if (!formData.testType) nextErrors.testType = 'Choose a test type';
      if (!formData.platform) nextErrors.platform = 'Choose a platform';
    }

    if (step === 1) {
      if (!formData.tasks.some((task) => task.instruction.trim())) {
        nextErrors.tasks = 'Add at least one task';
      }
    }

    if (step === 3) {
      if (Number(formData.maxTesters) < 1) nextErrors.maxTesters = 'Max testers must be at least 1';
      if (Number(formData.estimatedDuration) < 1) nextErrors.estimatedDuration = 'Duration must be at least 1 minute';
      if (Number(formData.paymentPerTester) <= 0) nextErrors.paymentPerTester = 'Payment must be greater than 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = async () => {
    for (let step = 0; step <= 3; step += 1) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setIsSaving(true);
    setServerError('');

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          targetUrl: formData.targetUrl.trim(),
          testType: formData.testType,
          platform: formData.platform,
          tasks: formData.tasks
            .map((task) => ({ ...task, instruction: task.instruction.trim() }))
            .filter((task) => task.instruction),
          demographics: {
            regions: formData.regions,
            languages: formData.languages,
            devices: formData.devices,
            ageRanges: formData.ageRanges,
            educationLevels: formData.educationLevels,
            occupations: formData.occupations,
          },
          requirements: [],
          maxTesters: Number(formData.maxTesters),
          estimatedDuration: Number(formData.estimatedDuration),
          paymentPerTester: Number(formData.paymentPerTester),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || 'Failed to save draft');
        return;
      }

      router.push('/dashboard/tests');
      router.refresh();
    } catch (error) {
      setServerError('Unable to save draft. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCheckboxGroup = (field: keyof Pick<FormData, 'regions' | 'languages' | 'devices' | 'ageRanges' | 'educationLevels' | 'occupations'>, options: string[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <Checkbox
            checked={(formData[field] as string[]).includes(option)}
            onCheckedChange={() => updateField(field, toggleValue(formData[field] as string[], option))}
          />
          {option}
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard/tests')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Test Draft</h1>
              <p className="text-slate-600 mt-2">Set up a usability test for Ethiopian users. You can publish it in the next phase.</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700">Draft only</Badge>
          </div>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {steps.map((step, index) => (
                  <Badge key={step} className={index === currentStep ? 'bg-blue-600 text-white' : index < currentStep ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                    {index < currentStep && <CheckCircle className="h-3 w-3 mr-1" />}
                    {index + 1}. {step}
                  </Badge>
                ))}
              </div>
              <Progress value={progress} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{serverError}</AlertDescription>
              </Alert>
            )}

            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <CardTitle>Basics</CardTitle>
                  <CardDescription>Name the study and define the product surface.</CardDescription>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Test Title *</Label>
                    <Input id="title" value={formData.title} onChange={(event) => updateField('title', event.target.value)} placeholder="E-commerce checkout flow" />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetUrl">Target URL</Label>
                    <Input id="targetUrl" value={formData.targetUrl} onChange={(event) => updateField('targetUrl', event.target.value)} placeholder="https://example.com" />
                    {errors.targetUrl && <p className="text-sm text-red-600">{errors.targetUrl}</p>}
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" value={formData.description} onChange={(event) => updateField('description', event.target.value)} rows={4} placeholder="What should testers understand before starting?" />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Test Type *</Label>
                    <Select value={formData.testType} onValueChange={(value) => updateField('testType', value as TestType)}>
                      <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USABILITY">Usability</SelectItem>
                        <SelectItem value="FEEDBACK">Feedback</SelectItem>
                        <SelectItem value="SURVEY">Survey</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.testType && <p className="text-sm text-red-600">{errors.testType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Platform *</Label>
                    <Select value={formData.platform} onValueChange={(value) => updateField('platform', value as TestPlatform)}>
                      <SelectTrigger><SelectValue placeholder="Choose platform" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEB">Web</SelectItem>
                        <SelectItem value="MOBILE_APP">Mobile app</SelectItem>
                        <SelectItem value="DESKTOP">Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.platform && <p className="text-sm text-red-600">{errors.platform}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>Add the actions testers should attempt.</CardDescription>
                </div>
                <div className="space-y-4">
                  {formData.tasks.map((task, index) => (
                    <div key={task.id} className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={task.id}>Task {index + 1}</Label>
                        <Textarea id={task.id} value={task.instruction} onChange={(event) => updateTask(task.id, event.target.value)} rows={3} placeholder="Ask testers to complete a realistic product task..." />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTask(task.id)} disabled={formData.tasks.length === 1} className="mt-8 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {errors.tasks && <p className="text-sm text-red-600">{errors.tasks}</p>}
                  <Button type="button" variant="outline" onClick={addTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <CardTitle>Targeting</CardTitle>
                  <CardDescription>Choose the tester demographics for this draft.</CardDescription>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3"><Label>Regions</Label>{renderCheckboxGroup('regions', regionOptions)}</div>
                  <div className="space-y-3"><Label>Languages</Label>{renderCheckboxGroup('languages', languageOptions)}</div>
                  <div className="space-y-3"><Label>Devices</Label>{renderCheckboxGroup('devices', deviceOptions)}</div>
                  <div className="space-y-3"><Label>Age Ranges</Label>{renderCheckboxGroup('ageRanges', ageOptions)}</div>
                  <div className="space-y-3"><Label>Education</Label>{renderCheckboxGroup('educationLevels', educationOptions)}</div>
                  <div className="space-y-3"><Label>Occupations</Label>{renderCheckboxGroup('occupations', occupationOptions)}</div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <CardTitle>Budget</CardTitle>
                  <CardDescription>Set the draft participation and payout assumptions.</CardDescription>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxTesters">Max Testers *</Label>
                    <Input id="maxTesters" type="number" min="1" value={formData.maxTesters} onChange={(event) => updateField('maxTesters', event.target.value)} />
                    {errors.maxTesters && <p className="text-sm text-red-600">{errors.maxTesters}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration in Minutes *</Label>
                    <Input id="duration" type="number" min="1" value={formData.estimatedDuration} onChange={(event) => updateField('estimatedDuration', event.target.value)} />
                    {errors.estimatedDuration && <p className="text-sm text-red-600">{errors.estimatedDuration}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Per Tester (ETB) *</Label>
                    <Input id="payment" type="number" min="1" value={formData.paymentPerTester} onChange={(event) => updateField('paymentPerTester', event.target.value)} />
                    {errors.paymentPerTester && <p className="text-sm text-red-600">{errors.paymentPerTester}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <CardTitle>Review Draft</CardTitle>
                  <CardDescription>Confirm the setup before saving.</CardDescription>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-slate-200">
                    <CardHeader><CardTitle className="text-lg">{formData.title || 'Untitled test'}</CardTitle><CardDescription>{formData.description || 'No description yet'}</CardDescription></CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      <p><span className="font-medium">Type:</span> {formData.testType || 'Not selected'}</p>
                      <p><span className="font-medium">Platform:</span> {formData.platform || 'Not selected'}</p>
                      <p><span className="font-medium">URL:</span> {formData.targetUrl || 'Not provided'}</p>
                      <p><span className="font-medium">Budget:</span> {formData.maxTesters} testers / {formData.estimatedDuration} min / {formData.paymentPerTester} ETB/tester</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200">
                    <CardHeader><CardTitle className="text-lg">Tasks & Targeting</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {formData.tasks.filter((task) => task.instruction.trim()).map((task, index) => (
                          <p key={task.id} className="text-sm text-slate-700">{index + 1}. {task.instruction}</p>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTargeting.length > 0 ? selectedTargeting.map((item) => (
                          <Badge key={item} variant="secondary">{item}</Badge>
                        )) : <p className="text-sm text-slate-500">No targeting filters selected</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 0 || isSaving}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={goNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving Draft...' : 'Save Draft'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewTestPage() {
  return (
    <ProtectedRoute requiredUserType="customer">
      <CreateTestWizard />
    </ProtectedRoute>
  );
}
