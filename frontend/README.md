# Blink - URL Shortener

A fast and simple URL shortener built with React, Vite, and TailwindCSS.

## Features

- ⚡ Shorten URLs instantly
- 🔐 User authentication (login/register)
- 📊 Track click analytics
- 🎨 Custom short URL slugs (for registered users)
- 🚀 Fast and responsive UI

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **State Management**: Redux Toolkit, TanStack Query
- **Routing**: TanStack Router
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.sample` to `.env` and configure your environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3000 |
| VITE_APP_NAME | Application name | Blink |
