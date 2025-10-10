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

## Next Steps
- Connect the React frontend to the FastAPI endpoints for registration, authentication, and profile views.
- Expand backend features with CRUD endpoints for glucose readings and integrate them into the frontend UI.
- Set up shared environment configuration (e.g., `.env` files) to manage API URLs and secrets across both projects.
