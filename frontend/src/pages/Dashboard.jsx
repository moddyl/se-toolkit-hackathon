import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, getUserId } from "../api";

const MOTIVATIONS = [
  "Every rep counts.", "Progress, not perfection.",
  "Show up. That's half the battle.", "Strong body, strong mind.",
  "You showed up. That matters.", "One more set.",
];

const tiles = [
  { to: "/workouts", icon: "◈", label: "Workouts", desc: "Log your sessions" },
  { to: "/progress", icon: "◎", label: "Progress", desc: "Charts & trends" },
  { to: "/records", icon: "◆", label: "Records", desc: "Personal bests" },
  { to: "/water", icon: "◉", label: "Water", desc: "Daily hydration" },
  { to: "/nutrition", icon: "◇", label: "Nutrition", desc: "Calories & macros" },
  { to: "/workout/new", icon: "+", label: "New Workout", desc: "Start training now" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastWorkout, setLastWorkout] = useState(null);
  const [waterToday, setWaterToday] = useState(0);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getMe().then(setProfile).catch(() => {});
    api.getWorkouts().then((w) => { if (w.length > 0) setLastWorkout(w[0]); });
    const today = new Date().toISOString().split("T")[0];
    const uid = getUserId();
    setWaterToday(JSON.parse(localStorage.getItem(`water_${uid}_${today}`) || "0"));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = profile?.name ? `, ${profile.name}` : "";
  const motivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length];

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      {/* Hero */}
      <div className="dash-hero">
        <p className="page-meta">{today}</p>
        <h1 className="dash-greeting">{greeting}{name}</h1>
        <p className="dash-motivation">{motivation}</p>

        {!profile && (
          <Link to="/profile" className="dash-setup-hint">
            Set up your profile to get personalized stats →
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat-val">{waterToday}<span className="dash-stat-unit"> / 8</span></span>
          <span className="dash-stat-label">glasses today</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-val">
            {lastWorkout
              ? new Date(lastWorkout.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              : "—"}
          </span>
          <span className="dash-stat-label">last workout</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-val">{lastWorkout ? lastWorkout.sets.length : "—"}</span>
          <span className="dash-stat-label">sets last session</span>
        </div>
      </div>

      {/* Tiles */}
      <div className="dash-grid">
        {tiles.map((t) => (
          <button key={t.to} className="dash-tile" onClick={() => navigate(t.to)}>
            <span className="dash-tile-icon">{t.icon}</span>
            <span className="dash-tile-label">{t.label}</span>
            <span className="dash-tile-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
