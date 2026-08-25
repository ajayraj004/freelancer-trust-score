# Freelancer Trust Score System 🛡️

A premium, AI-driven marketplace where reputation is the core currency. Built with the **MERN (MongoDB, Express, React, Node.js)** stack.

## 🚀 Concept
This platform solves the trust gap in freelancing by using an **Autonomous Trust Score System**. Unlike traditional platforms where ratings can be easily manipulated, our system calculates scores based on a composite analysis of multiple behavioral and performance metrics.

---

## 🧠 Trust Score Algorithm (The "AI" Logic)
The core intelligence resides in the `Freelancer` model. Every time a project is completed or a review is added, the score is recalculated using the following weighted factors:

1. **Work Quality (40%)**: Derived from the average rating.
2. **Platform Reliability (20%)**: Based on the volume of successfully completed past work.
3. **Behavioral Scan (30%)**: A score (0-100) that tracks submission speed, milestone adherence, and cancellation rates.
4. **Volume of Proof (10%)**: Number of verified reviews provided by unique clients.

**Formula Overview:**
`Score = (Rating/5 * 40) + (WorkCount/50 * 20) + (Behavior/100 * 30) + (ReviewCount/50 * 10)`

---

## 🎨 Premium Features & UI
- **Glassmorphism Design**: Sleek dark-mode interface with translucent cards and neon glows.
- **Dynamic Visualizations**: Real-time SVG Gauges for Trust Scores and Chart.js for reputation trends.
- **Interactive Dashboards**: Detailed metrics breakdown for freelancers and search tools for clients.
- **Responsive Layout**: Optimized for both desktop and mobile views.

---

## 🛠️ Project Structure
```bash
├── client/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/  # TrustGauge, FreelancerCard, Navbar
│   │   ├── pages/       # Home, Dashboard, Profile, Auth
│   │   └── utils/       # API Axios instance
├── server/              # Node.js + Express Backend
│   ├── models/          # Mongoose Schemas (User, Freelancer, Review)
│   ├── routes/          # API Endpoints
│   └── seed.js          # Initial Database Populator
```

## ⚡ How to Run
1. **Prerequisites**: Ensure MongoDB and Node.js are installed.
2. **Start Backend**:
   - `cd server`
   - `npm run dev` (or `node index.js`)
3. **Seed Data**:
   - `node seed.js` (to populate initial top-rated freelancers)
4. **Start Frontend**:
   - `cd client`
   - `npm run dev`
   - Open `http://localhost:5173`

---

**Note**: For demo purposes, the frontend is equipped with fallback mock data so it remains fully functional even without a live MongoDB connection.
