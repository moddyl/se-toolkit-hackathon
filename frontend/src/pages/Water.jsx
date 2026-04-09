import { useState, useEffect } from "react";
import { getUserId } from "../api";

const GOAL = 8;

export default function Water() {
  const today = new Date().toISOString().split("T")[0];
  const key = `water_${getUserId()}_${today}`;
  const [glasses, setGlasses] = useState(() => JSON.parse(localStorage.getItem(key) || "0"));

  useEffect(() => { localStorage.setItem(key, JSON.stringify(glasses)); }, [glasses]);

  const add = () => setGlasses((g) => Math.min(g + 1, 20));
  const remove = () => setGlasses((g) => Math.max(g - 1, 0));
  const pct = Math.min((glasses / GOAL) * 100, 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-meta">Today</p>
          <h1>Water Tracker</h1>
        </div>
      </div>

      <div className="water-card">
        <div className="water-count">
          <span className="water-number">{glasses}</span>
          <span className="water-goal">/ {GOAL} glasses</span>
        </div>

        <div className="water-bar-wrap">
          <div className="water-bar">
            <div className="water-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            {Math.round(glasses * 250)} ml / {GOAL * 250} ml
          </span>
        </div>

        <div className="water-glasses">
          {Array.from({ length: GOAL }).map((_, i) => (
            <div key={i} className={`water-glass ${i < glasses ? "filled" : ""}`}>
              <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="32">
                <path d="M4 4 L6 24 L18 24 L20 4 Z" stroke="currentColor" strokeWidth="1.5" fill={i < glasses ? "currentColor" : "none"} opacity={i < glasses ? "0.3" : "1"} />
                <path d="M4 4 L20 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          ))}
        </div>

        <div className="water-actions">
          <button className="btn btn-secondary" onClick={remove} disabled={glasses === 0}>− Remove</button>
          <button className="btn btn-primary" onClick={add}>+ Add glass</button>
        </div>

        {glasses >= GOAL && (
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: "1rem" }}>
            DAILY GOAL REACHED
          </p>
        )}
      </div>
    </div>
  );
}
