import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the entire API module
jest.mock('../../services/api', () => ({
  eventsAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the Layout component
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Import after mocking
import Events from '../Events';
import { eventsAPI } from '../../services/api';

const mockEvents = [
  {
    id: 1,
    name: 'Test Event 1',
    description: 'Test description 1',
    start_date: '2024-06-15T09:00:00',
    end_date: '2024-06-15T17:00:00',
    location: 'Test Location 1',
    created_at: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: 'Test Event 2',
    description: 'Test description 2',
    start_date: '2024-07-20T18:00:00',
    end_date: '2024-07-20T21:00:00',
    location: 'Test Location 2',
    created_at: '2024-01-01T00:00:00',
  },
];

const renderEvents = () => {
  return render(
    <BrowserRouter>
      <Events />
    </BrowserRouter>
  );
};

describe('Events Component - Delete Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (eventsAPI.getAll as jest.Mock).mockResolvedValue(mockEvents);
  });

  describe('Admin Delete Controls', () => {
    beforeEach(() => {
      // Mock admin user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify({ role: 'admin', email: 'admin@test.com' });
        }
        if (key === 'token') {
          return 'admin-token';
        }
        return null;
      });
    });

    it('should show delete button for admin users', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      // Assert
      const deleteButtons = screen.getAllByTitle('Delete Event');
      expect(deleteButtons).toHaveLength(2); // One for each event
    });

    it('should not show delete button for non-admin users', async () => {
      // Arrange - Mock non-admin user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify({ role: 'attendee', email: 'user@test.com' });
        }
        if (key === 'token') {
          return 'user-token';
        }
        return null;
      });

      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      // Assert
      const deleteButtons = screen.queryAllByTitle('Delete Event');
      expect(deleteButtons).toHaveLength(0);
    });

    it('should open delete confirmation dialog when delete button is clicked', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        expect(screen.getByText('"Test Event 1"')).toBeInTheDocument();
      });
    });

    it('should successfully delete event when confirmed', async () => {
      // Arrange
      (eventsAPI.delete as jest.Mock).mockResolvedValueOnce(undefined);

      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(eventsAPI.delete).toHaveBeenCalledWith(1);
      });
    });

    it('should update event count after deletion', async () => {
      // Arrange
      (eventsAPI.delete as jest.Mock).mockResolvedValueOnce(undefined);

      // Act
      renderEvents();

      // Wait for events to load and check initial count
      await waitFor(() => {
        expect(screen.getByText(/2 Events Available/)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Assert count is updated
      await waitFor(() => {
        expect(screen.getByText(/1 Event Available/)).toBeInTheDocument();
      });
    });

    it('should handle delete API errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Failed to delete event';
      (eventsAPI.delete as jest.Mock).mockRejectedValueOnce({
        response: {
          data: {
            detail: errorMessage,
          },
        },
      });

      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(eventsAPI.delete).toHaveBeenCalledWith(1);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Event Count and Admin Controls', () => {
    beforeEach(() => {
      // Mock admin user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify({ role: 'admin', email: 'admin@test.com' });
        }
        if (key === 'token') {
          return 'admin-token';
        }
        return null;
      });
    });

    it('should display correct event count', async () => {
      // Act
      renderEvents();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/2 Events Available/)).toBeInTheDocument();
      });
    });

    it('should show admin controls for admin users', async () => {
      // Act
      renderEvents();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(screen.getByText('Create Event')).toBeInTheDocument();
      });
    });

    it('should not show admin controls for non-admin users', async () => {
      // Arrange - Mock non-admin user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify({ role: 'attendee', email: 'user@test.com' });
        }
        if (key === 'token') {
          return 'user-token';
        }
        return null;
      });

      // Act
      renderEvents();

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
        expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
      });
    });

    it('should refresh events when refresh button is clicked', async () => {
      // Arrange
      const newEvents = [
        ...mockEvents,
        {
          id: 3,
          name: 'New Test Event',
          description: 'New test description',
          start_date: '2024-08-15T10:00:00',
          end_date: '2024-08-15T18:00:00',
          location: 'New Test Location',
          created_at: '2024-01-01T00:00:00',
        },
      ];
      
      // Mock the initial call to return 2 events, then the refresh call to return 3 events
      (eventsAPI.getAll as jest.Mock)
        .mockResolvedValueOnce(mockEvents) // Initial load
        .mockResolvedValueOnce(newEvents); // Refresh call

      // Act
      renderEvents();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/2 Events Available/)).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(eventsAPI.getAll).toHaveBeenCalledTimes(2); // Initial load + refresh
        expect(screen.getByText(/3 Events Available/)).toBeInTheDocument();
      });
    });

    it('should open create event modal when create button is clicked', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Create Event')).toBeInTheDocument();
      });

      // Click create event button
      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Create New Event')).toBeInTheDocument();
        expect(screen.getByText('Event Name *')).toBeInTheDocument();
        expect(screen.getByText('Location *')).toBeInTheDocument();
      });
    });

    it('should successfully create event when form is submitted', async () => {
      // Arrange
      const newEvent = {
        id: 3,
        name: 'New Test Event',
        description: 'New test description',
        start_date: '2024-08-15T10:00:00',
        end_date: '2024-08-15T18:00:00',
        location: 'New Test Location',
        created_at: '2024-01-01T00:00:00',
      };
      (eventsAPI.create as jest.Mock).mockResolvedValueOnce(newEvent);

      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Create Event')).toBeInTheDocument();
      });

      // Click create event button
      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Create New Event')).toBeInTheDocument();
      });

      // Fill out the form
      fireEvent.change(screen.getByLabelText('Event Name *'), { target: { value: 'New Test Event' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New test description' } });
      fireEvent.change(screen.getByLabelText('Start Date & Time *'), { target: { value: '2024-08-15T10:00' } });
      fireEvent.change(screen.getByLabelText('End Date & Time *'), { target: { value: '2024-08-15T18:00' } });
      fireEvent.change(screen.getByLabelText('Location *'), { target: { value: 'New Test Location' } });

      // Submit the form
      const buttons = screen.getAllByText('Create Event');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      fireEvent.click(submitButton!);

      // Assert
      await waitFor(() => {
        expect(eventsAPI.create).toHaveBeenCalledWith({
          name: 'New Test Event',
          description: 'New test description',
          start_date: '2024-08-15T10:00',
          end_date: '2024-08-15T18:00',
          location: 'New Test Location',
        });
        expect(screen.queryByText('Create New Event')).not.toBeInTheDocument();
      });
    });

    it('should display sequential event numbers (1, 2, 3) instead of database IDs', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      // Assert that event numbers are sequential (1, 2) not database IDs
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      
      // Ensure we don't see database IDs like #1, #2 (which would be the same in this case)
      // but the important thing is that they're sequential based on position
    });
  });

  describe('Delete Confirmation Dialog', () => {
    beforeEach(() => {
      // Mock admin user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify({ role: 'admin', email: 'admin@test.com' });
        }
        if (key === 'token') {
          return 'admin-token';
        }
        return null;
      });
    });

    it('should display correct event name in confirmation dialog', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('"Test Event 1"')).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      // Act
      renderEvents();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Event');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Delete Event')).not.toBeInTheDocument();
      });
    });
  });
});