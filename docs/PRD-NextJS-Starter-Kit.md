# Product Requirements Document: NextJS Starter Kit

## 1. Elevator Pitch

A comprehensive NextJS starter kit that provides developers with a production-ready foundation for building web applications. It includes modern authentication with OTP email verification, user role management, database integration with Neon PostgreSQL, and pre-configured UI components using shadcn/ui. This starter kit eliminates the initial setup complexity and provides a solid foundation with admin and client dashboards, allowing developers to focus on building their unique features rather than reinventing common functionality.

## 2. Who is this app for

**Primary Users:**
- **Full-stack developers** who want to quickly bootstrap new NextJS projects
- **Development teams** looking for a standardized starter template
- **Indie developers** building SaaS applications who need user management
- **Agencies** that need a reliable foundation for client projects

**Secondary Users:**
- **Backend developers** learning frontend development
- **Students** studying modern web development stack

## 3. Functional Requirements

### Core Features
- **Authentication System**: OTP-based email authentication using Auth.js V5
- **Email Service**: 6-digit OTP codes sent via Resend
- **User Management**: User registration, login, and role assignment
- **Role-Based Access**: Admin and Client roles with different permissions
- **Database Integration**: PostgreSQL with Neon cloud database
- **UI Components**: Pre-configured shadcn/ui component library
- **Responsive Design**: Mobile-first approach with modern UI patterns

### Technical Requirements
- **Framework**: NextJS (latest stable version)
- **Database**: PostgreSQL via Neon
- **Authentication**: Auth.js V5 with OTP strategy
- **Email**: Resend for OTP delivery
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS (included with shadcn)

## 4. User Stories

### Authentication Flow
- **As a new user**, I want to enter my email address so I can receive a login code
- **As a user**, I want to receive a 6-digit OTP code via email so I can authenticate securely
- **As a user**, I want to enter the OTP code to complete authentication
- **As a user**, I want to be redirected to the appropriate dashboard based on my role

### Admin User Stories
- **As an admin**, I want to access an admin dashboard with a sidebar navigation
- **As an admin**, I want to manage users and their roles
- **As an admin**, I want to view system analytics and user activity

### Client User Stories
- **As a client**, I want to access a client dashboard with a sidebar navigation
- **As a client**, I want to view my profile and account settings
- **As a client**, I want to access client-specific features and content

### Developer User Stories
- **As a developer**, I want to clone this starter kit and have a working application
- **As a developer**, I want clear documentation on how to configure and extend the starter kit
- **As a developer**, I want environment variable examples for easy setup

## 5. User Interface

### Login Page
- **Clean, centered layout** with email input field
- **Progressive form**: Email input transforms to OTP input after submission
- **Visual feedback** for email validation and OTP verification
- **Loading states** during authentication process
- **Error handling** for invalid emails or OTP codes

### Admin Dashboard
- **Sidebar navigation** using shadcn/ui components
- **Main content area** with admin-specific features
- **User management section** with role assignment capabilities
- **System overview** with key metrics and analytics
- **Profile management** in header or sidebar

### Client Dashboard
- **Sidebar navigation** using shadcn/ui components
- **Main content area** with client-specific features
- **Personal profile section** for account management
- **Feature-specific areas** based on client permissions
- **Consistent branding** with admin dashboard but different content

### Responsive Design
- **Mobile-first approach** with collapsible sidebar
- **Tablet optimization** with adjusted layouts
- **Desktop experience** with full sidebar navigation
- **Consistent theming** across all screen sizes