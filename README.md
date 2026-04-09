# FitLog

A web app that lets users log their workouts and instantly see their progress through clean statistics and charts.

## Demo

> Add screenshots here after deployment

## Product Context

**End users:** Gym-goers, runners, and home athletes who want to track their training progress without paying for expensive fitness apps.

**Problem:** Most people don't track their workouts consistently because existing tools are too complex or expensive.

**Solution:** FitLog provides a simple workout diary with progress charts, personal records, calorie estimation, water tracker, and nutrition targets — all personalised by gender, age and weight.

## Features

### Implemented
- User authentication and registration
- Dashboard with quick stats and navigation tiles
- Create workouts with date and optional notes
- Add exercises (weighted and bodyweight) with sets × reps format
- 17 pre-loaded exercises, create custom ones
- Progress charts: max weight and total volume over time
- Personal records — best weight and reps per exercise
- Calorie estimation based on workout volume and body weight
- Water tracker — daily glasses with progress bar
- Nutrition page — daily КБЖУ targets using Mifflin-St Jeor formula, personalised by gender
- User profile — name, gender, age, weight, height, goal, activity level
- Copy workout to today
- Minimal black-and-white design

### Not yet implemented
- Weekly activity heatmap
- Mobile-optimised layout
- Push notifications / reminders

## Usage

Open the app at `http://<your-server-ip>:3000` and:

1. Go to **Profile** → fill in your name, gender, age, weight, height, goal
2. Go to **Workouts** → create a new workout
3. Add exercises — choose from the list or create your own
4. View **Progress** charts after logging 2+ workouts with the same exercise
5. Check **Records** for your personal bests
6. Track daily water intake in **Water**
7. See your daily calorie and macro targets in **Nutrition**

API docs available at: `http://<your-server-ip>:8000/docs`

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
git clone https://github.com/moddyl/se-toolkit-hackathon.git
cd se-toolkit-hackathon
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Build and start all services:
```bash
docker compose up --build -d
```

4. Open in browser:
   - Frontend: `http://10.93.24.140:3000`
   - API docs: `http://10.93.24.140:8000/docs`

### Stop
```bash
docker compose down
```

### Reset all data
```bash
docker compose down -v
```
