# DevConnect API

The production-ready backend for DevConnect, a social media platform for developers.

## Features

- **Authentication**: JWT based (Access & Refresh tokens), email verification, password reset.
- **Users**: Profiles, avatars, banners, follow system, suggested users.
- **Posts**: Text, image, code snippets, project showcases, likes, bookmarks.
- **Comments**: Nested threaded replies.
- **Communities**: Niche groups, members, moderators.
- **Jobs**: Job board, applications, tracking.
- **Real-time**: Socket.IO notifications for likes, comments, follows.
- **Search**: Global text search across models.

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Socket.IO
- Cloudinary (Images)
- Nodemailer (Emails)
- Express Validator
- Helmet, Rate Limiting, Morgan

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials (MongoDB, Cloudinary, SMTP).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints (Prefix: `/api`)

- `/auth/*` - Registration, login, logout, get me
- `/users/*` - Profiles, following, avatars
- `/posts/*` - CRUD posts, feed, likes, bookmarks
- `/comments/*` - Add, delete, fetch nested comments
- `/communities/*` - Create, join, leave, fetch communities
- `/notifications/*` - Fetch, mark as read
- `/jobs/*` - Post jobs, fetch jobs, apply
- `/search?q=query` - Global search
