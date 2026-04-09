import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await api.getWorkouts();
      setWorkouts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this workout?")) return;
    await api.deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
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
                  {new Date(w.date).toLocaleDateString("en-GB", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })}
                </Link>
                <span className="badge">{w.sets.length} sets</span>
                {w.notes && <p className="card-notes">{w.notes}</p>}
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(w.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
