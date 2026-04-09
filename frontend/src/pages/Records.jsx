import { useEffect, useState } from "react";
import { api } from "../api";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">Loading...</p>;

  return (
    <div>
      <h1>🏆 Personal Records</h1>
      {records.length === 0 ? (
        <p className="status">No records yet. Log a workout first!</p>
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          {records.map((r, i) => (
            <div key={r.exercise} className="record-card">
              <div className="record-rank">#{i + 1}</div>
              <div className="record-body">
                <div className="record-name">{r.exercise}</div>
                <div className="record-stats">
                  <span className="record-badge">🏋️ {r.max_weight} kg</span>
                  <span className="record-badge">🔁 {r.max_reps} reps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
