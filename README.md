# Gluco Meter

## Overview
Gluco Meter combines a FastAPI backend for managing user accounts and glucose readings with a placeholder React
(frontend) scaffold created with Vite. The backend exposes authentication and profile endpoints while the frontend is
ready for integrating UI components that consume those APIs.

## Project Structure
- **backend/** – FastAPI project and supporting tooling.
  - `app/` initializes the FastAPI app, registers routers, configures security, and exposes health and auth endpoints.
  - `alembic/` and `alembic.ini` provide database migrations.
  - `tests/` contains unit tests targeting authentication behavior.
  - `requirements.txt` lists Python dependencies. Install them inside this directory to work with the backend.
  - `glucoapp.db` and `to_do.txt` store the SQLite database and project notes respectively.
- **frontend/** – React application scaffolded with Vite (JavaScript).
  - `src/` includes the default Vite React starter component structure.
  - `package.json` defines frontend dependencies and scripts managed with npm.
- **README.md**, **LICENSE** – Repository level documentation and licensing.

## Getting Started
### Backend
1. Navigate into the backend directory and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Execute the backend unit tests:
   ```bash
   pytest
   ```

### Frontend
1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   By default the app runs on http://localhost:5173/.
   API requests to `/api` are proxied to http://localhost:8000; set the
   `VITE_DEV_SERVER_PROXY_TARGET` environment variable before starting the
   dev server to point at a different backend URL.

## Deployment with Docker

The repository ships with production-ready container images for both the FastAPI backend and the Vite frontend.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) v2 or later

### Build and Run

From the repository root run:

```bash
docker compose up --build -d
```

This command builds the backend and frontend images and starts them as detached services. The default ports are:

- Backend API: http://localhost:8000
- Frontend app (served by Nginx): http://localhost:3000

To view the combined application logs, run:

```bash
docker compose logs -f
```

Shut the stack down with:

```bash
docker compose down
```

### Configuration

- Override the published ports by setting `BACKEND_PORT` or `FRONTEND_PORT` environment variables before running `docker compose`.
- During the frontend build the `VITE_API_BASE_URL` build argument defaults to `/api`. The Nginx container proxies requests from `/api` to the backend service, so the browser only needs to reach the frontend's origin. Override this argument when deploying the frontend image separately.
- The backend image includes the application code and runs `uvicorn app.main:app --host 0.0.0.0 --port 8000` by default. Swap in a different ASGI server or adjust worker counts by overriding the container command in your own Compose or orchestration definition.

## Next Steps
- Connect the React frontend to the FastAPI endpoints for registration, authentication, and profile views.
- Expand backend features with CRUD endpoints for glucose readings and integrate them into the frontend UI.
- Set up shared environment configuration (e.g., `.env` files) to manage API URLs and secrets across both projects.
