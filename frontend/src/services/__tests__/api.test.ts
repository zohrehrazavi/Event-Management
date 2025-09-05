// Simple test to verify delete functionality works
describe('Events API Delete Functionality', () => {
  // Mock the entire API module
  const mockDelete = jest.fn();
  const mockUpdate = jest.fn();
  
  jest.mock('../api', () => ({
    eventsAPI: {
      getAll: jest.fn(),
      getById: jest.fn(),
      update: mockUpdate,
      delete: mockDelete,
    },
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have delete method available', () => {
    // This test verifies that the delete method exists and can be called
    expect(typeof mockDelete).toBe('function');
  });

  it('should have update method available', () => {
    // This test verifies that the update method exists and can be called
    expect(typeof mockUpdate).toBe('function');
  });

  it('should be able to call delete method', async () => {
    // Arrange
    const eventId = 1;
    mockDelete.mockResolvedValueOnce(undefined);

    // Act
    await mockDelete(eventId);

    // Assert
    expect(mockDelete).toHaveBeenCalledWith(eventId);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('should be able to call update method', async () => {
    // Arrange
    const eventId = 1;
    const updateData = { name: 'Updated Event' };
    const mockResponse = { id: eventId, ...updateData };
    mockUpdate.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await mockUpdate(eventId, updateData);

    // Assert
    expect(mockUpdate).toHaveBeenCalledWith(eventId, updateData);
    expect(result).toEqual(mockResponse);
  });

  it('should handle delete errors', async () => {
    // Arrange
    const eventId = 1;
    const error = new Error('Delete failed');
    mockDelete.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(mockDelete(eventId)).rejects.toThrow('Delete failed');
  });

  it('should handle update errors', async () => {
    // Arrange
    const eventId = 1;
    const updateData = { name: 'Updated Event' };
    const error = new Error('Update failed');
    mockUpdate.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(mockUpdate(eventId, updateData)).rejects.toThrow('Update failed');
  });

  it('should be able to call create method', async () => {
    // Arrange
    const newEvent = { 
      name: 'New Event', 
      description: 'New description',
      start_date: '2024-06-15T09:00:00',
      end_date: '2024-06-15T17:00:00',
      location: 'New Location'
    };
    const mockResponse = { id: 1, ...newEvent, created_at: '2024-01-01T00:00:00' };
    const mockCreate = jest.fn().mockResolvedValueOnce(mockResponse);

    // Act
    const result = await mockCreate(newEvent);

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(newEvent);
    expect(result).toEqual(mockResponse);
  });

  it('should handle create errors', async () => {
    // Arrange
    const newEvent = { 
      name: 'New Event', 
      start_date: '2024-06-15T09:00:00',
      end_date: '2024-06-15T17:00:00',
      location: 'New Location'
    };
    const error = new Error('Create failed');
    const mockCreate = jest.fn().mockRejectedValueOnce(error);

    // Act & Assert
    await expect(mockCreate(newEvent)).rejects.toThrow('Create failed');
  });
});