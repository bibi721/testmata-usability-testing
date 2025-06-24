"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Target, Eye, EyeOff, Loader2, Mail, Github, Check, X } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const passwordRequirements = [
    { test: (pw: string) => pw.length >= 8, text: "At least 8 characters" },
    { test: (pw: string) => /[A-Z]/.test(pw), text: "One uppercase letter" },
    { test: (pw: string) => /[a-z]/.test(pw), text: "One lowercase letter" },
    { test: (pw: string) => /\d/.test(pw), text: "One number" }
  ];

  const calculatePasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter(req => req.test(password)).length;
    return (passedRequirements / passwordRequirements.length) * 100;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 100) {
      setError('Please meet all password requirements');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, 'customer');
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleOAuthRegister = (provider: string) => {
    // Mock OAuth registration
    console.log(`Register with ${provider}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Masada</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-slate-600">
            Start testing with Ethiopian users today
          </p>
        </div>

        {/* Registration Form */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900">
              Sign Up for Customer Account
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              Join Ethiopian companies using Masada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 border-slate-300 hover:bg-slate-50"
                onClick={() => handleOAuthRegister('google')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-slate-300 hover:bg-slate-50"
                onClick={() => handleOAuthRegister('github')}
              >
                <Github className="h-4 w-4 mr-2" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength < 50 ? 'text-red-600' :
                        passwordStrength < 75 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength < 50 ? 'Weak' :
                         passwordStrength < 75 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                    
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          {req.test(formData.password) ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-slate-400" />
                          )}
                          <span className={req.test(formData.password) ? 'text-green-600' : 'text-slate-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-0.5"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Customer Account'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Want to earn money as a tester?{' '}
                <Link
                  href="/tester/signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Become a tester
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>
            ✓ No setup fees  •  ✓ Ethiopian user panel  •  ✓ Results in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;