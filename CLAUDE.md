# Habit Tracker — Project Bible

## What This App Does
A daily habit tracker PWA. Users define habit "blocks" (e.g. Morning Routine, Workout),
track completion each day, write notes/revisions, and review weekly progress.

## Tech Stack

### Frontend
- React + Vite (v8)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v6
- Nunito font (Google Fonts)
- vite-plugin-pwa (PWA support)

### Backend (to be built)
- Runtime: Node.js
- Framework: Express
- Database: (TBD — likely PostgreSQL with Prisma ORM)
- Auth: JWT (access + refresh tokens)
- API style: REST, prefix `/api`

## Color Palette
- Primary: teal-600 `#0d9488`
- Accent: purple-600 `#9333ea`
- Background: `#f8fafc`
- Cards: white with soft shadow

## Folder Structure

### Frontend (`src/`)
```
src/
├── App.jsx              ← all routes
├── index.css            ← Tailwind + Nunito import
├── main.jsx
├── layouts/
│   ├── AppLayout.jsx    ← shell with bottom nav (authenticated pages)
│   └── AuthLayout.jsx   ← shell for login/register
├── components/
│   └── BottomNav.jsx    ← 4 tabs: Today / Notes / Add / Weekly
└── pages/
    ├── TodayView.jsx
    ├── AddEditBlock.jsx  ← /add and /add/:id
    ├── NotesRevisions.jsx
    ├── WeeklyReview.jsx
    ├── Login.jsx
    └── Register.jsx
```

### Backend (`server/`) — to be scaffolded
```
server/
├── index.js             ← entry point
├── routes/
├── controllers/
├── middleware/
│   └── auth.js          ← JWT verify middleware
├── models/              ← Prisma models or DB schemas
└── prisma/
    └── schema.prisma
```

## Routes (Frontend)
| Path        | Page            | Auth required |
|-------------|-----------------|---------------|
| `/`         | TodayView       | Yes           |
| `/add`      | AddEditBlock    | Yes           |
| `/add/:id`  | AddEditBlock    | Yes           |
| `/notes`    | NotesRevisions  | Yes           |
| `/weekly`   | WeeklyReview    | Yes           |
| `/login`    | Login           | No            |
| `/register` | Register        | No            |

## API Endpoints Plan (to be built)
| Method | Path                    | Description               |
|--------|-------------------------|---------------------------|
| POST   | /api/auth/register      | Create account            |
| POST   | /api/auth/login         | Login, returns JWT        |
| POST   | /api/auth/refresh       | Refresh access token      |
| GET    | /api/habits             | List all habit blocks     |
| POST   | /api/habits             | Create habit block        |
| PUT    | /api/habits/:id         | Update habit block        |
| DELETE | /api/habits/:id         | Delete habit block        |
| POST   | /api/habits/:id/log     | Mark habit done for today |
| GET    | /api/notes              | List notes                |
| POST   | /api/notes              | Create note               |
| GET    | /api/weekly             | Weekly summary stats      |

## Key Conventions
- All API responses: `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- Dates: ISO 8601 UTC strings
- Auth header: `Authorization: Bearer <token>`
- Frontend stores JWT in `localStorage` (key: `habit_token`)
- Components use named exports for pages, default exports for layouts
- Tailwind only — no CSS modules or styled-components
- No `any` types if TypeScript is added later

## Current Status
- [x] Frontend scaffold (Vite + React + Tailwind + PWA)
- [x] Routing structure with AppLayout + AuthLayout
- [x] Bottom navigation bar
- [x] Login + Register page shells (UI only, no API calls yet)
- [ ] Backend scaffold
- [ ] Auth integration (JWT)
- [ ] Habit CRUD UI + API
- [ ] Daily logging
- [ ] Notes page
- [ ] Weekly review stats
- [ ] Protected routes / auth guard
