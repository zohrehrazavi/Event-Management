import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-event rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-sunset rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-ocean rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      </div>

      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link 
                to="/events" 
                className="flex items-center space-x-1 sm:space-x-2 group min-w-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-event rounded-lg flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-purple/50 transition-all duration-300 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-event bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 truncate">
                  EventHub
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Events link is always visible since it's public */}
              <Link
                to="/events"
                className="relative px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 group"
              >
                <span className="relative z-10">Events</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/profile"
                      className="relative px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-event rounded-lg hover:shadow-glow-purple transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Admin Profile</span>
                      <span className="sm:hidden">Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all duration-200 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="relative px-3 sm:px-4 lg:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-sunset rounded-lg hover:shadow-glow transform hover:scale-105 transition-all duration-200"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="relative z-10 max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
