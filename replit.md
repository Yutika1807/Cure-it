# Cure It - Emergency Contacts Application

## Overview

This is a full-stack emergency contacts application called "Cure It" built with React, Express, and PostgreSQL. The application allows users to view location-based emergency contacts for police, medical, fire, and municipal services. It features role-based access control with admin privileges for contact management and user analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Security & User Experience Improvements
- **Removed Admin Email Exposure**: Eliminated admin email display from login and landing pages for security
- **Enhanced Authentication UX**: Added password visibility toggles to all password fields (login and registration)
- **Personalized Welcome Messages**: Implemented first name extraction from emails for friendly greetings
- **Updated User Interface**: All pages now display "Welcome, [FirstName]!" instead of full email addresses

### Deployment Preparation
- **Render Deployment Ready**: Configured for Render.com deployment with PostgreSQL
- **Health Check Endpoint**: Added `/api/health` for service monitoring
- **Production Build**: Verified successful build process and static file serving
- **Environment Configuration**: Database URL and production settings properly configured
- **Docker Support**: Added Dockerfile and .dockerignore for containerized deployment

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and ES modules
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Custom auth service with session-based authentication
- **Session Storage**: PostgreSQL-backed session management

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon Database serverless)
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Core Tables**:
  - `users`: User profiles with role-based access control
  - `sessions`: Session storage for authentication persistence
  - `emergency_contacts`: Emergency service contact information with location data

## Key Components

### Authentication System
- **Custom Auth Service**: Email-based authentication without passwords
- **Role-Based Access**: Admin role for yutikamadwai1828@gmail.com with full management privileges
- **Session Management**: Server-side sessions with automatic expiration
- **Protected Routes**: Route-level protection with role-based access control

### Location Services
- **Browser Geolocation**: HTML5 geolocation API for user position detection
- **Reverse Geocoding**: BigDataCloud API integration for coordinate-to-address conversion
- **Location Filtering**: Emergency contacts filtered by city and state
- **Fallback Location**: Default to Mumbai, Maharashtra for location detection failures

### Emergency Contact Management
- **Service Categories**: Police, Medical, Fire, and Municipal services
- **Contact Information**: Name, designation, facility, phone numbers, email, and address
- **Availability Tracking**: 24/7 or custom availability scheduling
- **Active Status**: Enable/disable contacts without deletion

### Admin Panel
- **Contact Management**: Full CRUD operations for emergency contacts
- **User Analytics**: User registration, login tracking, and location distribution
- **Service Statistics**: Contact counts by service type and location
- **Role Management**: Admin-only access with secure authentication

## Data Flow

1. **User Authentication**: Email-based login creates user session and updates login timestamp
2. **Location Detection**: Browser geolocation → coordinate extraction → reverse geocoding → location storage
3. **Contact Retrieval**: Location-based filtering → service type filtering → search functionality → paginated results
4. **Admin Operations**: Authentication check → role verification → database mutations → cache invalidation

## External Dependencies

### Frontend Libraries
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: TailwindCSS for utility-first styling approach
- **State Management**: TanStack Query for server state synchronization
- **Form Handling**: React Hook Form with Zod for validation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking and validation
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### External APIs
- **Geocoding**: BigDataCloud API for reverse geocoding services
- **Location Services**: Browser geolocation API for position detection

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR for frontend
- **Backend**: tsx with watch mode for automatic TypeScript compilation
- **Database**: Local PostgreSQL with Drizzle migrations

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild for Node.js bundle optimization
- **Database**: Automated migrations with Drizzle Kit
- **Deployment**: Single-command deployment with built assets

### Environment Configuration
- **Database URL**: PostgreSQL connection string (required)
- **Development Mode**: NODE_ENV=development for dev features
- **Replit Integration**: Automatic detection and configuration for Replit environment

### File Structure
- **client/**: React frontend application
- **server/**: Express.js backend API and middleware
- **shared/**: Common TypeScript types and schemas
- **migrations/**: Database migration files generated by Drizzle