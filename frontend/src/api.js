const BASE = import.meta.env.VITE_API_URL || "";

function getToken() { return localStorage.getItem("token"); }

export function getUserId() {
  const token = getToken();
  if (!token) return "anon";
  try { return JSON.parse(atob(token.split(".")[1])).sub; } catch { return "anon"; }
}

async function request(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (data) => request("POST", "/auth/register", data, false),
  login: (data) => request("POST", "/auth/login", data, false),
  getMe: () => request("GET", "/auth/me"),
  updateProfile: (data) => request("PATCH", "/auth/profile", data),

  getExercises: () => request("GET", "/exercises"),
  createExercise: (name, is_bodyweight) => request("POST", "/exercises", { name, is_bodyweight }),

  getWorkouts: () => request("GET", "/workouts"),
  getWorkout: (id) => request("GET", `/workouts/${id}`),
  createWorkout: (data) => request("POST", "/workouts", data),
  deleteWorkout: (id) => request("DELETE", `/workouts/${id}`),
  copyWorkout: (id) => request("POST", `/workouts/${id}/copy`),

  addSet: (workoutId, data) => request("POST", `/workouts/${workoutId}/sets`, data),
  deleteSet: (id) => request("DELETE", `/sets/${id}`),

  getProgress: (exerciseId) => request("GET", `/progress/${exerciseId}`),
  getRecords: () => request("GET", "/records"),
  getCalories: (workoutId, bodyWeight) => request("GET", `/workouts/${workoutId}/calories${bodyWeight ? `?body_weight=${bodyWeight}` : ""}`),
  getNutrition: () => request("GET", "/nutrition"),
};
