# Project Management SaaS Web App

Production-style full-stack project management app inspired by Trello, Asana, and ClickUp.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Axios, React Router, dnd-kit, Socket.io client
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Socket.io
- Media: Cloudinary for avatar and attachment uploads

## Folder Structure

```text
backend/
  src/
    config/         # DB and Cloudinary setup
    controllers/    # Request handlers and business logic
    middleware/     # Auth, uploads, error handling
    models/         # Mongoose schemas
    routes/         # API route modules
    services/       # Activity + notification helpers
    socket/         # Socket.io room and connection logic
    utils/          # Token and access helpers
frontend/
  src/
    api/            # Axios and socket clients
    components/     # Reusable UI building blocks
    context/        # Auth, notifications, theme
    layouts/        # Shared app layout
    pages/          # Route-level screens
    styles/         # Tailwind entry stylesheet
```

## How The Main Flows Work

### 1. Authentication

- User registers with `name`, `email`, `password`
- Backend hashes the password with `bcryptjs`
- Backend returns a JWT
- Frontend stores the token in `localStorage` as `flowpilot_token`
- Axios automatically sends `Authorization: Bearer <token>` on protected requests
- On refresh, the frontend calls `/api/auth/me` to remember the session

### 2. Dashboard

- Frontend requests `/api/dashboard`
- Backend finds all projects the user owns or belongs to
- It aggregates:
  - total projects
  - total tasks
  - pending tasks
  - completed tasks
  - unread notifications
  - recent activity
  - upcoming deadlines

### 3. Projects

- `/api/projects` supports create, list, update, delete
- Each project stores `title`, `description`, `deadline`, `owner`, `members[]`
- Members include both `user` and `role`
- Project access is enforced with `ensureProjectAccess`

### 4. Team Members

- Invite form on the board sends `POST /api/projects/:projectId/invite`
- Backend looks up the invited user by email
- User is added to `members[]` with role `admin`, `manager`, or `member`
- Notification is emitted in realtime to that user

### 5. Tasks and Board

- Board columns are `todo`, `inprogress`, `review`, `done`
- Tasks store:
  - projectId
  - title
  - description
  - status
  - priority
  - deadline
  - assignedTo
  - createdBy
  - attachments
- Dragging a card updates local board state immediately, then sends `PUT /api/tasks/:taskId`

### 6. Realtime

- After login, frontend socket connects and joins the authenticated user
- Opening a project joins `project:<projectId>`
- Opening a task modal joins `task:<taskId>`
- Backend emits live events for:
  - `notification:new`
  - `task:created`
  - `task:updated`
  - `task:deleted`
  - `comment:created`

### 7. Comments

- Task modal loads comments with `GET /api/tasks/:taskId/comments`
- New comment uses `POST /api/comments/:taskId`
- Backend saves comment, creates activity, optionally notifies assignee, and emits socket update

### 8. Search and Filters

- Global search screen calls `/api/search?q=...`
- Backend uses Mongo `$regex` on project titles, task titles, and member names
- Project board also supports filtering by priority and assigned member

### 9. Notifications and Activity

- Important actions create `Activity` records for dashboard history
- Important user-facing events create `Notification` records
- Notifications page lets users mark items as read

### 10. Profile and Uploads

- Profile screen updates display name
- Password change verifies current password before hashing the new one
- Avatar upload uses `multer` memory storage and Cloudinary upload stream
- Task attachments use the same upload pattern

### 11. Dark Mode

- Theme is toggled from sidebar
- Selected theme is stored in `localStorage`
- Tailwind `dark` classes are applied on the root document element

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PUT /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/invite`
- `PATCH /api/projects/:projectId/members/:memberId`
- `DELETE /api/projects/:projectId/members/:memberId`

### Tasks

- `POST /api/tasks/project/:projectId`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `GET /api/tasks/:taskId/comments`
- `POST /api/tasks/:taskId/attachments`

### Comments

- `POST /api/comments/:taskId`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`

### Search

- `GET /api/search?q=keyword`

### Profile

- `PUT /api/profile`
- `PUT /api/profile/password`
- `POST /api/profile/avatar`

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- optional Cloudinary values for uploads

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set:

- `VITE_API_URL=http://localhost:5000/api`
- `VITE_SOCKET_URL=http://localhost:5000`

## Deployment

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` and `VITE_SOCKET_URL`

### Backend on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `backend/.env.example`

### MongoDB Atlas

- Create cluster
- Whitelist deployment IPs
- Replace `MONGODB_URI` in backend env

## Notes

- The app is scaffolded in a modular, portfolio-friendly structure.
- Upload features require valid Cloudinary credentials.
- Because package installation was not run in this environment, you should install dependencies before starting the app locally.
