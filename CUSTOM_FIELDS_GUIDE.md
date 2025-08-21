# Custom Fields Feature Guide

## Overview

The Event Management System now supports **dynamic custom fields** for event registration. This feature allows administrators to create different registration forms for each event, collecting specific information from attendees based on the event's requirements.

## How It Works

### 1. Admin Side - Creating Custom Fields

**Location**: Admin Dashboard → Create/Edit Event → Custom Registration Fields section

**Available Field Types**:

- **Text**: Single line text input
- **Email**: Email address input with validation
- **Phone**: Telephone number input
- **URL**: Website URL input with validation
- **Textarea**: Multi-line text input for longer responses

**Example Custom Fields**:

```
Company Name (text)
Phone Number (tel)
Job Title (text)
Years of Experience (text)
Dietary Requirements (textarea)
LinkedIn Profile (url)
```

### 2. End User Side - Dynamic Registration Form

When users visit an event page, they will see:

- **Standard fields**: Full Name, Email Address, Position
- **Custom fields**: Only the fields that the admin created for that specific event
- **Document upload**: If enabled by admin

## Implementation Details

### Database Schema

**Events Table**:

```sql
custom_fields JSONB DEFAULT '{}'
```

**Attendees Table**:

```sql
custom_data JSONB DEFAULT '{}'
```

### API Endpoints

**Get Single Event**:

```
GET /api/events/:id
```

Returns event data including `custom_fields` object.

**Register for Event**:

```
POST /api/events/:id/register
```

Accepts `custom_data` as JSON string containing custom field values.

### Frontend Implementation

**Event Page JavaScript** (`event-page.js`):

- Loads event data including custom fields
- Dynamically generates form fields based on `custom_fields` object
- Handles form submission with custom field data
- Provides proper validation and user feedback

**Admin Event Manager** (`event-manager.js`):

- Allows adding/removing custom fields
- Supports different field types
- Saves custom fields as JSON to database

## Examples

### Event with Custom Fields (Tech Conference)

**Admin Configuration**:

```json
{
  "Company Name": "text",
  "Phone Number": "tel",
  "Job Title": "text",
  "Years of Experience": "text",
  "Dietary Requirements": "textarea",
  "LinkedIn Profile": "url"
}
```

**User Registration Form**:

- Full Name \*
- Email Address \*
- Position
- Company Name
- Phone Number
- Job Title
- Years of Experience
- Dietary Requirements
- LinkedIn Profile
- Upload Documents (Optional)

### Event without Custom Fields (Simple Meetup)

**Admin Configuration**:

```json
{}
```

**User Registration Form**:

- Full Name \*
- Email Address \*
- Position
- Upload Documents (Optional)

## Testing the Feature

### 1. Create Test Events

Run the provided scripts to create test events:

```bash
# Create event with custom fields
node scripts/create-test-event.js

# Create simple event without custom fields
node scripts/create-simple-event.js
```

### 2. View Events

- **Tech Conference**: http://localhost:3000/event.html/5
- **Networking Meetup**: http://localhost:3000/event.html/6

### 3. Admin Panel

Access the admin panel to create/edit events with custom fields:

- URL: http://localhost:3000/admin.html
- Username: `admin`
- Password: `admin123`

## Benefits

1. **Flexibility**: Each event can have different registration requirements
2. **User Experience**: Users only see relevant fields for each event
3. **Data Collection**: Collect specific information needed for each event type
4. **Scalability**: Easy to add new field types in the future

## Future Enhancements

Potential improvements for the custom fields feature:

1. **Field Validation**: Add required/optional flags for custom fields
2. **Field Options**: Support dropdown/select fields with predefined options
3. **Conditional Fields**: Show/hide fields based on other field values
4. **Field Templates**: Predefined field sets for common event types
5. **Export Data**: Export registration data including custom fields

## Troubleshooting

### Common Issues

1. **Custom fields not showing**:

   - Check browser console for JavaScript errors
   - Verify event data is loading correctly
   - Ensure `custom_fields` is not empty in database

2. **Form submission fails**:

   - Check server logs for errors
   - Verify custom field data is being sent correctly
   - Ensure database schema supports JSONB fields

3. **Admin can't save custom fields**:
   - Check admin authentication
   - Verify form data is being sent correctly
   - Check server logs for validation errors

### Debug Mode

The system includes debug logging. Check browser console for messages starting with `🔍 DEBUG:` to troubleshoot issues.
