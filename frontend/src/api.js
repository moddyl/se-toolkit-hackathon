const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getExercises: () => request("GET", "/exercises"),
  createExercise: (name) => request("POST", "/exercises", { name }),
  deleteExercise: (id) => request("DELETE", `/exercises/${id}`),

  getWorkouts: () => request("GET", "/workouts"),
  getWorkout: (id) => request("GET", `/workouts/${id}`),
  createWorkout: (data) => request("POST", "/workouts", data),
  deleteWorkout: (id) => request("DELETE", `/workouts/${id}`),

  addSet: (workoutId, data) => request("POST", `/workouts/${workoutId}/sets`, data),
  deleteSet: (id) => request("DELETE", `/sets/${id}`),

  getProgress: (exerciseId) => request("GET", `/progress/${exerciseId}`),

  analyseWorkout: (workoutId) => request("POST", `/workouts/${workoutId}/analyse`),
};
