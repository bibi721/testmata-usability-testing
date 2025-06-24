import React from 'react';
import Link from 'next/link';
import { Target, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  const handleSocialClick = (platform: string) => {
    // In a real app, these would link to actual social media profiles
    const urls = {
      twitter: 'https://twitter.com/masadaethiopia',
      linkedin: 'https://linkedin.com/company/masada-ethiopia',
      github: 'https://github.com/masada-ethiopia',
      email: 'mailto:hello@masada.et'
    };
    
    if (platform === 'email') {
      window.location.href = urls.email;
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
            {/* Logo and Description */}
            <div className="max-w-md">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-white">Masada</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Professional usability testing platform for Ethiopian tech companies. 
                Get insights from real Ethiopian users.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-12">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Product</h3>
                <div className="space-y-2">
                  <Link href="/product" className="block text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="block text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    Pricing
                  </Link>
                  <Link href="/tester/signup" className="block text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    Become a Tester
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Company</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => alert('About page coming soon!')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => alert('Contact page coming soon! Email us at hello@masada.et')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    Contact
                  </button>
                  <button 
                    onClick={() => alert('Careers page coming soon!')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    Careers
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Legal</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => alert('Privacy Policy coming soon!')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    Privacy
                  </button>
                  <button 
                    onClick={() => alert('Terms of Service coming soon!')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    Terms
                  </button>
                  <button 
                    onClick={() => alert('Security page coming soon!')}
                    className="block text-sm text-slate-400 hover:text-blue-400 transition-colors text-left"
                  >
                    Security
                  </button>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <button
                onClick={() => handleSocialClick('twitter')}
                className="text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick('linkedin')}
                className="text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick('github')}
                className="text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSocialClick('email')}
                className="text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2025 Masada. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Made in Ethiopia 🇪🇹
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;