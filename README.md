# Lendsqr Frontend Engineer Assessment

## 📋 Project Overview
A Next.js 16 implementation of the Lendsqr Admin Console featuring authentication, user management dashboard, and responsive design with pixel-perfect fidelity to the provided Figma design.

## 📱 Features

### ✅ Completed Requirements

**Three Core Pages:**
- `/login` - Authentication page with email/password login
- `/dashboard/users` - User listing with 500+ records, filtering, pagination, and search
- `/dashboard/users/[id]` - User details page with comprehensive user information and localStorage persistence

**Key Functionalities:**
- **Authentication**: Simple email/password login with localStorage-based session management
- **User Data Management**: 500+ user records loaded from mock api and stored in localStorage 
- **User Listing Page**:
  - Display users in a paginated table
  - Advanced filtering (Organization, Username, Email, Phone, Date, Status)
  - Pagination with customizable items per page (10, 25, 50, 100)
  - Context menu actions (View Details, Blacklist User, Activate User)
  - Status badges (Active, Inactive, Pending, Blacklisted)
  - Responsive table design
  - Loading skeleton states
- **User Details Page**:
  - Comprehensive user information display
  - Tabbed interface (General Details, Documents, Bank Details, Loans, Savings, App & System)
  - User status management (Blacklist/Activate)
  - Data persistence in localStorage
  - Responsive layout
- **Local Storage**: User data and authentication state persistence
- **Mobile Responsive**: Fully responsive across all devices
- **Design Fidelity**: Pixel-perfect implementation matching Figma design

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4 /SCSS
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Custom SVG Icon Components
- **Code Quality**: ESLint + Next.js ESLint Config

## 📁 Project Structure

```
lendsqr/
├── app/
│   ├── assets/
│   │   └── images/
│   │       
│   ├── components/
│   │   ├── AuthGuard.tsx          # Authentication guard component
│   │   ├── DashboardLayout.tsx    # Main dashboard layout with sidebar
│   │   ├── SkeletonLoader.tsx     # Loading skeleton component
│   │   └── IconComponents/        # Custom SVG icon components
│   ├── dashboard/
│   │   └── users/
│   │       ├── page.tsx           # Users listing page
│   │       └── [id]/
│   │           └── page.tsx       # User details page
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── styles/
│   │   └── page.tsx               # css custom variable
│   ├── globals.css                # Global styles and Tailwind config
│   ├── layout.tsx                 # Root layout with AuthGuard
│   └── page.tsx                   # Home page (redirects to login/users)
├── public/                        # Static assets

```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone <https://github.com/OgbajeLeo/lendsqr-fe-test>
cd lendsqr-fe-test
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🔐 Authentication

The application uses a simple authentication system:
- Login credentials: Any email and password combination (validation checks for non-empty values)
- Authentication state is stored in localStorage
- Protected routes are guarded by the `AuthGuard` component
- Users are automatically redirected to `/dashboard/users` after login

## 📊 Data Management

- User data is loaded from `https://api.json-generator.com`, generated (500+ records)
- Data is fetched and cached in localStorage on first load
- All user operations (viewing, filtering) work with localStorage data
- User details are persisted in localStorage for quick access

## 🧩 Key Components

- **AuthGuard**: Protects routes and handles authentication redirects
- **DashboardLayout**: Main layout component with sidebar navigation
- **SkeletonLoader**: Loading state component for better UX
- **IconComponents**: Reusable SVG icon components

## 📝 Notes

- The dashboard overview page (`/dashboard`) is not implemented - users are redirected to `/dashboard/users`
- All navigation items in the sidebar are prepared but only the Users page is functional
- User data is fetched/loaded from a https://api.json-generator.com

## 📄 License

This project is part of the Lendsqr Frontend Engineer Assessment.
