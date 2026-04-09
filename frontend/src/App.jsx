import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import WorkoutList from "./pages/WorkoutList";
import WorkoutNew from "./pages/WorkoutNew";
import WorkoutDetail from "./pages/WorkoutDetail";
import Progress from "./pages/Progress";
import Records from "./pages/Records";
import Water from "./pages/Water";
import Nutrition from "./pages/Nutrition";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./index.css";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { pathname } = useLocation();
  const isAuth = !!localStorage.getItem("token");
  if (!isAuth || pathname === "/login" || pathname === "/register") return null;

  const link = (to, label) => (
    <Link to={to} className={`nav-link ${pathname === to ? "active" : ""}`}>{label}</Link>
  );

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">FITLOG</Link>
      <div className="nav-links">
        {link("/workouts", "Workouts")}
        {link("/progress", "Progress")}
        {link("/records", "Records")}
        {link("/water", "Water")}
        {link("/nutrition", "Nutrition")}
        {link("/profile", "Profile")}
        <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/workouts" element={<PrivateRoute><WorkoutList /></PrivateRoute>} />
          <Route path="/workout/new" element={<PrivateRoute><WorkoutNew /></PrivateRoute>} />
          <Route path="/workout/:id" element={<PrivateRoute><WorkoutDetail /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
          <Route path="/records" element={<PrivateRoute><Records /></PrivateRoute>} />
          <Route path="/water" element={<PrivateRoute><Water /></PrivateRoute>} />
          <Route path="/nutrition" element={<PrivateRoute><Nutrition /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
