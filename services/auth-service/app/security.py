from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

# --- Environment Variables ---
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable not set")

# --- Password Hashing FIX ---
# FIX: Switched from "bcrypt" (which caused the 72-byte limit error) to "scrypt".
# SCrypt is a modern, memory-hard algorithm that is robust and stable in container environments.
# To use this, ensure 'scrypt' is installed, which comes standard with passlib or the 'pynacl' dependency.
pwd_context = CryptContext(schemes=["scrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Checks a plaintext password against a hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a plaintext password for storage."""
    # FIX: This now uses the SCrypt algorithm defined in pwd_context
    return pwd_context.hash(password)

# --- JWT Token Creation ---
def create_access_token(data: dict):
    """Generates a JSON Web Token (JWT) for authentication."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt