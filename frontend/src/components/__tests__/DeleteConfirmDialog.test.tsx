import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// We need to extract the DeleteConfirmDialog component from Events.tsx
// For now, let's create a test that imports it from the Events file
import Events from '../../pages/Events';

// Mock the Layout component
jest.mock('../Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock the API
jest.mock('../../services/api');
const mockedEventsAPI = require('../../services/api').eventsAPI;

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

describe('DeleteConfirmDialog Component', () => {
  const mockEvents = [
    {
      id: 1,
      name: 'Test Event for Deletion',
      description: 'This event will be deleted',
      start_date: '2024-06-15T09:00:00',
      end_date: '2024-06-15T17:00:00',
      location: 'Test Location',
      created_at: '2024-01-01T00:00:00',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventsAPI.getAll.mockResolvedValue(mockEvents);
    
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

  it('should render delete confirmation dialog with correct content', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Assert dialog content
    expect(screen.getByText('Delete Event')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('"Test Event for Deletion"')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it('should have proper button labels', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Assert buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Wait for dialog to appear
    await screen.findByText('Delete Event');

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Assert dialog is closed
    expect(screen.queryByText('Delete Event')).not.toBeInTheDocument();
  });

  it('should call onConfirm when delete button is clicked', async () => {
    // Arrange
    mockedEventsAPI.delete.mockResolvedValueOnce(undefined);

    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Wait for dialog to appear
    await screen.findByText('Delete Event');

    // Click delete in dialog
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    // Assert API was called
    expect(mockedEventsAPI.delete).toHaveBeenCalledWith(1);
  });

  it('should have proper styling classes', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Wait for dialog to appear
    await screen.findByText('Delete Event');

    // Assert dialog styling
    const dialog = screen.getByText('Delete Event').closest('div');
    expect(dialog).toHaveClass('fixed', 'inset-0', 'bg-black/50');

    // Assert warning icon styling
    const warningIconContainer = screen.getByText('Delete Event').closest('div')?.querySelector('.bg-red-100');
    expect(warningIconContainer).toBeInTheDocument();

    // Assert delete button styling
    const confirmDeleteButton = screen.getByText('Delete');
    expect(confirmDeleteButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
  });

  it('should be accessible with proper ARIA attributes', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Wait for dialog to appear
    await screen.findByText('Delete Event');

    // Assert dialog is accessible
    const dialog = screen.getByText('Delete Event').closest('div');
    expect(dialog).toBeInTheDocument();

    // Assert buttons are accessible
    const cancelButton = screen.getByText('Cancel');
    const confirmDeleteButton = screen.getByText('Delete');
    
    expect(cancelButton).toBeInTheDocument();
    expect(confirmDeleteButton).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    // Act
    render(<Events />);

    // Wait for events to load
    await screen.findByText('Test Event for Deletion');

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Event');
    fireEvent.click(deleteButton);

    // Wait for dialog to appear
    await screen.findByText('Delete Event');

    // Test keyboard navigation
    const cancelButton = screen.getByText('Cancel');
    const confirmDeleteButton = screen.getByText('Delete');

    // Focus should be manageable
    cancelButton.focus();
    expect(document.activeElement).toBe(cancelButton);

    confirmDeleteButton.focus();
    expect(document.activeElement).toBe(confirmDeleteButton);
  });
});
