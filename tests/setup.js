// Test setup file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
// Use the same database as development for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/event_management';

// Global test timeout
jest.setTimeout(10000); 