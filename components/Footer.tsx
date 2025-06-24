import React from 'react';
import Link from 'next/link';
import { Target, Twitter, Linkedin, Github, Mail, Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const handleSocialClick = (platform: string) => {
    // In a real app, these would link to actual social media profiles
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
  };

  const handleLinkClick = (section: string) => {
    // Mock navigation for footer links
    alert(`${section} page coming soon!`);
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* Top Section - Navigation Links */}
          <div className="flex flex-wrap justify-between items-start mb-8">
            {/* Left Side - Main Navigation */}
            <div className="flex flex-wrap gap-8 mb-6 lg:mb-0">
              <button 
                onClick={() => handleLinkClick('Blog')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Blog
              </button>
              <button 
                onClick={() => handleLinkClick('Knowledge Hub')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Knowledge Hub
              </button>
              <button 
                onClick={() => handleLinkClick('Partners')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Partners
              </button>
              <button 
                onClick={() => handleLinkClick('Education')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Education
              </button>
              <button 
                onClick={() => handleLinkClick('FAQ')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                FAQ
              </button>
              <button 
                onClick={() => handleLinkClick('Company')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Company
              </button>
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
              <button 
                onClick={() => handleLinkClick('Webinars')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Webinars
              </button>
              <button 
                onClick={() => handleLinkClick('Resources')}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Resources
              </button>
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
            <button
              onClick={() => handleSocialClick('facebook')}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSocialClick('twitter')}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSocialClick('linkedin')}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSocialClick('youtube')}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSocialClick('instagram')}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </button>
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