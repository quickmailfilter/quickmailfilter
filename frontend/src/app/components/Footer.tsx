import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E3A8A]">VerifyMail</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Professional email verification and list cleaning service. Improve deliverability and reduce bounce rates.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#2563EB] text-gray-600 hover:text-white flex items-center justify-center transition-colors hover:scale-110 duration-200">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#2563EB] text-gray-600 hover:text-white flex items-center justify-center transition-colors hover:scale-110 duration-200">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#2563EB] text-gray-600 hover:text-white flex items-center justify-center transition-colors hover:scale-110 duration-200">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center gap-1 group">
                  <span className="w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-2" />
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2026 VerifyMail. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 group cursor-pointer">
            <Mail className="w-4 h-4 group-hover:text-[#2563EB] transition-colors" />
            <a href="mailto:support@verifymail.com" className="hover:text-[#2563EB] transition-colors">
              support@verifymail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
