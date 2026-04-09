from pydantic import BaseModel
from datetime import date
from typing import Optional, List


# Auth
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str]
    gender: str
    age: Optional[int]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    goal: str
    activity: str
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    goal: Optional[str] = None
    activity: Optional[str] = None


# Exercise
class ExerciseCreate(BaseModel):
    name: str
    is_bodyweight: bool = False

class ExerciseOut(BaseModel):
    id: int
    name: str
    is_bodyweight: bool
    class Config:
        from_attributes = True


# Set
class SetCreate(BaseModel):
    exercise_id: int
    reps: int
    sets_count: int = 1
    weight_kg: float = 0

class SetOut(BaseModel):
    id: int
    exercise_id: int
    reps: int
    sets_count: int
    weight_kg: float
    exercise: ExerciseOut
    class Config:
        from_attributes = True


# Workout
class WorkoutCreate(BaseModel):
    date: date
    notes: Optional[str] = None

class WorkoutOut(BaseModel):
    id: int
    date: date
    notes: Optional[str]
    sets: List[SetOut] = []
    class Config:
        from_attributes = True


# Progress
class ProgressPoint(BaseModel):
    date: date
    max_weight: float
    total_volume: float
