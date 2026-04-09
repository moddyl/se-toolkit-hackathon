from pydantic import BaseModel
from datetime import date
from typing import Optional, List


# Exercise
class ExerciseCreate(BaseModel):
    name: str

class ExerciseOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


# Set
class SetCreate(BaseModel):
    exercise_id: int
    reps: int
    weight_kg: float

class SetOut(BaseModel):
    id: int
    exercise_id: int
    reps: int
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


# Progress point
class ProgressPoint(BaseModel):
    date: date
    max_weight: float
    total_volume: float  # sum of weight * reps
