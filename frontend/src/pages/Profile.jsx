import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", gender: "female", age: "", weight_kg: "", height_cm: "", goal: "maintain", activity: "moderate" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then(user => {
      setForm({
        name: user.name || "",
        gender: user.gender || "female",
        age: user.age || "",
        weight_kg: user.weight_kg || "",
        height_cm: user.height_cm || "",
        goal: user.goal || "maintain",
        activity: user.activity || "moderate",
      });
    }).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    await api.updateProfile({
      name: form.name || null,
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      goal: form.goal,
      activity: form.activity,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("/"); }, 1000);
  };

  if (loading) return <p className="status">Loading...</p>;

  return (
    <div className="form-page" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p className="page-meta">Settings</p>
        <h1>Your Profile</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave}>
          <label>
            Name
            <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sveta" />
          </label>

          <label style={{ marginBottom: "0.5rem" }}>Gender</label>
          <div style={{ display: "flex", gap: "1px", background: "var(--border)", marginBottom: "1.1rem" }}>
            {["female", "male"].map(g => (
              <button key={g} type="button"
                style={{ flex: 1, padding: "8px", background: form.gender === g ? "var(--text)" : "var(--bg)", color: form.gender === g ? "var(--bg)" : "var(--text-muted)", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.15s" }}
                onClick={() => set("gender", g)}>{g}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <label>Age<input type="number" min="10" max="100" value={form.age} onChange={e => set("age", e.target.value)} placeholder="25" /></label>
            <label>Weight (kg)<input type="number" min="30" max="250" value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)} placeholder="60" /></label>
            <label>Height (cm)<input type="number" min="100" max="250" value={form.height_cm} onChange={e => set("height_cm", e.target.value)} placeholder="165" /></label>
          </div>

          <label>
            Goal
            <select value={form.goal} onChange={e => set("goal", e.target.value)}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain muscle</option>
            </select>
          </label>

          <label>
            Activity level
            <select value={form.activity} onChange={e => set("activity", e.target.value)}>
              <option value="low">Low (1–2x/week)</option>
              <option value="moderate">Moderate (3–4x/week)</option>
              <option value="high">High (5+x/week)</option>
            </select>
          </label>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">{saved ? "Saved!" : "Save Profile"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
