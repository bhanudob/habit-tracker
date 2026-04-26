# Habit Tracker Backend

## Setup

### 1. Database
You need PostgreSQL running. Update `.env` with your database URL.

**Quick PostgreSQL setup (if not installed):**
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

**Create database:**
```bash
createdb habit_tracker
```

### 2. Install & Migrate
```bash
npm install
npm run prisma:migrate
```

### 3. Run
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/register` — { email, name, password }
- `POST /api/auth/login` — { email, password }
- `POST /api/auth/refresh` — { refreshToken }

### Habits (require JWT token in `Authorization: Bearer <token>`)
- `GET /api/habits` — list all
- `POST /api/habits` — { name, frequency, description?, color? }
- `PUT /api/habits/:id` — update fields
- `DELETE /api/habits/:id` — delete
- `POST /api/habits/:id/log` — { date, completed, notes? }

### Notes (require JWT token)
- `GET /api/notes` — list all
- `POST /api/notes` — { content }
- `DELETE /api/notes/:id` — delete

## Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```
