import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import WorkoutList from "./pages/WorkoutList";
import WorkoutNew from "./pages/WorkoutNew";
import WorkoutDetail from "./pages/WorkoutDetail";
import Progress from "./pages/Progress";
import "./index.css";

function Nav() {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <Link
      to={to}
      className={`nav-link ${pathname === to ? "active" : ""}`}
    >
      {label}
    </Link>
  );
  return (
    <nav className="navbar">
      <span className="logo">💪 FitLog</span>
      <div className="nav-links">
        {link("/", "Workouts")}
        {link("/progress", "Progress")}
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
          <Route path="/" element={<WorkoutList />} />
          <Route path="/workout/new" element={<WorkoutNew />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
