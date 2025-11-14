# Code Catalyst - Full Stack Learning Platform

A modern learning platform for mastering Full Stack Web Development.

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment on Vercel

### Frontend Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.vercel.app/api`)

4. Deploy!

The app will be available at `codecatalyst.vercel.app` (or your custom domain).

### Backend Deployment

Deploy the backend separately to Vercel or another service (Railway, Render, etc.) and update the `NEXT_PUBLIC_API_URL` environment variable.

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions and API client
- `/hooks` - Custom React hooks

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

