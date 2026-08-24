# AI Workflow Discovery Toolkit

Run a structured 1:1 discovery session with an employee, have Claude score each task
for automation impact/effort, manage the resulting backlog, and generate a
one-page implementation report.

Stack: React (Vite) + Tailwind CSS on the frontend, Vercel serverless
functions on the backend, Turso (hosted SQLite/libSQL) for persistence,
live calls to the Anthropic Claude API.

---

## 1. Prerequisites

- Node.js 18 or later installed
- An Anthropic API key (console.anthropic.com)
- A Turso account and the Turso CLI installed
- A Vercel account and the Vercel CLI installed (`npm i -g vercel`)
- A GitHub account

---

## 2. Create the Turso database (web dashboard — no CLI, no WSL required)

Turso's CLI requires WSL on Windows. To avoid that, create the database
through Turso's web dashboard instead — this produces the same
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` values and requires no code
changes.

1. Go to `https://turso.tech` in your browser and sign up / log in (GitHub
   login is supported).
2. On the dashboard, use the "Create Database" action in the onboarding
   wizard.
3. Name it `discovery-toolkit` and complete the wizard.
4. Open the new database's detail page and copy the **Database URL** — it
   looks like `libsql://discovery-toolkit-<your-username>.turso.io`. This is
   your `TURSO_DATABASE_URL`.
5. On the same page, create an auth token (may be labeled "Create Token" or
   under a "Tokens" tab). Copy it immediately — Turso only shows it once.
   This is your `TURSO_AUTH_TOKEN`.

If you're on macOS or Linux and prefer the CLI instead, that remains a valid
alternative:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create discovery-toolkit
turso db show discovery-toolkit --url
turso db tokens create discovery-toolkit
```

On Windows, the CLI is only usable inside WSL (`wsl --install` from an
admin PowerShell, then run the four `turso` commands above inside the WSL
Ubuntu shell) — the web dashboard method above avoids this entirely.

You do not need to create the table manually — `api/_lib/db.js` runs
`CREATE TABLE IF NOT EXISTS` automatically on first request.

---

## 3. Configure environment variables locally

```bash
cp .env.example .env
```

Open `.env` and fill in the three values:

```
ANTHROPIC_API_KEY=sk-ant-...
TURSO_DATABASE_URL=libsql://discovery-toolkit-<your-org>.turso.io
TURSO_AUTH_TOKEN=<token from step 2>
```

---

## 4. Run locally

The `/api` folder uses the Vercel serverless function format, so use the
Vercel CLI (not plain `vite dev`) to run frontend and backend together:

```bash
npm install
vercel dev
```

This starts the app at `http://localhost:3000` — the Vite frontend is
served, and requests to `/api/*` are routed to the serverless functions with
your `.env` variables loaded automatically. Open it on your phone browser by
visiting your machine's local network IP (e.g. `http://192.168.1.x:3000`) to
confirm the mobile layout.

---

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "AI Workflow Discovery Toolkit"
git branch -M main
git remote add origin https://github.com/<your-username>/discovery-toolkit.git
git push -u origin main
```

---

## 6. Deploy to Vercel

```bash
vercel
```

Follow the prompts (link to a new project, accept defaults — Vercel
auto-detects Vite). Then set the three environment variables in the deployed
project so the live site can reach Claude and Turso:

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
```

Paste each value when prompted (same values as your `.env` file). Then
redeploy so the new env vars take effect:

```bash
vercel --prod
```

Your app is now live at the URL Vercel prints (e.g.
`https://discovery-toolkit.vercel.app`), fully mobile-responsive in the
browser, making live Claude API calls, and persisting the backlog in Turso.

---

## 7. How the pieces map to the internship job description

| App feature | Job description line it demonstrates |
|---|---|
| Discovery questionnaire (`/`) | "Conduct structured 1:1 sessions... to map their daily workflows, identify repetitive or high-effort tasks" |
| "Successful output" + "human judgment" fields | "Help employees articulate what 'good' looks like before building" |
| Claude-scored impact/effort + Impact×Effort matrix | "Maintain a running backlog of automation opportunities... ranked by effort and impact" |
| Recommended tool (Claude / Copilot / ChatGPT / Cowork) | "Fluent practitioner in all three [Claude, Copilot, Cowork]" |
| Accepted / Rejected / Needs Discussion status | Backlog + implementation tracking workflow |
| One-page report (`/report`) | "Document each workflow built... Track adoption and time-savings metrics; report progress to the CIO" |

---

## 8. Project structure

```
discovery-toolkit/
├── api/
│   ├── analyze.js              POST — run Claude analysis on a batch of tasks
│   ├── opportunities.js        GET  — list/filter the backlog
│   ├── opportunities/[id].js   PATCH/DELETE — update status or notes
│   ├── report.js               GET  — aggregate one-page report data
│   └── _lib/
│       ├── db.js                Turso client + schema
│       └── claude.js            Anthropic API call + prompt
├── src/
│   ├── pages/
│   │   ├── Discovery.jsx        Step 1: questionnaire
│   │   ├── Backlog.jsx          Step 2: ranked backlog + matrix
│   │   └── Report.jsx           Step 3: one-page report
│   ├── components/
│   │   └── ImpactEffortMatrix.jsx
│   ├── App.jsx                  Routes + responsive nav
│   └── main.jsx
├── vercel.json
├── tailwind.config.js
└── package.json
```
