# Blink - URL Shortener Backend

A fast and scalable URL shortener API built with Node.js, Express, MongoDB, and Redis caching.

## Features

- ⚡ Create short URLs instantly with sub-50ms redirect latency
- 🚀 Redis caching for optimized read-heavy redirects (~40% reduction in DB hits)
- 🔐 User authentication with JWT
- 📊 Real-time click and device analytics
- 🎨 Custom short URL slugs (for registered users)
- 🍪 Secure cookie-based authentication
- 🛡️ IP-based rate limiting for API security
- 📈 Graceful degradation - works without Redis

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (optional, for performance optimization)
- **Authentication**: JWT with bcryptjs
- **URL Generation**: nanoid

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Request                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rate Limiter                             │
│              (Redis-backed / Memory fallback)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Router                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Controller                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Redis Cache       │   │     MongoDB         │
│   (Optional)        │   │   (Primary Store)   │
│   TTL: 1 hour       │   │                     │
└─────────────────────┘   └─────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- Redis (optional - for caching optimization)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.sample` to `.env` and configure your environment variables:
   ```bash
   cp .env.sample .env
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Redis Setup (Optional)

Redis is optional. The app works without it but with reduced performance.

**Local Redis:**
```bash
# Windows (with WSL or Docker)
docker run -d -p 6379:6379 redis

# macOS
brew install redis
brew services start redis
```

**Cloud Redis (Recommended for production):**
- [Upstash](https://upstash.com/) - Free tier available
- [Redis Cloud](https://redis.com/cloud/)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/blink |
| APP_URL | Base URL for generated short URLs | http://localhost:3000/ |
| JWT_SECRET | Secret key for JWT token signing | - |
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| REDIS_URL | Redis connection URL (optional) | redis://localhost:6379 |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user (protected) |

### URL Shortening

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create` | Create a short URL |
| GET | `/:id` | Redirect to original URL |

### User URLs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/urls` | Get all URLs for authenticated user (protected) |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
