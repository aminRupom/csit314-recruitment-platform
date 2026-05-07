# backend/core/tests/test_auth.py
"""
Tests for authentication endpoints.

Covers:
  - Candidate registration
  - Employer registration
  - Login returns JWT
  - Wrong password fails
  - /me/ returns current user
"""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_candidate_can_register(client):
    response = client.post("/api/auth/register/", {
        "username": "newcand",
        "email": "newcand@test.com",
        "password": "TestPass123!",
        "role": "CANDIDATE",
    }, format="json")
    assert response.status_code == 201
    assert response.data["user"]["role"] == "CANDIDATE"
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_employer_can_register(client):
    response = client.post("/api/auth/register/", {
        "username": "newemp",
        "email": "newemp@test.com",
        "password": "TestPass123!",
        "role": "EMPLOYER",
    }, format="json")
    assert response.status_code == 201
    assert response.data["user"]["role"] == "EMPLOYER"


@pytest.mark.django_db
def test_login_returns_jwt(client):
    client.post("/api/auth/register/", {
        "username": "loginuser",
        "email": "loginuser@test.com",
        "password": "TestPass123!",
        "role": "CANDIDATE",
    }, format="json")
    response = client.post("/api/auth/login/", {
        "username": "loginuser",
        "password": "TestPass123!",
    }, format="json")
    assert response.status_code == 200
    assert "access" in response.data


@pytest.mark.django_db
def test_login_with_wrong_password_fails(client):
    client.post("/api/auth/register/", {
        "username": "wronguser",
        "email": "wronguser@test.com",
        "password": "TestPass123!",
        "role": "CANDIDATE",
    }, format="json")
    response = client.post("/api/auth/login/", {
        "username": "wronguser",
        "password": "WrongPassword",
    }, format="json")
    assert response.status_code == 401


@pytest.mark.django_db
def test_me_returns_current_user(client):
    register = client.post("/api/auth/register/", {
        "username": "meuser",
        "email": "meuser@test.com",
        "password": "TestPass123!",
        "role": "CANDIDATE",
    }, format="json")
    token = register.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    response = client.get("/api/auth/me/")
    assert response.status_code == 200
    assert response.data["username"] == "meuser"
    assert response.data["role"] == "CANDIDATE"


@pytest.mark.django_db
def test_me_without_token_returns_401(client):
    response = client.get("/api/auth/me/")
    assert response.status_code == 401