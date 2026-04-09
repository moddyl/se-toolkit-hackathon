# FitLog

A web app that lets users log their workouts and instantly see their progress through clean statistics and charts.

## Demo

> Screenshots go here after first deploy

## Product Context

**End users:** Gym-goers, runners, and home athletes who want to track their training progress without paying for expensive fitness apps.

**Problem:** Most people don't track their workouts consistently because existing tools are too complex or expensive.

**Solution:** FitLog provides a simple workout diary that automatically shows key stats — personal records per exercise, total weekly volume, and progress charts — so the user always knows if they're improving.

## Features

### Implemented
- Create workouts with a date and optional notes
- Add sets to a workout (exercise, weight, reps)
- Create new exercises on the fly
- View all workouts sorted by date
- Delete workouts and individual sets
- Progress charts: max weight and total volume per exercise over time

### Not yet implemented
- User authentication
- Personal records leaderboard
- Weekly activity heatmap
- Mobile-optimised layout

## Usage

### Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# set DATABASE_URL in .env first
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

API docs available at: `http://localhost:8000/docs`

## Deployment

### Requirements
- OS: Ubuntu 24.04
- Docker and Docker Compose installed

### Install Docker on Ubuntu 24.04
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

### Step-by-step deployment

1. Clone the repository:
```bash
git clone https://github.com/<your-username>/se-toolkit-hackathon.git
cd se-toolkit-hackathon
```

2. Set the API URL so the frontend knows where to reach the backend.
   Edit `frontend/vite.config.js` or set the env variable before building:
```bash
export VITE_API_URL=http://<your-server-ip>:8000
```

3. Build and start all services:
```bash
docker compose up --build -d
```

4. Check everything is running:
```bash
docker compose ps
```

5. Open in browser:
   - Frontend: `http://<your-server-ip>:3000`
   - API docs: `http://<your-server-ip>:8000/docs`

### Stop the app
```bash
docker compose down
```

### Stop and delete all data
```bash
docker compose down -v
```
