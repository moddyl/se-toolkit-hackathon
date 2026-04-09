import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Nutrition() {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getMe().then((user) => {
      setProfile(user);
      api.getNutrition().then(setData);
    }).catch(() => {
      api.getNutrition().then(setData);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-meta">Daily targets</p>
          <h1>Nutrition</h1>
        </div>
        <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
      </div>

      {!profile && (
        <div style={{ border: "0.5px solid var(--border)", padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: "13px", color: "var(--text-muted)" }}>
          Set up your <Link to="/profile" style={{ color: "var(--text)", textDecoration: "underline" }}>profile</Link> for personalized recommendations based on your gender, age and height.
        </div>
      )}

      {profile && (
        <div style={{ marginBottom: "2rem", fontSize: "13px", color: "var(--text-muted)", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <span>{profile.gender} · {profile.age} y.o. · {profile.weight_kg} kg · {profile.height_cm} cm</span>
          <span style={{ textTransform: "capitalize" }}>{profile.goal?.replace("lose","lose weight").replace("gain","gain muscle")} · {profile.activity} activity</span>
        </div>
      )}

      {data && (
        <div>
          <div className="nutrition-grid">
            <div className="nutrition-card main">
              <span className="nutrition-val">{data.calories}</span>
              <span className="nutrition-label">kcal / day</span>
            </div>
            <div className="nutrition-card">
              <span className="nutrition-val">{data.protein}g</span>
              <span className="nutrition-label">Protein</span>
            </div>
            <div className="nutrition-card">
              <span className="nutrition-val">{data.carbs}g</span>
              <span className="nutrition-label">Carbs</span>
            </div>
            <div className="nutrition-card">
              <span className="nutrition-val">{data.fat}g</span>
              <span className="nutrition-label">Fat</span>
            </div>
          </div>

          <div style={{ marginTop: "2rem", borderTop: "0.5px solid var(--border)", paddingTop: "1.5rem" }}>
            <p className="page-meta" style={{ marginBottom: "6px" }}>Recommended water intake</p>
            <p style={{ fontSize: "26px", fontWeight: "500" }}>{data.water_ml} <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "400" }}>ml / day</span></p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", letterSpacing: "0.05em" }}>≈ {Math.round(data.water_ml / 250)} glasses of 250 ml</p>
          </div>
        </div>
      )}
    </div>
  );
}
