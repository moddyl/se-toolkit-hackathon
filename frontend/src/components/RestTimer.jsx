import { useState, useEffect, useRef } from "react";

const PRESETS = [30, 60, 90, 120, 180];

export default function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            clearInterval(intervalRef.current);
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.start();
              setTimeout(() => osc.stop(), 300);
            } catch {}
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => { setRemaining(seconds); setRunning(true); };
  const stop = () => { setRunning(false); setRemaining(null); clearInterval(intervalRef.current); };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="timer-card">
      <div>
        <div className="timer-header">Rest Timer</div>
        <div className="timer-time" style={{ color: remaining === 0 ? "#ff4444" : "#fff" }}>
          {remaining != null ? fmt(remaining) : fmt(seconds)}
        </div>
      </div>

      <div>
        <div className="timer-header">Duration</div>
        <div className="timer-presets">
          {PRESETS.map((p) => (
            <button
              key={p}
              className={`timer-preset ${seconds === p && !running ? "active" : ""}`}
              onClick={() => { setSeconds(p); setRemaining(null); setRunning(false); }}
            >
              {p < 60 ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
        </div>
      </div>

      <div className="timer-actions">
        {!running ? (
          <button className="btn btn-primary" onClick={start}>Start</button>
        ) : (
          <button className="btn" onClick={stop}>Stop</button>
        )}
      </div>
    </div>
  );
}
