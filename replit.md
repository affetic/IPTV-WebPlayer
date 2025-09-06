# IPTV Web Player

## Overview

This is a modern IPTV web player application that allows users to connect to Xtream Codes servers and stream live television channels through a web browser. The application provides a clean, intuitive interface for browsing channels by category, searching content, and watching streams with full video player controls including Picture-in-Picture support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React with TypeScript in a single-page application architecture. The UI is built with shadcn/ui components on top of Tailwind CSS for consistent styling and responsive design. React Query handles state management and API caching, while Wouter provides client-side routing. The application follows a component-based architecture with clear separation between UI components, business logic, and data fetching.

### Backend Architecture
The server is an Express.js application with TypeScript support. It implements a RESTful API pattern with middleware for logging, error handling, and request processing. The architecture uses a clean separation of concerns with dedicated route handlers and storage abstraction layers. Session management is handled through memory storage with plans for database integration.

### Data Storage Solutions
The application uses Drizzle ORM configured for PostgreSQL with a schema-first approach. Database migrations are managed through Drizzle Kit, and the schema defines tables for users, Xtream sessions, and channel data. Currently implements in-memory storage as fallback with interface-based design for easy database integration.

### Authentication and Authorization
Authentication is handled through Xtream Codes API integration. The system validates user credentials against the IPTV provider's authentication endpoint and manages session state. No local user authentication is implemented - all authentication flows through the external IPTV service.

### Video Streaming Architecture
The video player supports HLS (HTTP Live Streaming) protocol through dynamically loaded HLS.js library. Stream URLs are proxied through the backend to handle authentication and provide a consistent interface. The player includes standard video controls, error handling, and Picture-in-Picture support.

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: Core React with TypeScript, React Query for state management, React Hook Form for form handling
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables and responsive utilities
- **Routing**: Wouter for lightweight client-side routing
- **HTTP Client**: Axios for API requests with interceptor support

### Backend Dependencies
- **Web Framework**: Express.js with TypeScript support and middleware ecosystem
- **Database**: Drizzle ORM with PostgreSQL dialect, Neon Database as cloud provider
- **Development Tools**: Vite for build tooling, ESBuild for production bundling
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Third-party Services
- **Xtream Codes API**: External IPTV service for authentication and channel data
- **HLS.js**: Dynamically loaded for video streaming support in browsers
- **Neon Database**: Cloud PostgreSQL provider for production data storage

### Development Environment
- **Replit Integration**: Custom plugins for runtime error handling and development cartography
- **Build System**: Vite with React plugin, TypeScript compilation, and asset optimization
- **Code Quality**: TypeScript strict mode with comprehensive type checking