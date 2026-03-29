# Rezzap — AI Job Search Frontend

> Find jobs. Tailor your resume. Track every application.

---

## Screenshots

### Home
![Home](https://placehold.co/900x500/f9f9ff/2563EB?text=Home+—+Landing+Page)

### Job Search
![Search](https://placehold.co/900x500/f0f3ff/2563EB?text=Job+Search+—+Live+Results)

### Application Tracker
![Tracker](https://placehold.co/900x500/f9f9ff/2563EB?text=Tracker+—+Pipeline+Dashboard)

### Document Builder
![Builder](https://placehold.co/900x500/f0f3ff/2563EB?text=Builder+—+AI+Resume+Generator)

### Settings
![Settings](https://placehold.co/900x500/f9f9ff/2563EB?text=Settings+—+Account+%26+Profile)

> **To add real screenshots:** take a screenshot of each page, save them to a `/screenshots` folder, and replace the placeholder URLs above with `./screenshots/home.png` etc.

---

## What is Rezzap?

Rezzap is an AI-powered job search SaaS. It helps users:

1. **Search** real job listings with live results from the backend
2. **Save** jobs to a personal tracker with one click
3. **Generate** a tailored resume for each job using AI
4. **Track** every application through a Notion-style status pipeline

---

## Pages

| Page | File | Auth Required |
|------|------|:---:|
| Landing | `home.html` | No |
| Login | `login.html` | No |
| Sign Up | `signup.html` | No |
| Job Search | `search.html` | Yes |
| Tracker | `tracker.html` | Yes |
| Builder | `generator.html` | Yes |
| Settings | `setting.html` | Yes |
| Pricing | `pricing.html` | No |

---

## Project Structure

```
job-tracking-frontend/
├── home.html       # Landing page
├── login.html      # Login (wired to /api/auth/login)
├── signup.html     # Sign up (wired to /api/auth/signup)
├── search.html     # Job search dashboard
├── tracker.html    # Application pipeline
├── generator.html  # AI resume builder
├── setting.html    # Account settings
├── pricing.html    # Pricing page
├── api.js          # All API calls (auth + jobs + resume)
└── app.js          # Navigation, filters, sort, toast UI
```

---

## Getting Started

### 1. Start the backend

```bash
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### 2. Open the app

Open `home.html` in your browser, or use a local server:

```bash
# Python
python -m http.server 3000
# → http://localhost:3000/home.html

# VS Code: right-click home.html → Open with Live Server
```

### 3. Create an account

Go to `signup.html` → fill in your details → you'll be redirected to the job search page automatically.

---

## API Reference

All calls go through [`api.js`](./api.js). Backend base URL: `http://localhost:8000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register |
| `POST` | `/api/auth/login` | Login → JWT token |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Current user info |
| `GET` | `/api/jobs/search` | Search live jobs |
| `POST` | `/api/jobs/save` | Save job to tracker |
| `GET` | `/api/jobs/tracked` | Get tracked jobs |
| `PUT` | `/api/jobs/:id/status` | Update application status |
| `POST` | `/api/jobs/:id/resume` | Generate tailored resume |
| `GET` | `/api/jobs/:id/resume/status` | Poll resume status |

**Auth:** all protected endpoints send `Authorization: Bearer <token>` automatically.

---

## Tech Stack

- **HTML5** — no framework
- **Tailwind CSS** — utility-first styling via CDN
- **Vanilla JavaScript** — ES2020+
- **Google Fonts** — Inter + Manrope
- **Material Symbols** — icon library
- **FastAPI backend** — running at `localhost:8000`

---

## Key Features

### Authentication
- JWT login/signup wired to backend
- Token saved in `localStorage`
- Route guards redirect unauthenticated users to login
- Auto-logout on expired token

### Job Search
- Live search hits `GET /api/jobs/search`
- Filter: Remote, Full-time, Part-time
- Sort: Best Match, Most Recent, Salary
- One-click save → adds to tracker via API

### Application Tracker
- Loads real jobs from `GET /api/jobs/tracked`
- Status dropdown: Pending → Applied → Interview → Offer → Rejected
- Click Generate → goes to Builder with that job pre-selected

### Resume Builder
- Upload base resume (PDF / DOCX)
- Sends file + jobId to backend
- Polls until AI-tailored resume is ready
- Download button appears in preview panel

### Settings
- Profile populated from `GET /api/auth/me`
- Shows your real name, email, and initials
- Upload master resume — used as base for all generations

---

## localStorage Keys

| Key | Description |
|-----|-------------|
| `token` | JWT access token |
| `refresh_token` | JWT refresh token |
| `mainResume` | Master resume file metadata |
| `manualJobs` | Manually added job cards |
| `profileSetupDone` | Onboarding complete flag |

---

*Built with Rezzap — Your AI Career Copilot*
