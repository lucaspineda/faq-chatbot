from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime
import os
from typing import Optional

security = HTTPBearer()


def verify_jwt_token(token: str) -> Optional[dict]:
    SECRET_KEY = os.getenv("NEXTAUTH_SECRET")
    if not SECRET_KEY:
        raise ValueError("NEXTAUTH_SECRET not found in environment variables")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            raise HTTPException(status_code=401, detail="Token expired")
        
        return payload
        
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    token = credentials.credentials
    payload = verify_jwt_token(token)
    
    user = {
        "id": payload.get("sub") or payload.get("id"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "lastName": payload.get("lastName"),
        "isAnonymous": payload.get("isAnonymous", False),
    }
    
    if not user["id"]:
        raise HTTPException(status_code=401, detail="Invalid token payload: missing user ID")
    
    return user


