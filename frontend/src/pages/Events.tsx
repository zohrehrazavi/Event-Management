import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { Event } from '../types';
import Layout from '../components/Layout';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventGradient = (index: number) => {
    const gradients = [
      'bg-gradient-event',
      'bg-gradient-sunset', 
      'bg-gradient-ocean',
      'bg-gradient-forest'
    ];
    return gradients[index % gradients.length];
  };

  const getEventIcon = (eventName: string) => {
    // Professional icons instead of emojis
    const icons = [
      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // Clock
      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', // Location
      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', // Calendar
      'M13 10V3L4 14h7v7l9-11h-7z', // Lightning
      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', // Lightbulb
      'M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0V2a1 1 0 011-1h2a1 1 0 011 1v2m-4 0V2a1 1 0 011-1h2a1 1 0 011 1v2M7 4v16a1 1 0 001 1h10a1 1 0 001-1V4M7 4h10m0 0v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4', // Briefcase
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', // Book
      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' // Building
    ];
    const index = eventName.length % icons.length;
    return icons[index];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-event rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading events...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 text-danger-700 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-3 sm:px-6 lg:px-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 px-2 sm:px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-event rounded-full mb-4 sm:mb-6 shadow-glow-purple">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-event bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Our Events
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover our curated collection of professional events and experiences
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Header with Gradient - Future KV Banner Support */}
              <div className={`${getEventGradient(index)} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
                {/* Future KV Banner Image - Currently using gradient as placeholder */}
                {/* {event.banner_image && (
                  <img 
                    src={event.banner_image} 
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                )} */}
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEventIcon(event.name)} />
                    </svg>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                      #{event.id}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">
                    {event.name}
                  </h3>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4 sm:p-6">
                {event.description && (
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-sm sm:text-base">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-3 sm:space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm sm:text-base">{formatDate(event.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm sm:text-base">{event.location}</span>
                  </div>
                </div>
                
                <Link
                  to={`/events/${event.id}`}
                  className="block w-full bg-gradient-event text-white text-center py-3 px-6 rounded-xl font-semibold hover:shadow-glow-purple transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  View Details
                </Link>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-event rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-purple">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">Events will be added soon.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
