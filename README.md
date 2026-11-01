# 🕵️ AI Mystery Room

An AI-powered procedural detective deduction web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, and the **Google Gemini API**.

---

## 🌟 Key Features

- **Procedural Mystery Generation**: Every case is uniquely woven by Google Gemini based on player premises and selected difficulty tier.
- **Strict Information Security**: Culprit identity and full crime solution are held strictly on the server and redacted until the player formally submits an accusation.
- **Tiered Difficulty Engine**:
  - **Easy**: 3 Suspects, 5 Clues, 2 Hints (+100 Base Points)
  - **Medium**: 4 Suspects, 7 Clues, 3 Hints (+150 Base Points)
  - **Hard**: 5 Suspects, 9 Clues, 3 Hints (+200 Base Points)
- **Interactive Forensic Investigation**:
  - Suspect dossier interrogation (names, occupations, alibis, motives, demeanor).
  - Evidence locker with examinable physical clues (+5 pts per discovered clue).
  - Informant hotline with progressive hint lifelines (-10 pts per hint used).
- **Certified Scoring Engine**:
  - Accusation reward + Clues discovered bonus - Informant hints penalty (with 0 minimum floor).
- **Dramatic Case Closed Debriefing**:
  - Triumphant verdict banner, culprit reveal, and full chronological breakdown of how the crime was committed and solved.

---

## 🏗️ Project Architecture

```
ai-mystery-room/
├── spec.md                   # Full production specification blueprint
├── ASSIGNMENT_GUIDE.md       # Original assignment requirements & rubric
├── package.json              # Root workspace orchestrator
├── server/                   # Backend Express & Gemini API
│   ├── src/
│   │   ├── config/db.js      # MongoDB & In-Memory fallback connection
│   │   ├── models/Case.js    # Mongoose Case, Suspect, Clue, Hint schemas
│   │   ├── routes/caseRoutes.js # REST API endpoints
│   │   ├── services/geminiService.js # Gemini prompt & Zod validation
│   │   └── index.js          # Express app entry point
│   ├── .env
│   └── package.json
└── client/                   # Frontend React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/Navbar.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── CreateMysteryPage.jsx
    │   │   ├── InvestigationRoomPage.jsx
    │   │   ├── AccusationPage.jsx
    │   │   └── ResultsPage.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

In the root directory, run:
```bash
npm run install:all
```
*(Or install separately inside `server` and `client`)*:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```
> *Note: If `MONGODB_URI` is omitted or unavailable, the backend automatically initializes an in-memory MongoDB instance for instant zero-config testing!*

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🛡️ API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cases` | Generate mystery via Gemini & save |
| `GET` | `/api/cases` | List recent cases |
| `GET` | `/api/cases/:id` | Fetch active case (culprit & solution redacted) |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Examine clue (+5 pts) |
| `POST` | `/api/cases/:id/hints` | Unlock next hint (-10 pts) |
| `POST` | `/api/cases/:id/accuse` | Submit accusation, evaluate & reveal verdict |
| `GET` | `/api/cases/:id/result` | Retrieve finalized case results |

---

## 🚢 Deployment Guide

- **Backend (Render / Railway / Heroku)**:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node src/index.js`
  - Set environment variables: `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`.
- **Frontend (Vercel / Netlify)**:
  - Root directory: `client`
  - Framework preset: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

