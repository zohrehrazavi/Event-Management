import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { Event } from '../types';
import Layout from '../components/Layout';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.role === 'admin');

    fetchEvents();
  }, []);

  // Memoized date formatting function
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Memoized theme object - no need to recreate on every render
  const eventTheme = useMemo(() => ({
    primary: 'bg-gradient-event',
    secondary: 'bg-gradient-sunset',
    accent: 'bg-gradient-ocean',
    text: 'text-white',
    button: 'bg-gradient-event hover:shadow-glow-purple'
  }), []);

  // Memoized icon path - consistent for all events
  const eventIcon = useMemo(() => 
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    []
  );

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event);
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh events');
    }
  }, []);

  // Debounced refresh to prevent excessive API calls
  const debouncedRefresh = useCallback(() => {
    const timeoutId = setTimeout(refreshEvents, 300);
    return () => clearTimeout(timeoutId);
  }, [refreshEvents]);

  // Use debounced refresh for the refresh button
  const handleRefreshClick = useCallback(() => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  const handleDeleteEvent = useCallback(async (eventId: number) => {
    try {
      await eventsAPI.delete(eventId);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete event');
    }
  }, []);

  const handleUpdateEvent = useCallback(async (updatedEvent: Event) => {
    try {
      const result = await eventsAPI.update(updatedEvent.id, updatedEvent);
      setEvents(prevEvents => prevEvents.map(event => event.id === updatedEvent.id ? result : event));
      setEditingEvent(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update event');
    }
  }, []);


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
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-4">
            Discover our curated collection of professional events and experiences
          </p>
          {/* Dynamic Event Count and Admin Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
              <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {events.length} {events.length === 1 ? 'Event' : 'Events'} Available
              </span>
            </div>
            
            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                             <button
               onClick={handleRefreshClick}
               className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200"
               title="Refresh Events"
             >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-event rounded-full shadow-lg hover:shadow-glow-purple transition-all duration-200"
                  title="Create New Event"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => {
            return (
            <div
              key={event.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 animate-slide-up flex flex-col h-full border border-gray-100 hover:border-gray-200 hover-optimized"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Header - Ready for KV Banner Support */}
              <div className={`${eventTheme.primary} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eventIcon} />
                    </svg>
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                            title="Edit Event"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(event.id);
                            }}
                            className="p-1.5 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors duration-200"
                            title="Delete Event"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                        #{index + 1}
                      </div>
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
                  className="group/btn relative block w-full overflow-hidden rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-shadow duration-200 shadow-lg hover:shadow-glow-purple text-sm sm:text-base"
                >
                  {/* Unified theme button background */}
                  <div className={`absolute inset-0 ${eventTheme.button} transition-all duration-300`}></div>
                  
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

        {/* Edit Event Modal */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onSave={handleUpdateEvent}
            onCancel={() => setEditingEvent(null)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <DeleteConfirmDialog
            eventId={showDeleteConfirm}
            eventName={events.find(e => e.id === showDeleteConfirm)?.name || ''}
            onConfirm={handleDeleteEvent}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateEventModal
            onSave={async (newEvent) => {
              try {
                const createdEvent = await eventsAPI.create(newEvent);
                setEvents([...events, createdEvent]);
                setShowCreateModal(false);
              } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to create event');
              }
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </Layout>
  );
};

// Edit Event Modal Component
interface EditEventModalProps {
  event: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    location: event.location,
    start_date: event.start_date.split('T')[0] + 'T' + event.start_date.split('T')[1].substring(0, 5),
    end_date: event.end_date.split('T')[0] + 'T' + event.end_date.split('T')[1].substring(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...event,
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-event text-white rounded-lg hover:shadow-glow-purple transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Dialog Component
interface DeleteConfirmDialogProps {
  eventId: number;
  eventName: string;
  onConfirm: (eventId: number) => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ eventId, eventName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Event</h2>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <strong>"{eventName}"</strong>? This action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(eventId)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Event Modal Component
interface CreateEventModalProps {
  onSave: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.start_date && formData.end_date && formData.location) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event location"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-event text-white rounded-lg hover:shadow-glow-purple transition-all duration-200"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Memoized EventCard component to prevent unnecessary re-renders
const EventCard = memo<{
  event: Event;
  index: number;
  isAdmin: boolean;
  eventTheme: any;
  eventIcon: string;
  formatDate: (date: string) => string;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
}>(({ event, index, isAdmin, eventTheme, eventIcon, formatDate, onEdit, onDelete }) => {
  return (
    <div
      key={event.id}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up flex flex-col h-full border border-gray-100 hover:border-gray-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Event Header */}
      <div className={`${eventTheme.primary} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eventIcon} />
            </svg>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                    title="Edit Event"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event.id);
                    }}
                    className="p-1.5 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors duration-200"
                    title="Delete Event"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                #{index + 1}
              </div>
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

        <div className="mt-auto">
          <Link
            to={`/events/${event.id}`}
            className={`w-full inline-flex items-center justify-center px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-xl text-white ${eventTheme.button} transition-all duration-200 transform hover:scale-105 shadow-lg`}
          >
            <span>View Details</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default Events;
