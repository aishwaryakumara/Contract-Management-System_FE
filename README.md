# Contract Management System - Frontend

## Overview

The Contract Management System frontend is built with Next.js 15, providing an intuitive user interface for managing contracts, documents, and tracking contract lifecycles. The application features a responsive design, real-time updates, and seamless integration with the backend API.

## Technology Stack

### Framework
- Next.js 15.5.4 (React framework with App Router)
- React 19.1.0
- React DOM 19.1.0

### Styling
- Tailwind CSS 4
- PostCSS
- next-themes 0.4.6 (Dark/Light mode support)

### UI Components
- Custom components built with Tailwind CSS
- React Hot Toast 2.6.0 (Toast notifications)
- Recharts 3.2.1 (Data visualization)

### Document Processing
- Mammoth 1.11.0 (DOCX to HTML conversion)

### Development Tools
- ESLint 9 (Code linting)
- Turbopack (Fast bundler)

## Features

### Contract Management
- Contract listing with search and filter
- Contract creation and editing
- Multi-version contract tracking
- Contract renewal workflow
- Activity history timeline

### Document Management
- Document upload (PDF, DOC, DOCX)
- Document preview
- Document download
- Supporting document management

### Data Extraction
- Automated contract data extraction using NLP
- Pre-fill form fields from uploaded documents
- Real-time extraction feedback

### User Experience
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Loading states and error handling
- Dark/Light theme support
- Intuitive navigation

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running (see backend README)

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd contract_management_system_frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
contract_management_system_frontend/
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Home page
│   │   ├── login/
│   │   │   └── page.js         # Login page
│   │   ├── contracts/
│   │   │   ├── page.js         # Contracts listing
│   │   │   ├── new/
│   │   │   │   └── page.js     # Create contract
│   │   │   └── [id]/
│   │   │       └── page.js     # Contract details
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── Navbar.js           # Navigation bar
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/
│   │   ├── api.js              # API client
│   │   └── utils.js            # Utility functions
│   └── hooks/                  # Custom React hooks
├── public/
│   └── assets/                 # Static assets
├── package.json                # Dependencies and scripts
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── .env.local                 # Environment variables
```

## API Integration

The frontend communicates with the backend REST API using the centralized API client (`src/lib/api.js`).

### API Client Features

- Automatic JWT token management
- Request/Response interceptors
- Error handling
- Authentication state management

## Available Scripts

### Development

```bash
npm run dev          # Start development server with Turbopack
```

### Production

```bash
npm run build        # Build for production
npm start            # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API base URL | http://localhost:5000/api |

## Key Pages

### Login Page (`/login`)
- User authentication
- Form validation
- JWT token storage
- Redirect to dashboard on success

### Contracts List (`/contracts`)
- Display all contracts in table format
- Search and filter functionality
- Quick actions (view, renew)
- Pagination support

### Contract Details (`/contracts/[id]`)
- Contract information display
- Document management
- Activity history timeline
- Edit and renew options

### Create Contract (`/contracts/new`)
- Contract creation form
- Document upload
- NLP data extraction
- Form validation

## Styling Guidelines

### Tailwind CSS Classes

The application uses Tailwind CSS for styling. Common patterns:

```javascript
// Card component
<div className="bg-white rounded-lg shadow-md p-6">

// Button primary
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">

// Form input
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
```

### Theme Support

The application supports dark/light themes using `next-themes`:

```javascript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

## Authentication Flow

### Login Process
1. User submits credentials
2. API call to `/api/auth/login`
3. Store JWT token in localStorage
4. Store user data in localStorage
5. Redirect to contracts page

### Protected Routes
- All routes except `/login` require authentication
- Automatic redirect to `/login` if unauthenticated
- Token expiration handling with automatic logout

## Error Handling

### API Errors
- Display toast notifications for errors
- User-friendly error messages
- Automatic retry for network errors

### Form Validation
- Client-side validation before submission
- Real-time validation feedback
- Server-side validation error display

## Development Best Practices

### Component Structure
- Use functional components with hooks
- Separate business logic from UI
- Create reusable components
- Follow Next.js App Router conventions

### State Management
- Use React hooks for local state
- localStorage for authentication state
- API calls for server state

### Code Organization
- Group related components
- Use barrel exports (index.js)
- Consistent naming conventions
- Proper file and folder structure

## Troubleshooting

### Common Issues

#### API Connection Errors
```bash
# Verify backend is running
curl http://localhost:5000/api/contract-types

# Check environment variable
echo $NEXT_PUBLIC_API_URL
```


## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for heavy components
- Turbopack for fast development builds

## Support and Documentation

For additional information:
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- React Documentation: https://react.dev

## License

Proprietary - All Rights Reserved