# General Listings Website - Project Instructions

## Project Overview
This project is a comprehensive General Listings Website built with Next.js, designed to provide a platform where users can create, manage, and search for various types of listings.

## Core Features

### Authentication & User Management
1. **Login/Signup System**
   - Email and password authentication
   - OAuth integration (Google, GitHub)
   - Password reset functionality
   - Email verification

2. **User Profile**
   - Profile information display and editing
   - Profile picture upload
   - Activity history
   - Saved listings management

### Listing Management
1. **Create Listings**
   - Multi-step listing creation form
   - Image upload support (multiple images)
   - Category selection
   - Detailed description editor
   - Price and availability settings

2. **Edit Listings**
   - Full editing capabilities for own listings
   - Status updates (active/inactive/sold)
   - Image management

3. **Delete Listings**
   - Soft delete implementation
   - Confirmation process
   - Archive functionality

### Search & Discovery
1. **Search Functionality**
   - Full-text search
   - Category-based filtering
   - Price range filtering
   - Location-based search
   - Advanced filters (condition, date posted, etc.)

2. **Sorting Options**
   - Price (high to low, low to high)
   - Date posted
   - Relevance
   - Distance (if location-based)
   - Popularity

## Technical Stack

### Frontend
- **Next.js 13+** (App Router)
- **React 18+**
- **TypeScript**
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **Lucide Icons** for iconography

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose ODM

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeScript** for type safety

## Implementation Guidelines

### Database Design (MongoDB)
- Implement proper schemas for:
  - Users
  - Listings
  - Categories
  - Reviews/Ratings
  - Messages (if implementing chat)

### Authentication
- Use NextAuth.js for authentication
- Implement JWT token-based authentication
- Secure route protection

### UI/UX Requirements
1. **Design System**
   - Use Shadcn for consistent component design
   - Implement responsive design for all screens
   - Follow accessibility guidelines (WCAG 2.1)

2. **Color Palette**
   - Generate using Shadcn
   - Ensure proper contrast ratios
   - Support dark/light mode

### Performance Optimization
- Implement image optimization
- Use proper caching strategies
- Optimize API routes
- Implement lazy loading

## Documentation
- Next.js documentation: https://nextjs.org/docs  & in app folder /docs/Next.js documentation
- Project documentation: /docs/
- API documentation: /docs/api
- Component documentation: /docs/components

## Best Practices
1. **Code Quality**
   - Follow TypeScript best practices
   - Maintain consistent code style
   - Write meaningful comments
   - Create reusable components

2. **Security**
   - Implement input validation
   - Use proper authentication
   - Secure API endpoints
   - Handle file uploads securely

3. **Testing**
   - Write unit tests for components
   - Implement integration tests
   - Add E2E tests for critical flows

## Deployment
- Set up CI/CD pipeline
- Configure environment variables
- Implement monitoring and logging
- Set up error tracking

## Additional Considerations
- Implement proper error handling
- Add loading states and skeletons
- Implement proper form validation
- Add proper SEO optimization
- Ensure mobile responsiveness