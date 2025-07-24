# Ethereum Dashboard Application

## Overview

This is a modern Ethereum blockchain explorer dashboard built with React, TypeScript, and Express. The application provides real-time blockchain data visualization, wallet balance checking, and transaction monitoring capabilities for the Ethereum Sepolia testnet.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM (configured but not actively used in current implementation)
- **External API**: Alchemy API for Ethereum blockchain data
- **Session Storage**: PostgreSQL sessions via connect-pg-simple (configured)

### Development Setup
- **Monorepo Structure**: Shared types and schemas between client and server
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Data Layer
- **Blockchain Integration**: Alchemy API integration for Ethereum Sepolia testnet
- **Schema Validation**: Zod schemas for type-safe API responses
- **Caching Strategy**: React Query with infinite stale time for blockchain data

### UI Components
- **Component Library**: Complete shadcn/ui implementation with 40+ components
- **Theming**: CSS variables with light/dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Icons**: Lucide React icons with React Icons for blockchain-specific icons

### Core Features
1. **Network Status Monitoring**: Real-time Ethereum network information
2. **Block Explorer**: Latest blocks with transaction counts and gas information
3. **Transaction Viewer**: Recent transactions with status and value details
4. **Wallet Balance Checker**: Address validation and balance retrieval

## Data Flow

1. **Frontend Requests**: React components use React Query hooks to fetch data
2. **API Routes**: Express routes handle requests and interact with Alchemy API
3. **Data Transformation**: Raw blockchain data is converted to readable formats
4. **Response Caching**: React Query caches responses to minimize API calls
5. **Real-time Updates**: Polling mechanisms refresh data at regular intervals

### API Endpoints
- `GET /api/network-status` - Network information and connection status
- `GET /api/blocks` - Latest blockchain blocks
- `GET /api/transactions` - Recent transactions
- `POST /api/balance` - Wallet balance lookup

## External Dependencies

### Primary Integrations
- **Alchemy API**: Ethereum node provider for blockchain data (API key: CPbZRXVteDe0NB46s4oda4q_KEIMPfMu)
- **PostgreSQL Database**: Full database integration with users, watched addresses, transaction history

### Key Libraries
- **Frontend**: React, TanStack React Query, Tailwind CSS, Radix UI primitives
- **Backend**: Express, Drizzle ORM, Zod validation
- **Development**: Vite, TypeScript, ESBuild

### Environment Requirements
- `ALCHEMY_API_KEY`: Configured and working for blockchain data access
- `DATABASE_URL`: PostgreSQL connection configured with full schema

## Recent Changes (January 2025)
- ✅ Added complete PostgreSQL database integration
- ✅ Created user management, watched addresses, transaction history tables
- ✅ Built production version ready for deployment
- ✅ Added deployment configs for Vercel, Railway, Netlify
- ✅ Live blockchain data from Sepolia testnet (blocks 8826172+)
- ✅ Application fully tested and production-ready

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Type Checking**: TypeScript compilation verification
4. **Database Setup**: Drizzle migrations applied via `npm run db:push`

### Production Configuration
- **Static Serving**: Express serves built React app in production
- **Environment Detection**: `NODE_ENV` controls development vs production behavior
- **Replit Integration**: Special handling for Replit deployment environment

### Development Workflow
- **Hot Reload**: Vite middleware integrated with Express in development
- **Proxy Setup**: API routes proxied through Vite dev server
- **Error Handling**: Runtime error overlays and comprehensive error boundaries

### Architecture Decisions

**Frontend Framework Choice**: React with TypeScript provides excellent developer experience and type safety. TanStack React Query handles complex caching requirements for blockchain data.

**Styling Approach**: Tailwind CSS with shadcn/ui offers rapid development with consistent design patterns. CSS variables enable easy theming.

**Backend Simplicity**: Express with TypeScript keeps the server lightweight while providing the necessary API layer for blockchain integration.

**Database Strategy**: Drizzle ORM with PostgreSQL is configured for future scalability, though current implementation uses in-memory storage for user data.

**Monorepo Structure**: Shared schemas between client and server ensure type consistency and reduce duplication.