from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Mock user store — replace with DB in production
MOCK_USERS = {
    "analyst@panopticon.gov": {
        "id": "user-001",
        "email": "analyst@panopticon.gov",
        "name": "Det. Sarah Kim",
        "role": "investigator",
        "badge": "DET-4821",
        "department": "Homicide Division",
        "hashed_password": "$2b$12$placeholder_hash",  # demo1234
    },
    "admin@panopticon.gov": {
        "id": "user-admin",
        "email": "admin@panopticon.gov",
        "name": "Admin",
        "role": "admin",
        "badge": "ADM-001",
        "department": "IT Security",
        "hashed_password": "$2b$12$placeholder_hash",
    },
}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = MOCK_USERS.get(payload.email.lower())
    # Accept demo password for mock
    valid = user and payload.password in ("demo1234", "admin1234")
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_access_token(subject=user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(**{k: v for k, v in user.items() if k != "hashed_password"}),
    )


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me():
    # In production, extract from JWT via dependency
    return UserResponse(
        id="user-001",
        email="analyst@panopticon.gov",
        name="Det. Sarah Kim",
        role="investigator",
        badge="DET-4821",
        department="Homicide Division",
    )
