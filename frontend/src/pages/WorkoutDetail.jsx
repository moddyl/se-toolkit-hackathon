import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, getUserId } from "../api";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calories, setCalories] = useState(null);
  const [bodyWeight, setBodyWeight] = useState(() => Number(localStorage.getItem(`bodyWeight_${getUserId()}`) || 70));

  const [exerciseId, setExerciseId] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newIsBodyweight, setNewIsBodyweight] = useState(false);
  const [reps, setReps] = useState("");
  const [setsCount, setSetsCount] = useState("3");
  const [weight, setWeight] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    Promise.all([api.getWorkout(Number(id)), api.getExercises()])
      .then(([w, ex]) => {
        setWorkout(w);
        setExercises(ex);
        if (ex.length > 0) setExerciseId(String(ex[0].id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (workout && workout.sets.length > 0) {
      api.getCalories(workout.id, bodyWeight).then(setCalories);
    }
  }, [workout, bodyWeight]);

  const selectedExercise = exercises.find((e) => String(e.id) === exerciseId);
  const isBodyweight = selectedExercise?.is_bodyweight || false;

  const handleAddSet = async (e) => {
    e.preventDefault();
    setFormError(null);
    setAddingSet(true);
    try {
      let eid = Number(exerciseId);
      if (exerciseId === "__new__") {
        if (!newExerciseName.trim()) { setFormError("Enter exercise name"); setAddingSet(false); return; }
        const created = await api.createExercise(newExerciseName.trim(), newIsBodyweight);
        setExercises((prev) => [...prev, created]);
        setExerciseId(String(created.id));
        eid = created.id;
        setNewExerciseName("");
      }
      const wkg = isBodyweight ? bodyWeight : Number(weight);
      await api.addSet(workout.id, { exercise_id: eid, reps: Number(reps), sets_count: Number(setsCount), weight_kg: wkg });
      const updated = await api.getWorkout(workout.id);
      setWorkout(updated);
      setReps("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAddingSet(false);
    }
  };

  const handleDeleteSet = async (setId) => {
    await api.deleteSet(setId);
    setWorkout((prev) => ({ ...prev, sets: prev.sets.filter((s) => s.id !== setId) }));
  };

  const handleBodyWeightChange = (val) => {
    setBodyWeight(val);
    localStorage.setItem(`bodyWeight_${getUserId()}`, val);
  };

  if (loading) return <p className="status">Loading...</p>;
  if (error) return <p className="status error">{error}</p>;

  const grouped = workout.sets.reduce((acc, s) => {
    const name = s.exercise.name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/workouts" className="back-link">← Workouts</Link>
          <h1 style={{ marginTop: "0.5rem" }}>
            {new Date(workout.date + "T00:00:00").toLocaleDateString("en-GB", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </h1>
          {workout.notes && <p className="notes">{workout.notes}</p>}
        </div>
      </div>

      {calories && calories.sets_count > 0 && (
        <div className="calories-card">
          <div className="calories-stat">
            <span className="calories-value">{calories.calories}</span>
            <span className="calories-label">kcal</span>
          </div>
          <div className="calories-stat">
            <span className="calories-value">{calories.duration_min}</span>
            <span className="calories-label">min</span>
          </div>
          <div className="calories-stat">
            <span className="calories-value">{calories.sets_count}</span>
            <span className="calories-label">sets</span>
          </div>
          <div className="calories-weight">
            <label>
              Your weight
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input type="number" min="30" max="200" value={bodyWeight}
                  onChange={(e) => handleBodyWeightChange(Number(e.target.value))} style={{ width: "56px" }} />
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>kg</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <p className="status">No exercises yet. Add your first set below.</p>
      ) : (
        Object.entries(grouped).map(([name, sets]) => (
          <div key={name} className="exercise-block">
            <h3>{name}{sets[0].exercise.is_bodyweight && <span className="bw-badge">bodyweight</span>}</h3>
            <table className="sets-table">
              <thead>
                <tr><th>#</th><th>Sets × Reps</th><th>Weight</th><th></th></tr>
              </thead>
              <tbody>
                {sets.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td>{s.sets_count} × {s.reps}</td>
                    <td>{s.exercise.is_bodyweight ? "BW" : `${s.weight_kg} kg`}</td>
                    <td><button className="btn-icon" onClick={() => handleDeleteSet(s.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <div className="form-card">
        <h3>Add Exercise</h3>
        <form onSubmit={handleAddSet} className="inline-form">
          <label>
            Exercise
            <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
              <optgroup label="Weighted">
                {exercises.filter(ex => !ex.is_bodyweight).map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </optgroup>
              <optgroup label="Bodyweight">
                {exercises.filter(ex => ex.is_bodyweight).map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </optgroup>
              <option value="__new__">+ New exercise</option>
            </select>
          </label>

          {exerciseId === "__new__" && (
            <>
              <label>
                Name
                <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="e.g. Cable Row" />
              </label>
              <label style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" checked={newIsBodyweight} onChange={(e) => setNewIsBodyweight(e.target.checked)} style={{ width: "auto", padding: 0 }} />
                Bodyweight exercise
              </label>
            </>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>
              Sets
              <input type="number" min="1" max="20" value={setsCount} onChange={(e) => setSetsCount(e.target.value)} required />
            </label>
            <label>
              Reps
              <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} required />
            </label>
          </div>

          {!isBodyweight && exerciseId !== "__new__" && (
            <label>
              Weight (kg)
              <input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </label>
          )}

          {isBodyweight && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              Using your body weight: {bodyWeight} kg
            </p>
          )}

          {formError && <p className="error">{formError}</p>}
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={addingSet}>
              {addingSet ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
