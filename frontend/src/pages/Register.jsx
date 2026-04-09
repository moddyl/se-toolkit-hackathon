import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.register(form);
      localStorage.setItem("token", res.access_token);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">FITLOG</h1>
        <p className="auth-sub">Create your account</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input type="text" value={form.username} onChange={e => set("username", e.target.value)} autoFocus required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} minLength={6} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
