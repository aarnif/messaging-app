# Messaging App

The Full Stack Open Course Project: Messaging App

## Prerequisites

- Node.js (v24 or higher)
- Docker and Docker Compose (for local database setup)
- npm

## Development

1. Clone the repository

   HTTPS:

   ```bash
   git clone https://github.com/aarnif/messaging-app.git
   ```

   SSH:

   ```bash
   git clone git@github.com:aarnif/messaging-app.git
   ```

2. Navigate to the project root directory

   ```bash
   cd messaging-app
   ```

3. Install all dependencies

   ```bash
   npm run install:all
   ```

4. Set up environment variables

   **Server**

   Create a `.env` file in the `server` directory with the following contents:

   ```bash
   DATABASE_URL=YOUR_DATABASE_URL_HERE
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   SERVER_URL=YOUR_SERVER_URL_HERE
   WS_URL=YOUR_WS_URL_HERE
   REDIS_URI=YOUR_REDIS_URI_HERE
   CI=false
   ```

   **Option A: Using Docker PostgreSQL and Redis (recommended for development)**

   If using the provided Docker containers, your environment variables should be:

   ```bash
   DATABASE_URL=postgres://postgres:mysecretpassword@localhost:6001/postgres
   JWT_SECRET=your-development-secret-key
   SERVER_URL=http://localhost:4000
   WS_URL=ws://localhost:4000
   REDIS_URI=redis://localhost:6379
   CI=false
   ```

   Start the database and Redis containers in a new terminal (leave it running):

   ```bash
   npm run start:db
   ```

   **Option B: Using your own PostgreSQL and Redis**

   Configure `DATABASE_URL` and `REDIS_URI` to point to your existing databases.

   **UI**

   Create `.env.development` and `.env.production` files in the `ui` directory with the following contents:

   `.env.development`:

   ```bash
   VITE_API_URL=http://localhost:4000
   VITE_WS_URL=ws://localhost:4000
   ```

   `.env.production`:

   ```bash
   VITE_API_URL=YOUR_PRODUCTION_API_URL_HERE
   VITE_WS_URL=YOUR_PRODUCTION_WS_URL_HERE
   ```

5. Add seed data to the database

   ```bash
   npm run populate:db
   ```

6. Start the server development server (in a new terminal)

   ```bash
   npm run dev:server
   ```

7. Start the UI development server (in a new terminal)

   ```bash
   npm run dev:ui
   ```

## npm commands

### General

- `npm run install:all` - Install dependencies for both server and UI

### Database

- `npm run start:db` - Start PostgreSQL and Redis in Docker containers
- `npm run populate:db` - Add seed data to the database

### Server

- `npm run dev:server` - Start server in development mode
- `npm run prod:server` - Start server in production mode
- `npm run test:server` - Run server tests
- `npm run typecheck:server` - Run TypeScript type checking for server
- `npm run lint:server` - Run linter for server code
- `npm run generate:server` - Generate GraphQL types

### UI

- `npm run dev:ui` - Start UI development server
- `npm run build:ui` - Build UI for production
- `npm run preview:ui` - Preview production build locally
- `npm run test:ui` - Run UI tests
- `npm run test:ui:coverage` - Run UI tests with coverage
- `npm run typecheck:ui` - Run TypeScript type checking for UI
- `npm run lint:ui` - Run linter for UI code
- `npm run generate:ui` - Generate GraphQL types

### End-to-End Testing

- `npm run test:e2e` - Run Playwright end-to-end tests
