import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

import models, schemas
from database import engine, get_db
from auth import hash_password, verify_password, create_token, get_current_user

models.Base.metadata.create_all(bind=engine)

DEFAULT_EXERCISES = [
    ("Bench Press", False), ("Squat", False), ("Deadlift", False),
    ("Overhead Press", False), ("Barbell Row", False), ("Leg Press", False),
    ("Bicep Curl", False), ("Tricep Pushdown", False), ("Lat Pulldown", False),
    ("Incline Bench Press", False), ("Romanian Deadlift", False),
    ("Pull-Up", True), ("Dip", True), ("Push-Up", True),
    ("Lunges", True), ("Plank", True), ("Face Pull", False),
]

def seed_exercises():
    db = next(get_db())
    for name, is_bw in DEFAULT_EXERCISES:
        if not db.query(models.Exercise).filter(models.Exercise.name == name).first():
            db.add(models.Exercise(name=name, is_bodyweight=is_bw))
    db.commit()
    db.close()

seed_exercises()

app = FastAPI(title="FitLog API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# ── Auth ───────────────────────────────────────────────────
@app.post("/auth/register", response_model=schemas.TokenOut, status_code=201)
def register(body: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_token(user.id)}

@app.post("/auth/login", response_model=schemas.TokenOut)
def login(body: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": create_token(user.id)}

@app.get("/auth/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user

@app.patch("/auth/profile", response_model=schemas.UserOut)
def update_profile(body: schemas.ProfileUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


# ── Exercises ──────────────────────────────────────────────
@app.get("/exercises", response_model=List[schemas.ExerciseOut])
def get_exercises(db: Session = Depends(get_db)):
    return db.query(models.Exercise).order_by(models.Exercise.name).all()

@app.post("/exercises", response_model=schemas.ExerciseOut, status_code=201)
def create_exercise(body: schemas.ExerciseCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if db.query(models.Exercise).filter(models.Exercise.name == body.name).first():
        raise HTTPException(status_code=400, detail="Exercise already exists")
    ex = models.Exercise(name=body.name, is_bodyweight=body.is_bodyweight)
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex


# ── Workouts ───────────────────────────────────────────────
@app.get("/workouts", response_model=List[schemas.WorkoutOut])
def get_workouts(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Workout).filter(models.Workout.user_id == user.id).order_by(models.Workout.date.desc()).all()

@app.get("/workouts/{workout_id}", response_model=schemas.WorkoutOut)
def get_workout(workout_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    w = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user.id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    return w

@app.post("/workouts", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(body: schemas.WorkoutCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    w = models.Workout(user_id=user.id, date=body.date, notes=body.notes)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

@app.delete("/workouts/{workout_id}", status_code=204)
def delete_workout(workout_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    w = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user.id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(w)
    db.commit()

@app.post("/workouts/{workout_id}/copy", response_model=schemas.WorkoutOut, status_code=201)
def copy_workout(workout_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import date as date_type
    original = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Not found")
    new_w = models.Workout(user_id=user.id, date=date_type.today(), notes=original.notes)
    db.add(new_w)
    db.commit()
    db.refresh(new_w)
    for s in original.sets:
        db.add(models.WorkoutSet(workout_id=new_w.id, exercise_id=s.exercise_id, reps=s.reps, sets_count=s.sets_count, weight_kg=s.weight_kg))
    db.commit()
    db.refresh(new_w)
    return new_w


# ── Sets ───────────────────────────────────────────────────
@app.post("/workouts/{workout_id}/sets", response_model=schemas.SetOut, status_code=201)
def add_set(workout_id: int, body: schemas.SetCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    w = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user.id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    ex = db.query(models.Exercise).filter(models.Exercise.id == body.exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    s = models.WorkoutSet(workout_id=workout_id, exercise_id=body.exercise_id, reps=body.reps, sets_count=body.sets_count, weight_kg=body.weight_kg)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

@app.delete("/sets/{set_id}", status_code=204)
def delete_set(set_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(models.WorkoutSet).join(models.Workout).filter(models.WorkoutSet.id == set_id, models.Workout.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(s)
    db.commit()


# ── Progress ───────────────────────────────────────────────
@app.get("/progress/{exercise_id}", response_model=List[schemas.ProgressPoint])
def get_progress(exercise_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.Workout.date, func.max(models.WorkoutSet.weight_kg).label("max_weight"),
                 func.sum(models.WorkoutSet.weight_kg * models.WorkoutSet.reps * models.WorkoutSet.sets_count).label("total_volume"))
        .join(models.WorkoutSet).filter(models.WorkoutSet.exercise_id == exercise_id, models.Workout.user_id == user.id)
        .group_by(models.Workout.date).order_by(models.Workout.date).all()
    )
    return [schemas.ProgressPoint(date=r.date, max_weight=r.max_weight, total_volume=r.total_volume) for r in rows]


# ── Records ────────────────────────────────────────────────
@app.get("/records")
def get_records(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.Exercise.name, models.Exercise.is_bodyweight,
                 func.max(models.WorkoutSet.weight_kg).label("max_weight"),
                 func.max(models.WorkoutSet.reps).label("max_reps"))
        .join(models.WorkoutSet).join(models.Workout)
        .filter(models.Workout.user_id == user.id)
        .group_by(models.Exercise.id, models.Exercise.name, models.Exercise.is_bodyweight)
        .order_by(func.max(models.WorkoutSet.weight_kg).desc()).all()
    )
    return [{"exercise": r.name, "is_bodyweight": r.is_bodyweight, "max_weight": r.max_weight, "max_reps": r.max_reps} for r in rows]


# ── Calories ───────────────────────────────────────────────
MET_VALUES = {"default": 5.0, "press": 6.0, "squat": 7.0, "deadlift": 8.0, "row": 6.0,
              "pull": 6.5, "curl": 4.0, "pushdown": 4.0, "fly": 4.0, "lunge": 6.0, "plank": 3.5, "dip": 6.0, "push": 5.5}

def get_met(name: str) -> float:
    n = name.lower()
    for key, met in MET_VALUES.items():
        if key in n: return met
    return MET_VALUES["default"]

@app.get("/workouts/{workout_id}/calories")
def get_calories(workout_id: int, body_weight: float = None, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    w = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.user_id == user.id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    bw = body_weight or user.weight_kg or 70.0
    if not w.sets:
        return {"calories": 0, "duration_min": 0, "sets_count": 0}
    total_sets = sum(s.sets_count for s in w.sets)
    grouped = {}
    for s in w.sets:
        grouped[s.exercise.name] = grouped.get(s.exercise.name, 0) + s.sets_count
    total_cal = sum(get_met(n) * bw * (cnt * 2.5 / 60) for n, cnt in grouped.items())
    return {"calories": round(total_cal), "duration_min": round(total_sets * 2.5), "sets_count": total_sets}


# ── Nutrition ──────────────────────────────────────────────
@app.get("/nutrition")
def get_nutrition(user: models.User = Depends(get_current_user)):
    bw = user.weight_kg or 70.0
    h = user.height_cm or 165.0
    age = user.age or 25
    gender = user.gender or "female"
    goal = user.goal or "maintain"
    activity = user.activity or "moderate"

    bmr = (10 * bw + 6.25 * h - 5 * age + 5) if gender == "male" else (10 * bw + 6.25 * h - 5 * age - 161)
    tdee = bmr * {"low": 1.375, "moderate": 1.55, "high": 1.725}.get(activity, 1.55)
    calories = round(tdee + {"lose": -300, "maintain": 0, "gain": 300}.get(goal, 0))
    protein = round(bw * (2.2 if gender == "male" else 1.8))
    fat = round(calories * 0.25 / 9)
    carbs = round((calories - protein * 4 - fat * 9) / 4)
    return {"calories": calories, "protein": protein, "fat": fat, "carbs": carbs, "water_ml": round(bw * 35)}
