import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../api";

export default function Progress() {
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getExercises().then((ex) => {
      setExercises(ex);
      if (ex.length > 0) setSelectedId(ex[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api.getProgress(selectedId).then((pts) => {
      setData(pts.map((p) => ({
        date: p.date,
        "Max Weight (kg)": p.max_weight,
        "Volume (kg)": Math.round(p.total_volume),
      })));
      setLoading(false);
    });
  }, [selectedId]);

  return (
    <div>
      <h1>Progress</h1>

      {exercises.length === 0 ? (
        <p className="status">No exercises yet. Log a workout first!</p>
      ) : (
        <>
          <div className="select-row">
            <label>Exercise</label>
            <select value={selectedId || ""} onChange={(e) => setSelectedId(Number(e.target.value))}>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="status">Loading...</p>
          ) : data.length < 2 ? (
            <p className="status">Log at least 2 workouts with this exercise to see a chart.</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#aaa", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid #444" }} />
                  <Legend />
                  <Line type="monotone" dataKey="Max Weight (kg)" stroke="#6ee7b7" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="Volume (kg)" stroke="#818cf8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
