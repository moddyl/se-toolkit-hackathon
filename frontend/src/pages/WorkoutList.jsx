import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getWorkouts()
      .then(setWorkouts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this workout?")) return;
    await api.deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCopy = async (id) => {
    const newWorkout = await api.copyWorkout(id);
    navigate(`/workout/${newWorkout.id}`);
  };

  if (loading) return <p className="status">Loading...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Workouts</h1>
        <Link to="/workout/new" className="btn btn-primary">+ New Workout</Link>
      </div>

      {workouts.length === 0 ? (
        <p className="status">No workouts yet. Add your first one!</p>
      ) : (
        <ul className="card-list">
          {workouts.map((w) => (
            <li key={w.id} className="card">
              <div className="card-body">
                <Link to={`/workout/${w.id}`} className="card-title">
                  {new Date(w.date + "T00:00:00").toLocaleDateString("en-GB", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })}
                </Link>
                <span className="badge">{w.sets.length} sets</span>
                {w.notes && <p className="card-notes">{w.notes}</p>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-secondary" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => handleCopy(w.id)} title="Copy to today">📋</button>
                <button className="btn btn-danger" onClick={() => handleDelete(w.id)}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
