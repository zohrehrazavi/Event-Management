import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface AdminUser {
  email: string;
  role: string;
  name?: string;
}

const AdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/events');
      return;
    }

    setProfile(user);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-event rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading your profile...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-sm sm:max-w-4xl lg:max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 animate-fade-in">
        {/* Hero Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-event rounded-full mb-4 sm:mb-6 shadow-glow-purple">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-event bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Admin Dashboard
          </h1>
        </div>



        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 lg:mb-12 px-1 sm:px-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 text-center px-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <button
              onClick={() => navigate('/events')}
              className="group bg-gradient-event hover:shadow-glow-purple text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 px-2">View All Events</h3>
                <p className="text-blue-100 text-xs sm:text-sm px-2 leading-relaxed">Browse and monitor all events in the system</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/events/create')}
              className="group bg-gradient-event hover:shadow-glow-purple text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 px-2">Create New Event</h3>
                <p className="text-green-100 text-xs sm:text-sm px-2 leading-relaxed">Add exciting new events to the platform</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="group bg-gradient-event hover:shadow-glow-purple text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1"
            >
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 px-2">Manage Events</h3>
                <p className="text-purple-100 text-xs sm:text-sm px-2 leading-relaxed">Edit, update, and organize existing events</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;
