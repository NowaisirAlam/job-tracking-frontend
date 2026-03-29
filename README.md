<div align="center">

# ⚡ Rezzap — AI-Powered Job Search Frontend

**Find jobs. Tailor your resume. Track every application.**
A sleek, production-ready frontend built with plain HTML, Tailwind CSS, and vanilla JavaScript — wired to a FastAPI backend.

---

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

</div>

---

## 📸 Screenshots

> **Home — Landing Page**
> Clean hero with a 3-step pitch: Upload → AI Finds Matches → One-Click Apply

```
┌─────────────────────────────────────────────────────────────┐
│  ⬡ Rezzap                                    Get Started   │
│                                                             │
│     Welcome.                                                │
│     Your AI job copilot is ready.                           │
│                                                             │
│     [  Upload Resume to Begin  ]                            │
│                                                             │
│   ① Upload   →   ② AI Matches   →   ③ One-Click Apply      │
└─────────────────────────────────────────────────────────────┘
```

> **Job Search — Live Results**
> Real-time job search powered by the backend. Filter by Remote/Full-time, sort by Match Score or Salary.

```
┌─────────────────────────────────────────────────────────────┐
│  ⬡ Rezzap   Job Search   Tracker   Builder   [My Account]  │
├─────────────────────────────────────────────────────────────┤
│  [ 🗂 Role or company ]  [ 📍 Location or Remote ]  [Search]│
│  ⊙ Remote   ⊙ Full-time                                     │
│                                     Sort: Best Match ∨      │
│  Recent Matches                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  F   UX Engineer                                     │  │
│  │      Figma · San Francisco · $130k–$165k             │  │
│  │      94% Match   Full-time           Posted 4h ago   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  G   Full Stack Engineer                             │  │
│  │      Google · Mountain View · $150k–$200k            │  │
│  │      91% Match   Full-time           Posted 1d ago   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

> **Application Tracker — Pipeline Dashboard**
> Manage every application with a Notion-style table. Update status with one click.

```
┌─────────────────────────────────────────────────────────────┐
│  💼 Application Tracker                                     │
│     Manage your career pipeline with precision.             │
├───────────┬──────────┬──────────────┬────────┬─────────────┤
│  Title    │ Company  │   Status     │ Salary │ Resume      │
├───────────┼──────────┼──────────────┼────────┼─────────────┤
│ UX Eng.   │ Figma    │ Interviewing │ $165k  │ [Generate]  │
│ Backend   │ Stripe   │ Submitted    │ $180k  │ [Download]  │
│ ML Eng.   │ OpenAI   │ To Apply     │ $200k  │ [Generate]  │
└───────────┴──────────┴──────────────┴────────┴─────────────┘
```

> **Document Builder — Resume Generator**
> Upload your base resume, pick a job, and generate a tailored version instantly.

```
┌──────────────────────┬──────────────────────────────────────┐
│  ATS SCORE INDICATOR │                                      │
│  ┌──────────────┐    │                                      │
│  │   87 / 100   │    │     [ Tailored Resume Preview ]      │
│  │  Strong Match│    │                                      │
│  └──────────────┘    │     John Doe                         │
│                      │     Software Engineer                │
│  SKILL MATCHER       │     ─────────────────────            │
│  ✓ React     ██████  │     Experience · Skills · Education  │
│  ✓ FastAPI   █████   │                                      │
│  ✗ Docker    ███     │                                      │
│                      │                                      │
│  RESUME              │                                      │
│  [ Upload PDF/DOCX ] │                                      │
│                      │                                      │
│  [ Generate ]        │     [ Download Resume ]              │
└──────────────────────┴──────────────────────────────────────┘
```

> **Settings — Account & Profile**
> Your real account data loaded from the backend. Upload your master resume here.

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                   │
│  Manage your account, integrations, and job search prefs.   │
│                                                             │
│  ┌──────────────────────────────────┐  ┌─────────────────┐  │
│  │  JD  John Doe           [Edit]  │  │  Your Plan      │  │
│  │      Software Engineer · Toronto │  │  Pro ($19/mo)   │  │
│  │                                 │  │  ✓ AI Resumes   │  │
│  │  EMAIL      john@example.com    │  │  ✓ Analytics    │  │
│  │  LOCATION   Toronto, ON         │  │  ✓ Support      │  │
│  └──────────────────────────────────┘  └─────────────────┘  │
│                                                             │
│  General Resume                                             │
│  [ ⬆ Upload your main resume — PDF or DOCX ]               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂 Project Structure

```
job-tracking-frontend/
│
├── home.html          # Landing page (unauthenticated)
├── login.html         # Login form → POST /api/auth/login
├── signup.html        # Sign-up form → POST /api/auth/signup
│
├── search.html        # Job search dashboard (protected)
├── tracker.html       # Application pipeline tracker (protected)
├── generator.html     # Resume builder / AI tailoring (protected)
├── setting.html       # Account settings & profile (protected)
├── pricing.html       # Pricing / plan selection page
│
├── api.js             # All backend API calls (auth + jobs + resume)
└── app.js             # Navigation, filters, sort, UI utilities
```

---

## 🚀 Getting Started

### Prerequisites

- A running **Rezzap backend** (FastAPI) at `http://localhost:8000`
- A modern browser (Chrome, Firefox, Edge)
- No build step required — pure HTML/JS

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd job-tracking-frontend
```

### 2. Start the backend

```bash
# In your backend project
uvicorn main:app --reload
# Backend runs at http://localhost:8000
```

### 3. Open the app

Open `home.html` directly in your browser, or serve it locally:

```bash
# Option A — Python simple server
python -m http.server 3000
# Then visit http://localhost:3000/home.html

# Option B — VS Code Live Server extension
# Right-click home.html → "Open with Live Server"
```

### 4. Sign up and log in

1. Go to `signup.html` → create your account
2. You'll be redirected to `search.html` automatically
3. Your credentials are stored as a JWT token in `localStorage`

---

## 🔌 API Integration

All backend calls are in [`api.js`](api.js). Base URL is `http://localhost:8000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login → returns JWT |
| `POST` | `/api/auth/logout` | Logout |
| `GET`  | `/api/auth/me` | Current user info |
| `GET`  | `/api/jobs/search?query=&location=` | Search live jobs |
| `POST` | `/api/jobs/save` | Save job to tracker |
| `GET`  | `/api/jobs/tracked` | Get all tracked jobs |
| `PUT`  | `/api/jobs/:id/status` | Update application status |
| `POST` | `/api/jobs/:id/resume` | Generate tailored resume (multipart) |
| `GET`  | `/api/jobs/:id/resume/status` | Poll resume generation status |

**Auth:** Every protected request sends `Authorization: Bearer <token>` automatically.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login and signup
- Token stored in `localStorage`
- Route guards on all protected pages — unauthenticated users redirect to login
- Auto-logout on expired token

### 🔍 Job Search
- Live search via backend (`/api/jobs/search`)
- Filter by: **Remote**, **Full-time**, **Part-time**, **Salary Range**
- Sort by: **Best Match**, **Most Recent**, **Salary High→Low**, **Salary Low→High**
- One-click bookmark → saves job to tracker via API

### 📋 Application Tracker
- Loads real jobs from backend (`/api/jobs/tracked`)
- Notion-style pipeline table with status badges
- Status dropdown: `To Apply → Submitted → Interviewing → Offer → Rejected`
- "Generate" button sends you to the Builder with the job pre-selected

### 📄 Document Builder
- Upload base resume (PDF or DOCX)
- Job context banner shows which role you're tailoring for
- Sends file to backend → polls until tailored resume is ready
- Download link appears in the preview panel

### ⚙️ Settings
- Profile loaded live from `GET /api/auth/me`
- Shows your real name, email, initials avatar
- Upload and manage your master resume (stored in `localStorage`)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) |
| Icons | Google Material Symbols |
| Fonts | Inter + Manrope (Google Fonts) |
| Logic | Vanilla JavaScript (ES2020+) |
| Auth | JWT via `localStorage` |
| Backend | FastAPI (Python) at `localhost:8000` |

---

## 📦 Local Storage Keys

| Key | Purpose |
|-----|---------|
| `token` | JWT access token |
| `refresh_token` | JWT refresh token |
| `mainResume` | Uploaded master resume metadata |
| `manualJobs` | Manually added job cards |
| `profileSetupDone` | Whether onboarding is complete |
| `justSignedUp` | Flag to show profile setup modal |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a Pull Request

---

<div align="center">

Built with ❤️ by the Rezzap team
[Home](home.html) · [Search](search.html) · [Tracker](tracker.html) · [Builder](generator.html)

</div>
