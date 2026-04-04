# URL Shortener with Analytics

A full-stack URL shortener application with analytics tracking and dashboard visualization.

## Features

- Shorten long URLs
- Custom alias support
- Redirect to original URL
- Track total clicks
- Track daily clicks
- Last 7 days analytics
- IP-based duplicate click filtering

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: MongoDB

## API Endpoints

- POST /shorten → Create short URL
- GET /:code → Redirect
- GET /analytics/:code → Get analytics

## Setup

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```