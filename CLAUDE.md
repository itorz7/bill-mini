# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Memory & Context

### Project Overview
This is a PromptPay payment gateway system that allows users to:
- Generate QR codes for phone numbers or national ID cards
- Accept payments via PromptPay QR codes
- Verify payment slips using EasySlip API integration
- Manage transactions with dashboard and analytics
- Send Telegram notifications for payment events

### Key Business Logic
- **Payment Types**: Phone (MSISDN) and National ID (NATID) support
- **Amount Limits**: 0.01 - 10,000,000 THB
- **Slip Verification**: Uses EasySlip API with Turnstile protection
- **Unique Constraints**: Prevent duplicate slip submissions via payload uniqueness
- **Status Flow**: pending → completed/cancelled
- **Notifications**: Telegram alerts for create/cancel/complete events

### API Integrations
- **PromptPay QR**: `promptparse` library with `anyId()` function
- **Slip Verification**: EasySlip API at `https://developer.easyslip.com/api/v1/verify`
- **Security**: Cloudflare Turnstile for bot protection
- **Notifications**: Telegram Bot API for transaction alerts

### User Experience Requirements
- **Design**: Modern dark theme (Cursor/Gemini style)
- **Effects**: Glowing cards, smooth animations, loading states
- **Mobile**: Responsive design with camera/file upload options
- **Validation**: Real-time frontend + backend validation
- **Navigation**: Protected routes with auth middleware

### Database Design Patterns
- **Users**: Store API keys (EasySlip, Telegram) per user
- **Transactions**: Full payment lifecycle with JSON slip data
- **Indexes**: Optimized for status and date queries
- **Relations**: User-owned transactions with cascade delete

## Development Commands

- `npm run dev` - Start development server (Next.js on port 3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm run db:pull` - Pull database schema changes with Drizzle

## Architecture Overview

This is a PromptPay payment gateway system built with Next.js 15, featuring QR code generation, slip verification, and transaction management.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with Radix UI components
- **QR Generation**: promptparse library for PromptPay QR codes
- **Slip Verification**: EasySlip API integration
- **Security**: Cloudflare Turnstile protection

### Database Schema
- **users**: User accounts with Telegram/EasySlip API settings
- **transactions**: Payment transactions with QR codes and slip data
- Schema files: `drizzle/schema.ts`, types in `src/lib/db.ts`

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components (including shadcn/ui)
- `src/lib/` - Core utilities (auth, database, validators, integrations)
- `src/schemas/` - Zod validation schemas
- `drizzle/` - Database schema and migrations

### Authentication Flow
- Uses NextAuth.js with username/password credentials
- Protected routes: `/dashboard`, `/transactions`, `/profile`
- Middleware handles route protection in `src/middleware.ts`
- Session management via JWT strategy

### Payment Flow
1. Generate PromptPay QR codes using `promptparse` library
2. Support phone numbers (MSISDN) and national ID (NATID) 
3. Verify payment slips via EasySlip API
4. Store transaction data with unique payload constraint
5. Send Telegram notifications for transaction events

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `EASYSLIP_API_KEY` - For slip verification (stored per user)
- `TELEGRAM_BOT_TOKEN` - For notifications (stored per user)

### Data Fetching
- **Frontend**: Always use SWR for data fetching and caching
- Provides automatic revalidation and optimistic updates
- Used for dashboard stats, transactions list, and profile data

### Design System
- Modern dark theme similar to Cursor/Gemini interfaces
- Radix UI primitives with custom styling
- Glowing effects and smooth animations
- Responsive design with mobile support

### Security Features
- Frontend and backend validation for all inputs
- Cloudflare Turnstile protection on auth and payments
- Database constraints prevent duplicate slips
- Protected API routes with session validation
- Encrypted password storage with bcryptjs

## Development Patterns & Preferences

### Code Style
- Use TypeScript with strict type checking
- Follow existing component patterns in `src/components/`
- Maintain consistent error handling with try/catch blocks
- Use Zod schemas for all input validation (`src/schemas/`)

### Component Structure
- shadcn/ui components in `src/components/ui/`
- Business components directly in `src/components/`
- Use Radix UI primitives for consistent behavior
- Implement loading states and error boundaries

### API Route Patterns
- All routes handle POST/GET appropriately
- Use NextAuth session validation for protected endpoints
- Return consistent JSON response format
- Implement proper error status codes (400, 401, 500)

### State Management
- SWR for all server state and caching
- React Hook Form for form state management
- Local state with useState for UI interactions
- Session state via NextAuth useSession hook

### File Organization
- API routes mirror page structure in `src/app/api/`
- Schemas match corresponding API endpoints
- Utilities in `src/lib/` with specific purpose files
- Type definitions export from database schema

### Testing & Quality
- Run linting before commits: `npm run lint`
- Validate database operations with Drizzle queries
- Test API integrations (EasySlip, Telegram) in development
- Use TypeScript strict mode for compile-time safety