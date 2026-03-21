# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack web application for exploring the Summit Learning (萨米特) core competency framework — 7 capability domains, 36 dimensions, proficiency levels, and PBL (Project-Based Learning) projects.

## Development Commands

### Backend (Express.js + MySQL)
```bash
cd backend
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start without auto-restart
```
Runs on port 3000 (configurable via `backend/.env`).

### Frontend (Vue 3 + Vite)
```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Database
MySQL database named `Summit`. Schema and seed data in `sql/`. Connection configured in `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=Summit
PORT=3000
```

## Architecture

### Stack
- **Frontend**: Vue 3 (Composition API) + Vue Router 4 + Axios, built with Vite
- **Backend**: Express.js 5 + MySQL2 (promise-based connection pool, 10 connections)
- **No state management library** — pages manage local state via `ref`/`reactive`

### Frontend Structure (`frontend/src/`)
- `api/index.js` — all API calls; Axios client with `baseURL: http://localhost:3000/api`
- `router/index.js` — all routes; each route maps to a page component
- `pages/` — route-level page components (one per route)
- `layout/MainLayout.vue` — app shell with collapsible sidebar and breadcrumbs; wraps all pages
- `views/` — prototype/design-exploration components (not used in routing)

### Routes
| Path | Page | Purpose |
|------|------|---------|
| `/` | HomePage | Dashboard with stats |
| `/framework` | FrameworkPage | Browse all 7 domains and 36 dimensions |
| `/dimension/:id` | DimensionPage | Single dimension: levels 0–8, curriculum mapping |
| `/curriculum` | CurriculumPage | Curriculum standards reference |
| `/pbl` | PblPage | PBL project list with filters |
| `/pbl/:id/detail` | PblDetailPage | Single PBL project details |

### Backend Structure (`backend/`)
- `index.js` — server entry: CORS, JSON body parser, DB pool, route mounting
- `routes/domains.js` — `/api/domains`, `/api/domains/full` (deeply nested), `/api/domains/:id/dimensions`
- `routes/dimensions.js` — `/api/dimensions/:id`, `/api/dimensions/stats/summary`
- `routes/pbl.js` — `/api/pbl`, `/api/pbl/stats/overview`, `/api/pbl/instructions`, `/api/pbl/:id`

### Database Schema (key tables)
- `capability_domain` — 7 domains
- `capability_dimension` — 36 dimensions (FK → domain)
- `capability_level` — 9 levels per dimension (0–8), 324 total rows
- `dimension_curriculum` — maps dimensions to language/social/science subjects (boolean flags)
- `pbl_project` — PBL projects with bilingual names, grade levels 6–12, certification status
- `pbl_project_instructions` / `pbl_project_sample` — hierarchical instruction guidelines

## Content Notes

- UI and content are primarily in **Chinese** (Simplified)
- PBL projects have bilingual names (`name_en`, `name_zh`)
- Grade levels are stored as individual boolean columns (`grade_6` through `grade_12`) on `pbl_project`
- The `/api/domains/full` endpoint returns the entire framework as a single nested object — used by FrameworkPage for rendering the full hierarchy
