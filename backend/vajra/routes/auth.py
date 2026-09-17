from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from schemas.user import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    TokenRefresh, 
    LoginResponse, 
    OTPVerifyRequest, 
    OTPSendRequest
)
from auth.password_handler import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from services.otp_service import otp_service

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        role="SOC Analyst",
        mfa_enabled=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log registration activity
    try:
        from services.activity_logger import ActivityLogger
        logger = ActivityLogger(db)
        client_ip = request.client.host if request.client else None
        logger.log_activity(
            user_id=db_user.id,
            action="USER_REGISTER",
            resource="user",
            details=f"User registered successfully: {db_user.email}",
            ip_address=client_ip
        )
    except Exception:
        pass

    # Sync user to Firestore
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_user_to_firestore(db_user)
    except Exception:
        pass
    
    return db_user

@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Mandate 2-Step MFA OTP for ALL users: generate code and dispatch to user's registered email
    otp_code, mfa_session = otp_service.generate_otp(user.email)
    return LoginResponse(
        mfa_required=True,
        mfa_session=mfa_session,
        message=f"MFA OTP code sent to {user.email}. Please enter the 6-digit verification code sent to your email."
    )

@router.post("/send-otp")
async def send_otp(otp_req: OTPSendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code, mfa_session = otp_service.generate_otp(user.email)
    return {
        "message": f"OTP code sent to {user.email}",
        "mfa_session": mfa_session
    }

@router.post("/verify-otp", response_model=Token)
async def verify_otp(verify_req: OTPVerifyRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == verify_req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    isValid = otp_service.verify_otp(
        email=verify_req.email,
        code=verify_req.otp_code,
        mfa_session=verify_req.mfa_session
    )

    if not isValid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA OTP code"
        )

    # Log login activity
    try:
        from services.activity_logger import ActivityLogger
        logger = ActivityLogger(db)
        client_ip = request.client.host if request.client else None
        logger.log_activity(
            user_id=user.id,
            action="USER_LOGIN_MFA",
            resource="user",
            details=f"User verified MFA and logged in: {user.email}",
            ip_address=client_ip
        )
    except Exception:
        pass

    # Issue JWT tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_active=user.is_active
        )
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    # Verify refresh token
    payload = verify_token(token_data.refresh_token, "refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_active=user.is_active
        )
    )
