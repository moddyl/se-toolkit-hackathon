import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [exerciseId, setExerciseId] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [formError, setFormError] = useState(null);

  // AI analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const load = async () => {
    try {
      const [w, ex] = await Promise.all([api.getWorkout(Number(id)), api.getExercises()]);
      setWorkout(w);
      setExercises(ex);
      if (ex.length > 0) setExerciseId(String(ex[0].id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddSet = async (e) => {
    e.preventDefault();
    setFormError(null);
    setAddingSet(true);
    try {
      let eid = Number(exerciseId);

      if (exerciseId === "__new__") {
        if (!newExerciseName.trim()) { setFormError("Enter exercise name"); setAddingSet(false); return; }
        const created = await api.createExercise(newExerciseName.trim());
        setExercises((prev) => [...prev, created]);
        setExerciseId(String(created.id));
        eid = created.id;
        setNewExerciseName("");
      }

      await api.addSet(workout.id, { exercise_id: eid, reps: Number(reps), weight_kg: Number(weight) });
      const updated = await api.getWorkout(workout.id);
      setWorkout(updated);
      setReps("");
      setWeight("");
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

  const handleAnalyse = async () => {
    setAnalysing(true);
    setAnalysis(null);
    setAnalysisError(null);
    try {
      const result = await api.analyseWorkout(workout.id);
      setAnalysis(result.analysis);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalysing(false);
    }
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
          <Link to="/" className="back-link">← Workouts</Link>
          <h1>{new Date(workout.date).toLocaleDateString("en-GB", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}</h1>
          {workout.notes && <p className="notes">{workout.notes}</p>}
        </div>
        {workout.sets.length > 0 && (
          <button className="btn btn-ai" onClick={handleAnalyse} disabled={analysing}>
            {analysing ? "⏳ Analysing..." : "🤖 Analyse with AI"}
          </button>
        )}
      </div>

      {/* AI Analysis result */}
      {analysis && (
        <div className="ai-card">
          <div className="ai-card-header">🤖 AI Coach Feedback</div>
          <p>{analysis}</p>
        </div>
      )}
      {analysisError && (
        <div className="ai-card ai-card-error">
          <div className="ai-card-header">⚠️ AI unavailable</div>
          <p>{analysisError}</p>
        </div>
      )}

      {/* Sets table */}
      {Object.keys(grouped).length === 0 ? (
        <p className="status">No sets yet. Add your first set below!</p>
      ) : (
        Object.entries(grouped).map(([name, sets]) => (
          <div key={name} className="exercise-block">
            <h3>{name}</h3>
            <table className="sets-table">
              <thead>
                <tr><th>#</th><th>Weight (kg)</th><th>Reps</th><th></th></tr>
              </thead>
              <tbody>
                {sets.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>{s.weight_kg}</td>
                    <td>{s.reps}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDeleteSet(s.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Add set form */}
      <div className="form-card">
        <h3>Add Set</h3>
        <form onSubmit={handleAddSet} className="inline-form">
          <label>
            Exercise
            <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
              <option value="__new__">+ New exercise</option>
            </select>
          </label>

          {exerciseId === "__new__" && (
            <label>
              Exercise name
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g. Bench Press"
              />
            </label>
          )}

          <label>
            Weight (kg)
            <input type="number" min="0" step="0.5" value={weight}
              onChange={(e) => setWeight(e.target.value)} required />
          </label>

          <label>
            Reps
            <input type="number" min="1" value={reps}
              onChange={(e) => setReps(e.target.value)} required />
          </label>

          {formError && <p className="error">{formError}</p>}

          <button type="submit" className="btn btn-primary" disabled={addingSet}>
            {addingSet ? "Adding..." : "Add Set"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [exerciseId, setExerciseId] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [addingSet, setAddingSet] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = async () => {
    try {
      const [w, ex] = await Promise.all([api.getWorkout(Number(id)), api.getExercises()]);
      setWorkout(w);
      setExercises(ex);
      if (ex.length > 0) setExerciseId(String(ex[0].id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddSet = async (e) => {
    e.preventDefault();
    setFormError(null);
    setAddingSet(true);
    try {
      let eid = Number(exerciseId);

      // create exercise on-the-fly if needed
      if (exerciseId === "__new__") {
        if (!newExerciseName.trim()) { setFormError("Enter exercise name"); setAddingSet(false); return; }
        const created = await api.createExercise(newExerciseName.trim());
        setExercises((prev) => [...prev, created]);
        setExerciseId(String(created.id));
        eid = created.id;
        setNewExerciseName("");
      }

      await api.addSet(workout.id, { exercise_id: eid, reps: Number(reps), weight_kg: Number(weight) });
      const updated = await api.getWorkout(workout.id);
      setWorkout(updated);
      setReps("");
      setWeight("");
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
          <Link to="/" className="back-link">← Workouts</Link>
          <h1>{new Date(workout.date).toLocaleDateString("en-GB", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}</h1>
          {workout.notes && <p className="notes">{workout.notes}</p>}
        </div>
      </div>

      {/* Sets table */}
      {Object.keys(grouped).length === 0 ? (
        <p className="status">No sets yet. Add your first set below!</p>
      ) : (
        Object.entries(grouped).map(([name, sets]) => (
          <div key={name} className="exercise-block">
            <h3>{name}</h3>
            <table className="sets-table">
              <thead>
                <tr><th>#</th><th>Weight (kg)</th><th>Reps</th><th></th></tr>
              </thead>
              <tbody>
                {sets.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>{s.weight_kg}</td>
                    <td>{s.reps}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDeleteSet(s.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Add set form */}
      <div className="form-card">
        <h3>Add Set</h3>
        <form onSubmit={handleAddSet} className="inline-form">
          <label>
            Exercise
            <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
              <option value="__new__">+ New exercise</option>
            </select>
          </label>

          {exerciseId === "__new__" && (
            <label>
              Exercise name
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g. Bench Press"
              />
            </label>
          )}

          <label>
            Weight (kg)
            <input type="number" min="0" step="0.5" value={weight}
              onChange={(e) => setWeight(e.target.value)} required />
          </label>

          <label>
            Reps
            <input type="number" min="1" value={reps}
              onChange={(e) => setReps(e.target.value)} required />
          </label>

          {formError && <p className="error">{formError}</p>}

          <button type="submit" className="btn btn-primary" disabled={addingSet}>
            {addingSet ? "Adding..." : "Add Set"}
          </button>
        </form>
      </div>
    </div>
  );
}
