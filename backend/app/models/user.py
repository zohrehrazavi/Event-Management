from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ATTENDEE = "attendee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ATTENDEE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
