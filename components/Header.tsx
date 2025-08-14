"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  ChevronDown,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  Bell,
  User
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToggle } from '@/hooks/useToggle';

/**
 * Main navigation header component
 */
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, toggleMobileMenu, setIsMobileMenuOpen] = useToggle(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, [setIsMobileMenuOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setIsMobileMenuOpen(false);
  }, [logout, setIsMobileMenuOpen]);

  const features = [
    {
      title: "Ethiopian User Testing",
      description: "Get feedback from real Ethiopian users on your applications",
      icon: Users,
      href: "/features/user-testing"
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive insights tailored for Ethiopian market",
      icon: BarChart3,
      href: "/features/analytics"
    },
    {
      title: "Local UX Research",
      description: "Discover usability issues specific to Ethiopian users",
      icon: Lightbulb,
      href: "/features/research"
    }
  ];

  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled || isDashboard
        ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" 
        : "bg-white/90 backdrop-blur-sm border-b border-slate-200/50"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Masada</span>
          </Link>

          {/* Desktop Navigation */}
          {!isDashboard && (
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-700 hover:text-blue-600">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="z-50">
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {features.map((feature) => (
                        <li key={feature.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={feature.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center space-x-2">
                                <feature.icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">
                                  {feature.title}
                                </div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {feature.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/product" legacyBehavior passHref>
                    <NavigationMenuLink className="text-slate-700 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                      Product
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink className="text-slate-700 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Dashboard Navigation */}
          {isDashboard && user && (
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-slate-700 hover:text-blue-600 font-medium transition-colors",
                  pathname === '/dashboard' && "text-blue-600"
                )}
              >
                Overview
              </Link>
              <Link 
                href="/dashboard/tests" 
                className={cn(
                  "text-slate-700 hover:text-blue-600 font-medium transition-colors",
                  pathname === '/dashboard/tests' && "text-blue-600"
                )}
              >
                Tests
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className={cn(
                  "text-slate-700 hover:text-blue-600 font-medium transition-colors",
                  pathname === '/dashboard/analytics' && "text-blue-600"
                )}
              >
                Analytics
              </Link>
              <Link 
                href="/dashboard/testers" 
                className={cn(
                  "text-slate-700 hover:text-blue-600 font-medium transition-colors",
                  pathname === '/dashboard/testers' && "text-blue-600"
                )}
              >
                Testers
              </Link>
            </nav>
          )}

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-slate-700">{user.name?.split(' ')[0]}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
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
                      <Link href="/dashboard" className="flex items-center w-full">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/settings" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-slate-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Start Testing
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleMobileMenu}
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
              {!isDashboard && (
                <>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/product"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Product
                    </Link>
                  </button>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/pricing"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Pricing
                    </Link>
                  </button>
                </>
              )}
              
              {isDashboard && user && (
                <>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Overview
                    </Link>
                  </button>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/dashboard/tests"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Tests
                    </Link>
                  </button>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/dashboard/analytics"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Analytics
                    </Link>
                  </button>
                  <button
                    onClick={handleMobileMenuClose}
                    className="w-full text-left"
                  >
                    <Link
                      href="/dashboard/testers"
                      className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Testers
                    </Link>
                  </button>
                </>
              )}

              {user ? (
                <>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
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
                      href="/auth/register"
                      className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Start Testing
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

export default Header;