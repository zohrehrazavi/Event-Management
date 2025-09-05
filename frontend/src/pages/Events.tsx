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

  // Unified design system for all events - matches navigation styling
  // TODO: When admin panel is implemented, this will support:
  // - event.theme (predefined theme names)
  // - event.brand_color (custom hex colors)
  // - event.banner_image (KV banner images)
  // - event.category (for icon selection)
  const getEventTheme = (event: Event) => {
    // Using the same gradient system as the navigation for consistency
    return {
      primary: 'bg-gradient-event',
      secondary: 'bg-gradient-sunset',
      accent: 'bg-gradient-ocean',
      text: 'text-white',
      button: 'bg-gradient-event hover:shadow-glow-purple'
    };
  };

  const getEventIcon = (event: Event) => {
    // Future: This will be event.icon or determined by event.category
    // For now, use a consistent calendar icon for all events
    return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-event rounded-full animate-spin mx-auto mb-4 shadow-glow-purple"></div>
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
          {events.map((event, index) => {
            const theme = getEventTheme(event);
            return (
            <div
              key={event.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up flex flex-col h-full border border-gray-100 hover:border-gray-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Header - Ready for KV Banner Support */}
              <div className={`${theme.primary} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
                {/* Future KV Banner Image Support */}
                {/* {event.banner_image && (
                  <img 
                    src={event.banner_image} 
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                )} */}
                
                {/* Subtle decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEventIcon(event)} />
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
              <div className="p-4 sm:p-6 flex flex-col h-full">
                {event.description && (
                  <p className="text-gray-600 mb-4 sm:mb-6 line-clamp-3 leading-relaxed text-sm sm:text-base flex-grow">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 text-gray-700 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow duration-200">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm sm:text-base group-hover/item:text-primary-700 transition-colors duration-200">{formatDate(event.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-700 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow duration-200">
                      <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm sm:text-base group-hover/item:text-secondary-700 transition-colors duration-200">{event.location}</span>
                  </div>
                </div>
                
                <Link
                  to={`/events/${event.id}`}
                  className="group/btn relative block w-full overflow-hidden rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-glow-purple text-sm sm:text-base"
                >
                  {/* Unified theme button background */}
                  <div className={`absolute inset-0 ${theme.button} transition-all duration-300`}></div>
                  
                  {/* Subtle overlay for better text contrast */}
                  <div className="absolute inset-0 bg-black/10 group-hover/btn:bg-black/5 transition-colors duration-300"></div>
                  
                  {/* Button content */}
                  <div className="relative z-10 flex items-center justify-center space-x-2 py-3 px-6 text-white">
                    <span>View Details</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </Link>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            );
          })}
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
