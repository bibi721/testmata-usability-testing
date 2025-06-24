'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail, Facebook, Youtube, Instagram } from 'lucide-react';

/**
 * Footer component with navigation links and social media
 */
const Footer: React.FC = () => {
  const handleSocialClick = useCallback((platform: string) => {
    const urls = {
      twitter: 'https://twitter.com/masadaethiopia',
      linkedin: 'https://linkedin.com/company/masada-ethiopia',
      github: 'https://github.com/masada-ethiopia',
      email: 'mailto:hello@masada.et',
      facebook: 'https://facebook.com/masadaethiopia',
      youtube: 'https://youtube.com/masadaethiopia',
      instagram: 'https://instagram.com/masadaethiopia'
    };
    
    if (platform === 'email') {
      window.location.href = urls.email;
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  }, []);

  const handleLinkClick = useCallback((section: string) => {
    alert(`${section} page coming soon!`);
  }, []);

  const navigationLinks = [
    { label: 'Blog', action: () => handleLinkClick('Blog') },
    { label: 'Knowledge Hub', action: () => handleLinkClick('Knowledge Hub') },
    { label: 'Partners', action: () => handleLinkClick('Partners') },
    { label: 'Education', action: () => handleLinkClick('Education') },
    { label: 'FAQ', action: () => handleLinkClick('FAQ') },
    { label: 'Company', action: () => handleLinkClick('Company') },
    { label: 'Webinars', action: () => handleLinkClick('Webinars') },
    { label: 'Resources', action: () => handleLinkClick('Resources') }
  ];

  const socialIcons = [
    { icon: Facebook, platform: 'facebook' },
    { icon: Twitter, platform: 'twitter' },
    { icon: Linkedin, platform: 'linkedin' },
    { icon: Youtube, platform: 'youtube' },
    { icon: Instagram, platform: 'instagram' }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* Top Section - Navigation Links */}
          <div className="flex flex-wrap justify-between items-start mb-8">
            {/* Left Side - Main Navigation */}
            <div className="flex flex-wrap gap-8 mb-6 lg:mb-0">
              {navigationLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={link.action}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
            </div>

            {/* Right Side - CTA Links */}
            <div className="flex gap-6">
              <button 
                onClick={() => alert('Contact page coming soon! Email us at hello@masada.et')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Contact us
              </button>
              <Link 
                href="/tester/signup" 
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Get paid to test
              </Link>
            </div>
          </div>

          {/* Middle Section - Social Media Icons */}
          <div className="flex justify-start gap-4 mb-8">
            {socialIcons.map(({ icon: Icon, platform }) => (
              <button
                key={platform}
                onClick={() => handleSocialClick(platform)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={platform}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section - Legal Links and Copyright */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Left Side - Legal Links */}
            <div className="flex gap-6">
              <button 
                onClick={() => handleLinkClick('Privacy Policy')}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleLinkClick('Terms of Service')}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </button>
            </div>

            {/* Right Side - Copyright */}
            <p className="text-slate-400 text-sm">
              © 2025 Masada. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;