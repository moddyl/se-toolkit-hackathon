from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
import os
from openai import OpenAI

import models, schemas
from database import engine, get_db

QWEN_BASE_URL = os.getenv("QWEN_BASE_URL", "http://localhost:42005/v1")
QWEN_API_KEY = os.getenv("QWEN_CODE_API_KEY", "dummy")
QWEN_MODEL = os.getenv("QWEN_MODEL", "coder-model")

qwen_client = OpenAI(base_url=QWEN_BASE_URL, api_key=QWEN_API_KEY)

models.Base.metadata.create_all(bind=engine)

DEFAULT_EXERCISES = [
    "Bench Press", "Squat", "Deadlift", "Overhead Press",
    "Barbell Row", "Pull-Up", "Dip", "Bicep Curl",
    "Tricep Pushdown", "Leg Press", "Lat Pulldown",
    "Incline Bench Press", "Romanian Deadlift", "Lunges",
    "Face Pull", "Cable Fly", "Plank",
]

def seed_exercises():
    db = next(get_db())
    for name in DEFAULT_EXERCISES:
        exists = db.query(models.Exercise).filter(models.Exercise.name == name).first()
        if not exists:
            db.add(models.Exercise(name=name))
    db.commit()
    db.close()

seed_exercises()

app = FastAPI(title="FitLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exercises ──────────────────────────────────────────────
@app.get("/exercises", response_model=List[schemas.ExerciseOut])
def get_exercises(db: Session = Depends(get_db)):
    return db.query(models.Exercise).all()


@app.post("/exercises", response_model=schemas.ExerciseOut, status_code=201)
def create_exercise(body: schemas.ExerciseCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Exercise).filter(models.Exercise.name == body.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exercise already exists")
    exercise = models.Exercise(name=body.name)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@app.delete("/exercises/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    db.delete(exercise)
    db.commit()


# ── Workouts ───────────────────────────────────────────────
@app.get("/workouts", response_model=List[schemas.WorkoutOut])
def get_workouts(db: Session = Depends(get_db)):
    return db.query(models.Workout).order_by(models.Workout.date.desc()).all()


@app.get("/workouts/{workout_id}", response_model=schemas.WorkoutOut)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@app.post("/workouts", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(body: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    workout = models.Workout(date=body.date, notes=body.notes)
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@app.delete("/workouts/{workout_id}", status_code=204)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(workout)
    db.commit()


# ── Sets ───────────────────────────────────────────────────
@app.post("/workouts/{workout_id}/sets", response_model=schemas.SetOut, status_code=201)
def add_set(workout_id: int, body: schemas.SetCreate, db: Session = Depends(get_db)):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    exercise = db.query(models.Exercise).filter(models.Exercise.id == body.exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    s = models.WorkoutSet(
        workout_id=workout_id,
        exercise_id=body.exercise_id,
        reps=body.reps,
        weight_kg=body.weight_kg,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@app.delete("/sets/{set_id}", status_code=204)
def delete_set(set_id: int, db: Session = Depends(get_db)):
    s = db.query(models.WorkoutSet).filter(models.WorkoutSet.id == set_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Set not found")
    db.delete(s)
    db.commit()


# ── Progress ───────────────────────────────────────────────
@app.get("/progress/{exercise_id}", response_model=List[schemas.ProgressPoint])
def get_progress(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    rows = (
        db.query(
            models.Workout.date,
            func.max(models.WorkoutSet.weight_kg).label("max_weight"),
            func.sum(models.WorkoutSet.weight_kg * models.WorkoutSet.reps).label("total_volume"),
        )
        .join(models.WorkoutSet, models.WorkoutSet.workout_id == models.Workout.id)
        .filter(models.WorkoutSet.exercise_id == exercise_id)
        .group_by(models.Workout.date)
        .order_by(models.Workout.date)
        .all()
    )

    return [
        schemas.ProgressPoint(date=r.date, max_weight=r.max_weight, total_volume=r.total_volume)
        for r in rows
    ]


# ── AI Analysis ────────────────────────────────────────────
@app.post("/workouts/{workout_id}/analyse")
def analyse_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    if not workout.sets:
        raise HTTPException(status_code=400, detail="Workout has no sets to analyse")

    # Build a summary of the workout
    grouped = {}
    for s in workout.sets:
        name = s.exercise.name
        if name not in grouped:
            grouped[name] = []
        grouped[name].append(f"{s.weight_kg}kg x {s.reps} reps")

    workout_summary = f"Date: {workout.date}\n"
    for exercise, sets in grouped.items():
        workout_summary += f"- {exercise}: {', '.join(sets)}\n"

    # Get recent history for context (last 5 workouts with same exercises)
    exercise_ids = list({s.exercise_id for s in workout.sets})
    recent = (
        db.query(models.Workout)
        .join(models.WorkoutSet)
        .filter(models.WorkoutSet.exercise_id.in_(exercise_ids))
        .filter(models.Workout.id != workout_id)
        .order_by(models.Workout.date.desc())
        .limit(5)
        .all()
    )

    history_text = ""
    if recent:
        history_text = "\nRecent workout history for context:\n"
        for w in recent:
            history_text += f"\n{w.date}:\n"
            for s in w.sets:
                if s.exercise_id in exercise_ids:
                    history_text += f"  - {s.exercise.name}: {s.weight_kg}kg x {s.reps} reps\n"

    prompt = f"""You are a personal fitness coach. Analyse this workout and give short, practical feedback.

Today's workout:
{workout_summary}
{history_text}

Give a concise analysis (3-5 sentences) covering:
1. Overall assessment of today's session
2. Any progress or regressions compared to history (if available)
3. One specific recommendation for the next session

Be encouraging but honest. Keep it brief and actionable."""

    try:
        response = qwen_client.chat.completions.create(
            model=QWEN_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        analysis = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    return {"analysis": analysis}
