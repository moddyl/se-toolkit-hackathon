import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function WorkoutNew() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const workout = await api.createWorkout({ date, notes: notes || null });
      navigate(`/workout/${workout.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h1>New Workout</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Notes (optional)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Felt strong today" rows={3} />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
