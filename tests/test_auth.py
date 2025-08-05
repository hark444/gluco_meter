from datetime import datetime, timedelta
import os
import sys

from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure the application package is on the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.api.auth import get_db
from app.core.security import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.base import Base
# Import models so that SQLAlchemy registers the tables
from app.db.models import user as user_model  # noqa: F401
from app.schemas.user import UserRole


# Use an in-memory SQLite database for tests
engine = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the test database
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_login_token_expiration():
    """Ensure issued access tokens honor the configured expiration time."""

    user_payload = {
        "email": "user@example.com",
        "full_name": "Test User",
        "password": "secret",
    }

    # Register the user
    response = client.post("/api/register", json=user_payload)
    assert response.status_code == 200

    # Authenticate and retrieve the token
    response = client.post(
        "/api/login",
        data={"username": user_payload["email"], "password": user_payload["password"]},
    )
    assert response.status_code == 200

    token = response.json()["access_token"]
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    expires_at = datetime.fromtimestamp(payload["exp"])

    remaining = expires_at - datetime.utcnow()
    expected = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Allow a small delta for processing time
    assert expected - timedelta(seconds=60) <= remaining <= expected + timedelta(seconds=60)



def test_register_default_role_regular():
    user_payload = {
        "email": "roleuser@example.com",
        "full_name": "Role User",
        "password": "secret",
    }

    response = client.post("/api/register", json=user_payload)
    assert response.status_code == 200

    db = TestingSessionLocal()
    try:
        user = db.query(user_model.User).filter_by(email=user_payload["email"]).first()
        assert user is not None
        assert user.role == UserRole.regular
    finally:
        db.close()

def test_register_defaults_to_regular_role_and_login_issues_token():
    """Registering without a role should store the user as 'regular' and allow login."""

    payload = {
        "email": "new_user@example.com",
        "password": "supersecret",
    }

    # Register the user without specifying a role
    response = client.post("/api/register", json=payload)
    assert response.status_code == 200

    # Verify the role stored in the database defaults to 'regular'
    db = TestingSessionLocal()
    user = db.query(user_model.User).filter_by(email=payload["email"]).first()
    db.close()
    assert user is not None
    assert user.role == "regular"

    # Login should return an access token
    login_response = client.post(
        "/api/login", data={"username": payload["email"], "password": payload["password"]}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


