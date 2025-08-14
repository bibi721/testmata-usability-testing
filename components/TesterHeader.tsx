"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Target,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const TesterHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/tester/dashboard" className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <span className="text-xl font-bold text-slate-900">Masada</span>
              <span className="text-sm text-slate-600 block leading-none">Tester</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/tester/dashboard" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/tester/dashboard?tab=available" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Available Tests
            </Link>
            <Link 
              href="/tester/dashboard?tab=earnings" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Earnings
            </Link>
            <Link 
              href="/tester/help" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Help
            </Link>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* Earnings Quick View */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">$420</span>
              <span className="text-xs text-green-600">this month</span>
            </div>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">{user.name?.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/tester/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Become a Tester
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={handleMobileMenuClose}
                className="w-full text-left"
              >
                <Link
                  href="/tester/dashboard"
                  className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
              </button>
              <button
                onClick={handleMobileMenuClose}
                className="w-full text-left"
              >
                <Link
                  href="/tester/dashboard?tab=available"
                  className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Available Tests
                </Link>
              </button>
              <button
                onClick={handleMobileMenuClose}
                className="w-full text-left"
              >
                <Link
                  href="/tester/dashboard?tab=earnings"
                  className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Earnings
                </Link>
              </button>
              <button
                onClick={handleMobileMenuClose}
                className="w-full text-left"
              >
                <Link
                  href="/tester/help"
                  className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Help
                </Link>
              </button>
              {user ? (
                <>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/tester/profile"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Profile Settings
                    </Link>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Sign In
                    </Link>
                  </button>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/tester/signup"
                      className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Become a Tester
                    </Link>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TesterHeader;