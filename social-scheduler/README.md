# Social Scheduler

A production-quality social media scheduling platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **User Authentication** - Email/password signup and login
- **Dashboard** - Overview of scheduled posts with stats
- **New Post Wizard** - Create posts with content, media, datetime picker, and platform selection
- **Calendar View** - Visualize scheduled posts in a calendar format
- **Connected Accounts** - Manage social media account connections (mocked for demo)
- **Mock Scheduler** - Background job that processes due posts (logs actions, simulates posting)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Auth**: NextAuth.js v5 (Auth.js)
- **Icons**: Lucide React

## Getting Started

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
AUTH_SECRET=your-random-secret-key-at-least-32-characters-long
AUTH_URL=http://localhost:3000
```

You can generate a secret with:
```bash
openssl rand -base64 32
```

Or use any random 32+ character string.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create an Account

1. Go to `/signup` to create a new account
2. Login with your credentials
3. Start scheduling posts!

## API Endpoints

- `POST /api/auth/signup` - Create new user
- `GET/POST /api/posts` - List/create scheduled posts
- `GET/POST /api/accounts` - List/connect social accounts
- `DELETE /api/accounts/[id]` - Disconnect account
- `GET/POST /api/scheduler` - Check scheduler status / trigger processing

## Mock Scheduler

The scheduler endpoint (`/api/scheduler`) processes posts that are due. In production, this would be called by a cron job every minute. For testing:

```bash
curl -X POST http://localhost:3000/api/scheduler
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── api/             # API routes
│   └── dashboard/       # Protected dashboard pages
├── components/
│   ├── layout/          # Sidebar, Header
│   ├── providers/       # Session provider
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── db/              # Drizzle ORM setup & schema
│   ├── auth.ts          # NextAuth configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript declarations
```

## Next Steps (Production)

1. **Real OAuth Integration** - Connect actual Facebook, Instagram, TikTok, Twitter APIs
2. **File Uploads** - Implement S3/Cloudinary for media storage
3. **Background Jobs** - Use BullMQ + Redis or Vercel Cron for reliable scheduling
4. **Migrate to Postgres** - Swap SQLite for Postgres in production
5. **Add Tests** - Unit and integration tests
