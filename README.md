# EventHub - Event Management Dashboard

A modern, sleek event management platform built with Node.js, Express, PostgreSQL, and vanilla HTML/CSS/JavaScript. This platform features **dynamic custom fields** that allow administrators to create tailored registration forms for each event, while providing comprehensive event management capabilities.

## ⚠️ **CURRENT STATUS: WORK IN PROGRESS**

**This project is actively being developed and contains known bugs that need to be addressed.**

### 🔧 **Known Issues & Bugs:**

- Frontend form submission errors (500 Internal Server Error)
- Browser cache issues causing inconsistent behavior
- Some UI elements not properly responsive
- File upload validation needs improvement
- Admin dashboard loading issues
- Event creation form validation bugs

### ✅ **What's Working:**

- Backend API endpoints (tested via curl)
- Database schema and operations
- Custom fields functionality
- Registration system (API level)
- Unit tests (39 tests passing)
- Flexible database schema

### 🚧 **In Progress:**

- Frontend bug fixes
- UI/UX improvements
- Error handling enhancements
- Performance optimizations

## 🌟 **NEW: Dynamic Custom Fields Feature**

**EventHub now supports fully customizable registration forms!** Administrators can define custom data fields for each event, and end-users will only see those specific fields during registration. This makes EventHub perfect for events with different requirements - from simple meetups to complex professional conferences.

### ✨ **Custom Fields Capabilities:**

- **Dynamic Form Generation**: Create registration forms on-the-fly
- **Multiple Field Types**: Text, Email, Phone, URL, Textarea, **File Upload**
- **Upload Field Configuration**: Set max file size (1-50MB) and required/optional
- **Conditional Document Upload**: Enable/disable file uploads per event
- **Flexible Configuration**: Set file types, sizes, and limits
- **Real-time Validation**: Client and server-side validation
- **Data Persistence**: Store custom field data in JSON format

## 🚀 Features

### For Users

- **Event Discovery**: Browse and discover upcoming events
- **Easy Registration**: Simple registration process with personal information
- **Document Upload**: Upload supporting documents and images
- **Real-time Updates**: See attendee counts and event status
- **Responsive Design**: Works seamlessly on all devices

### For Administrators

- **Event Management**: Create, edit, and manage events
- **Dynamic Custom Fields**: Create tailored registration forms for each event
- **Attendee Analytics**: View detailed attendee information and statistics
- **Vendor Management**: Manage vendors for each event
- **Event Branding**: Customize event KV (Key Visual) for each event
- **Dashboard Analytics**: Comprehensive analytics and reporting
- **Document Upload Control**: Configure file upload settings per event

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with JSONB support
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **File Upload**: Multer with configurable settings
- **Testing**: Jest, Supertest, JSDOM
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd event-management-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/event_management
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-super-secret-session-key
   ```

4. **Set up PostgreSQL database**

   ```bash
   # Create database
   createdb event_management

   # Or using psql
   psql -U postgres
   CREATE DATABASE event_management;
   ```

5. **Initialize the database**

   ```bash
   npm run init-db
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Run tests (optional)**

   ```bash
   # Run all tests
   npm test

   # Run tests with coverage
   npm run test:coverage
   ```

8. **Access the application**
   - User Interface: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## 🗄️ Database Schema

### Events Table

- `id`: Primary key
- `title`: Event title
- `description`: Event description
- `event_date`: Event date
- `event_time`: Event time
- `location`: Event location
- `max_attendees`: Maximum attendees allowed
- `current_attendees`: Current number of attendees
- `event_kv`: Event key visual URL
- `custom_fields`: JSONB object for dynamic custom form fields
- `allow_documents`: Boolean for document upload enablement
- `allowed_file_types`: String for allowed file extensions
- `max_file_size`: Integer for maximum file size in MB
- `max_files`: Integer for maximum number of files
- `created_at`: Creation timestamp

### Attendees Table

- `id`: Primary key
- `event_id`: Foreign key to events
- `first_name`: Attendee first name
- `last_name`: Attendee last name
- `email`: Attendee email
- `phone`: Phone number
- `company`: Company name
- `position`: Job position
- `custom_data`: JSON object for custom field data
- `documents`: Array of uploaded document filenames
- `registration_date`: Registration timestamp

### Vendors Table

- `id`: Primary key
- `event_id`: Foreign key to events
- `name`: Vendor name
- `description`: Vendor description
- `contact_person`: Contact person name
- `contact_email`: Contact email
- `contact_phone`: Contact phone
- `booth_number`: Booth number
- `services`: Array of services offered
- `created_at`: Creation timestamp

## 🚀 Deployment on Railway

1. **Connect your repository to Railway**

   - Go to [Railway.app](https://railway.app)
   - Create a new project
   - Connect your GitHub repository

2. **Set up environment variables**

   - Add `DATABASE_URL` (Railway will provide PostgreSQL)
   - Add `SESSION_SECRET`
   - Add `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically detect the Node.js project
   - The `railway.json` file provides deployment configuration
   - Your app will be deployed and accessible via Railway's domain

## 📁 Project Structure

```
event-management-dashboard/
├── public/                 # Static files
│   ├── index.html         # User-facing homepage
│   ├── event.html         # Event details page
│   ├── admin.html         # Admin dashboard
│   ├── event-manager.html # Event creation/editing page
│   ├── styles.css         # Main styles
│   ├── event-page.css     # Event page styles
│   ├── admin-styles.css   # Admin styles
│   ├── script.js          # Main JavaScript
│   ├── event-page.js      # Event page JavaScript
│   ├── event-manager.js   # Event manager JavaScript
│   └── admin-script.js    # Admin JavaScript
├── tests/                 # Test suite
│   ├── unit.test.js       # Unit tests for custom fields
│   ├── frontend.test.js   # Frontend functionality tests
│   ├── custom-fields.test.js # Integration tests
│   ├── setup.js           # Test environment setup
│   └── README.md          # Test documentation
├── scripts/               # Database scripts
│   ├── init-database.js   # Database initialization
│   └── reset-database.js  # Database reset
├── uploads/               # File uploads directory
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── jest.config.js         # Jest configuration
├── railway.json           # Railway deployment config
├── env.example            # Environment variables example
├── CUSTOM_FIELDS_GUIDE.md # Custom fields documentation
└── README.md              # This file
```

## 🔧 API Endpoints

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event with custom fields
- `POST /api/admin/events` - Create new event with custom fields
- `PUT /api/admin/events/:id` - Update event and custom fields
- `POST /api/events/:id/register` - Register for event with custom data

### Attendees

- `GET /api/events/:id/attendees` - Get event attendees
- `GET /api/attendees` - Get all attendees

### Vendors

- `GET /api/events/:id/vendors` - Get event vendors
- `POST /api/events/:id/vendors` - Add vendor to event

### Admin

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/events` - Get all events for admin
- `GET /api/admin/attendees` - Get all attendees for admin

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Visual feedback for user actions
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **File Upload Validation**: Type and size restrictions
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Session-based security
- **Rate Limiting**: Built-in protection against abuse

## 🧪 Testing

EventHub includes a comprehensive test suite for the custom fields functionality:

### Test Coverage

- **Unit Tests**: Field validation, data processing, HTML generation
- **Frontend Tests**: Dynamic form generation, user interactions
- **Integration Tests**: API endpoints, database operations

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npx jest tests/unit.test.js
npx jest tests/frontend.test.js
```

### Test Results

- ✅ **17 tests passing**
- ✅ **100% test success rate**
- ✅ **Comprehensive coverage** of custom fields functionality including upload fields

## 🚀 Future Enhancements

- [ ] Email notifications for registrations
- [ ] QR code generation for event check-in
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Social media integration
- [ ] Mobile app development
- [ ] Advanced custom field types (date, time, select, checkbox)
- [ ] Field validation rules and custom validation
- [ ] Conditional field display based on other field values

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Railway for deployment platform
- PostgreSQL for database
- Express.js community for the excellent framework

## 🐛 **Development Status & Known Issues**

### **Latest Updates (Commit: fb52369)**

- ✅ Fixed database schema mismatch issues
- ✅ Resolved JavaScript errors in registration system
- ✅ Added comprehensive unit tests (39 tests passing)
- ✅ Implemented flexible database schema for custom fields
- ✅ Fixed file upload functionality

### **Current Development Focus**

1. **Frontend Bug Fixes** - Resolving 500 errors in form submissions
2. **UI/UX Improvements** - Better error handling and user feedback
3. **Performance Optimization** - Reducing load times and improving responsiveness
4. **Testing Enhancement** - Adding more comprehensive test coverage

### **Bug Reports & Issues**

If you encounter bugs, please:

1. Check the browser console for JavaScript errors
2. Clear browser cache (Ctrl+Shift+R)
3. Test with different browsers
4. Report issues with detailed error messages

### **Contributing to Bug Fixes**

We welcome contributions! Please:

1. Fork the repository
2. Create a bug fix branch
3. Test your changes thoroughly
4. Submit a pull request with detailed description

---

**Built with ❤️ for event organizers and attendees worldwide**

**⚠️ Note: This is a work-in-progress project with known bugs. Use at your own risk.**
