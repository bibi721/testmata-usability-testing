import React from 'react';
import Link from 'next/link';
import { Target, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
            {/* Logo and Description */}
            <div className="max-w-md">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-slate-900">Masada</span>
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed">
                Professional usability testing platform for Ethiopian tech companies. 
                Get insights from real Ethiopian users.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-12">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Product</h3>
                <div className="space-y-2">
                  <Link href="/product" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Pricing
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                <div className="space-y-2">
                  <Link href="/about" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    About
                  </Link>
                  <Link href="/contact" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Contact
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
                <div className="space-y-2">
                  <Link href="/privacy" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/terms" className="block text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Terms
                  </Link>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@masada.et"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-slate-500 text-sm">
              © 2025 Masada. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made in Ethiopia 🇪🇹
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;