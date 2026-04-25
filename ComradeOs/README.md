# 🇰🇪 ComradeOS: Deployment & Execution Guide

Welcome to the final deployment guide for ComradeOS. This system is a complex, modular architecture spanning a **FastAPI backend**, a **Next.js frontend**, and a **Flutter mobile app**.

Because of the architectural realities of hosting services, here is exactly how to compile, build, and deploy this massive system.

---

## 1. Prerequisites (What you need on your machine)

To compile the code locally, you must install the following tools:
- **Docker & Docker Compose**: To run the backend databases easily.
- **Node.js (v18+) & npm**: Required to build the Next.js frontend into static files.
- **Python 3.11+**: Required to run the FastAPI backend locally if you aren't using Docker.

---

## 2. Deploying the Website to InfinityFree

InfinityFree **only supports static files** (HTML/CSS/JS) and PHP. It cannot run a Next.js Node server or a Python backend. Therefore, we must export Next.js as a static site.

### Steps:
1. Open your terminal and install Node.js (`sudo apt install nodejs npm`).
2. Navigate to the frontend directory: `cd frontend`.
3. Install dependencies: `npm install`.
4. Open `frontend/.env.production` and ensure `NEXT_PUBLIC_API_URL` points to your future backend URL (e.g., `https://comradeos.onrender.com/api/v1`).
5. Run the build command: `npm run build`.
6. Because we configured `output: 'export'` in `next.config.js`, Next.js will generate a folder called `out/`.
7. **Upload the contents of the `out/` folder directly to your InfinityFree `htdocs` directory via FTP.**

---

## 3. Deploying the Backend (Python / FastAPI)

You **cannot** host the backend on InfinityFree. You must host it on a platform that supports Python and PostgreSQL.
**Recommended Free Platforms:** Render.com or Railway.app.

### Steps for Render.com:
1. Push this entire repository to GitHub.
2. Go to Render.com and create a new **Web Service**.
3. Connect your GitHub repo and point the root directory to `backend/`.
4. Render will automatically detect the `Dockerfile` we created and deploy the FastAPI server.
5. Create a new **PostgreSQL** database on Render and paste the provided `DATABASE_URL` into your Web Service's environment variables.
6. Add your `GROQ_API_KEY` to the environment variables so The Forge AI can function.

---

## 4. Building the Android APK (Mobile App)

Because you do not have the Flutter SDK installed on your machine, we have configured a **GitHub Action** to build the APK for you in the cloud.

### Steps:
1. Push this codebase to GitHub.
2. Go to the **Actions** tab in your GitHub repository.
3. You will see a workflow named `Build Android APK`.
4. Once the workflow finishes running, scroll to the bottom of the summary page.
5. Download the **Artifact** named `comradeos-release-apk`.
6. Transfer this APK to your Android phone and install it.

---

## 5. Local Development (Testing everything on your machine)

If you just want to see the system run locally before putting it on the internet:

1. **Start the Backend:**
   Run `docker-compose up --build` from the root directory. This spins up FastAPI, PostgreSQL, and Redis. The API will be available at `http://localhost:8000`.
   
2. **Start the Frontend:**
   Open a new terminal, run `cd frontend`, then `npm install`, then `npm run dev`. The dashboard will be available at `http://localhost:3000`.

---
*Survive, Grind, Thrive. Welcome to ComradeOS.*
