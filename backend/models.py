from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # profile fields
    name = Column(String, nullable=True)
    gender = Column(String, default="female")
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    goal = Column(String, default="maintain")
    activity = Column(String, default="moderate")

    workouts = relationship("Workout", back_populates="user", cascade="all, delete")


class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_bodyweight = Column(Boolean, default=False, nullable=False)
    sets = relationship("WorkoutSet", back_populates="exercise")


class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    user = relationship("User", back_populates="workouts")
    sets = relationship("WorkoutSet", back_populates="workout", cascade="all, delete")


class WorkoutSet(Base):
    __tablename__ = "sets"
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    reps = Column(Integer, nullable=False)
    sets_count = Column(Integer, nullable=False, default=1)
    weight_kg = Column(Float, nullable=False, default=0)
    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise", back_populates="sets")
