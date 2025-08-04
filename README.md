# Gluco Meter

## Overview
Gluco Meter is a small FastAPI application for managing user accounts and glucose readings. It provides authentication endpoints, user profile management and a foundation for tracking readings.

## Project Structure
- **app/**
  - `main.py` initializes the FastAPI app, configures CORS middleware, registers routers and exposes a health check.
  - `api/` contains routers for registering and logging in users and for fetching the current user profile.
  - `core/security.py` handles password hashing and JSON Web Token (JWT) creation.
  - `db/session.py` sets up SQLAlchemy with a local SQLite database.
  - `models/` defines SQLAlchemy models for users and readings.
  - `schemas/` contains Pydantic models used for request and response validation.
- **alembic/** contains database migration scripts.
- **tests/** holds unit tests for authentication functionality.
- **requirements.txt** lists runtime dependencies.

## Getting Started
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## What to Learn Next
- **FastAPI Basics:** routing, dependency injection and middleware.
- **SQLAlchemy & Alembic:** model mapping and database migrations.
- **Authentication & Security:** JWT issuance/verification and password hashing.
- **Pydantic Models:** request/response validation and interaction with ORM objects.
- **Feature Expansion:** implement CRUD endpoints for glucose readings.
