# Custom Fields Test Suite

This directory contains comprehensive unit tests for the custom fields functionality in the Event Management System.

## Test Files

### `custom-fields.test.js`

Tests the backend API functionality for custom fields:

- ✅ Event creation with custom fields
- ✅ Event retrieval with custom fields
- ✅ Event registration with custom fields data
- ✅ Event updates with custom fields
- ✅ Custom fields validation
- ✅ Duplicate registration prevention
- ✅ Document upload integration

### `frontend.test.js`

Tests the frontend JavaScript functionality:

- ✅ Dynamic field population
- ✅ Form field generation
- ✅ Custom field types (text, email, tel, url, textarea)
- ✅ Document upload field generation
- ✅ Form submission with custom data
- ✅ Empty custom fields handling

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npx jest tests/custom-fields.test.js
npx jest tests/frontend.test.js
```

## Test Coverage

The tests cover:

### Backend API Tests

- **Event Creation**: Creating events with and without custom fields
- **Event Retrieval**: Fetching events and verifying custom fields data
- **Event Registration**: User registration with custom field data
- **Event Updates**: Modifying events and their custom fields
- **Validation**: Handling invalid JSON and edge cases
- **Database Integration**: Proper storage and retrieval of custom fields

### Frontend Tests

- **Field Generation**: Creating form fields based on admin configuration
- **Field Types**: Proper HTML input types for different field types
- **Form Submission**: Collecting and formatting custom field data
- **Document Upload**: Conditional document upload field generation
- **Empty States**: Handling events with no custom fields

## Test Data

The tests use sample data including:

- Events with 6 custom fields (Company, Phone, Job Title, Experience, Dietary, LinkedIn)
- Events with no custom fields
- Various field types (text, email, tel, url, textarea)
- Document upload configurations

## Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Test database configured (see `tests/setup.js`)

## Environment Variables

The tests use these environment variables:

- `DATABASE_URL`: Test database connection string
- `NODE_ENV`: Set to 'test' for test environment

## Test Results

Successful test runs will show:

- ✅ All test suites passing
- 📊 Coverage report (when using `--coverage`)
- 🧹 Clean test data cleanup

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Verify test database exists

### Test Failures

- Check console output for specific error messages
- Verify all dependencies are installed
- Ensure test database is clean

### Coverage Issues

- Run `npm run test:coverage` for detailed coverage report
- Check `coverage/` directory for HTML coverage report
