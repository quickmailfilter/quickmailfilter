import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { ShieldCheck, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-2 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-[#E5E7EB] sm:border-white/20 shadow-lg rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1E3A8A] truncate">VerifyMail</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8" data-aos="fade-down" data-aos-delay="200">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-[#2563EB] transition-colors relative group text-sm font-medium">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
                </Link>
                <Link to="/pricing" className="text-gray-600 hover:text-[#2563EB] transition-colors relative group text-sm font-medium">
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
                </Link>
                <Link to="/docs" className="text-gray-600 hover:text-[#2563EB] transition-colors relative group text-sm font-medium">
                  Docs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-[#2563EB] hover:bg-blue-50 transition-all text-sm font-medium">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#2563EB] hover:bg-[#1E40AF] shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-sm font-medium">Start Free Trial</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-600 hover:text-[#2563EB] transition-colors relative group text-sm font-medium">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full" />
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.plan} Plan</div>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="border-[#E5E7EB] h-9">
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100/50 bg-white/10 backdrop-blur-md rounded-b-xl overflow-hidden">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-1 px-2">
                <Link to="/" className="px-3 py-2 text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/pricing" className="px-3 py-2 text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link to="/docs" className="px-3 py-2 text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Docs
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-4 px-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-[#E5E7EB]">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#2563EB] hover:bg-[#1E40AF]">Sign Up</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-2">
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="px-3 py-2 text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <div className="px-4 py-3 bg-gray-50 rounded-xl my-2">
                  <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.plan} Plan</div>
                </div>
                <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="outline" className="mx-2 mt-2 border-red-200 text-red-600 hover:bg-red-50">
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
