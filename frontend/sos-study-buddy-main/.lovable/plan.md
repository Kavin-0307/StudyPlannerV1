

# SOS (Student Operating System) — Full Frontend Implementation

## Overview
Build the complete SOS frontend connecting to a Spring Boot backend at a configurable base URL (`VITE_API_BASE_URL`), using JWT auth, sidebar navigation, and all 8 feature modules.

## 1. Foundation & Auth
- **Axios instance** with `VITE_API_BASE_URL` (defaults to `http://localhost:8080`), JWT interceptor (Bearer token from localStorage), 401 → redirect to login
- **AuthContext** — login (`POST /api/auth`), logout, persist token in localStorage
- **Register page** (`POST /api/users`)
- **Login page** — email/username + password
- **Protected layout** (`_authenticated`) — redirects unauthenticated users to `/login`

## 2. App Shell
- Collapsible **sidebar** with links: Dashboard, Subjects, Deadlines, Study Plan, Lectures, Revisions
- Responsive (collapses on mobile), minimalistic card-based design
- Logout button in sidebar

## 3. Dashboard (`GET /api/dashboard/{userId}`)
- Summary stat cards (subjects, deadlines, revisions, sessions)
- Today's study plan preview
- Upcoming deadlines & due revisions lists

## 4. Subjects
- Create subject (`POST /api/subjects`)
- List all subjects (`GET /api/subjects` — paginated)
- Search subjects (`GET /api/subjects/search`)
- Update (`PUT /api/subjects/{id}`) & Delete (`DELETE /api/subjects/{id}`)

## 5. Deadlines
- Create deadline (`POST /api/deadlines?subjectId=...`)
- Tabs: All (`GET /api/deadlines/all`), Upcoming (`/upcoming`), Overdue (`/overdue`)
- Advanced filtering (`GET /api/deadlines` — keyword, subject, type, priority, date range)
- By subject view (`GET /api/deadlines/subject/{subjectId}`)
- Update & Delete
- Pagination throughout

## 6. Study Plan
- Generate plan (`POST /api/studyplans/generate`)
- Today's plan (`GET /api/studyplans/today`)
- Full plan (`GET /api/studyplans/user`)
- Date range view (`GET /api/studyplans/range?start=&end=`)
- Progress view (`GET /api/studyplans/user/progress`)
- Update session status (`PATCH /api/studyplans/{planId}/status`) — completed/missed
- Search/filter (`GET /api/studyplans` — subjectId, status, date range, pagination)

## 7. Lectures
- Upload PDF (`POST /api/lectures/{subjectId}` — multipart)
- List/search lectures (`GET /api/lectures` — keyword, subject, processed status, date range)
- View lecture detail (`GET /api/lectures/{lectureId}`)
- Process lecture (`POST /api/lectures/{lectureId}/process`)
- Delete lecture (`DELETE /api/lectures/{lectureId}`)
- **AI Output view** for processed lectures:
  - Summary (`GET /api/ai-output/lecture/{lectureId}/summary`)
  - Keywords (`GET /api/ai-output/lecture/{lectureId}/keywords`)
  - Revision sheet (`GET /api/ai-output/lecture/{lectureId}/revision-sheet`)
  - All outputs (`GET /api/ai-output/lecture/{lectureId}`)

## 8. Revisions
- List revisions with filters (`GET /api/revisions` — status, lectureId, date range, pagination)
- Mark completed (`PATCH /api/revisions/{revisionId}/complete`)
- Revision history tracking

## 9. Reusable Components
- StatCard, StatusBadge, EmptyState, LoadingSpinner, ErrorMessage, ConfirmDialog, DataTable with pagination

## 10. API Service Layer
- Central Axios instance + per-module services: `authService`, `subjectService`, `deadlineService`, `studyPlanService`, `lectureService`, `revisionService`, `aiOutputService`, `dashboardService`

## Configuration
- Set `VITE_API_BASE_URL` in Project Settings → Secrets to your backend URL
- For local dev: use ngrok to expose `localhost:8080`, then set that URL as the secret

