# Blink ⚡

A fast and simple URL shortener that helps you shorten your URLs in a blink!

## Overview

Blink is a full-stack URL shortener application with a React frontend and Node.js backend. It allows users to:

- Shorten long URLs instantly
- Track click analytics
- Create custom short URL slugs (registered users)
- Manage all their shortened URLs from a dashboard

## Project Structure

```
blink/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controller/   # Route controllers
│   │   ├── dao/          # Data access objects
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── app.js            # Express app entry point
│
└── frontend/         # React + Vite frontend
    └── src/
        ├── api/          # API client functions
        ├── components/   # React components
        ├── pages/        # Page components
        ├── routing/      # TanStack Router config
        ├── store/        # Redux store and slices
        └── utils/        # Utility functions
```

## Tech Stack

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- nanoid for URL generation

### Frontend
- React 19 + Vite
- TailwindCSS
- Redux Toolkit
- TanStack Query & Router
- Axios

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

1. **Clone the repository**

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.sample .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.sample .env
   npm run dev
   ```

4. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB connection string |
| APP_URL | Base URL for short URLs |
| JWT_SECRET | JWT signing secret |
| NODE_ENV | Environment mode |
| PORT | Server port |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |
| VITE_APP_NAME | Application name |

## License

MIT
