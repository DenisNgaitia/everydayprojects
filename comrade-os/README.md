# ComradeOS 🎓

ComradeOS is the ultimate campus life operating system designed specifically for Kenyan university students ("Comrades"). It gamifies your campus experience by helping you manage your finances, schedule, diet, study materials, and fitness, while an AI Decision Engine guides your choices.

![ComradeOS Dashboard](screenshot.png) *(Imagine a beautiful neon glassmorphism dashboard here)*

## Features

- **💰 Financial Command**: Track your KES expenses, monitor your weekly HELB/pocket money budget, and visualize your spending trajectory.
- **🤖 AI Decision Engine**: Ask the AI "Should I spend KES 500 on a night out?" and get a verdict based on your financial health, schedule, and study goals.
- **⏳ Time Management**: Balance your sleep, study, and free time to avoid overbooking yourself.
- **🍽️ Diet Planner**: Switch between "Normal Mode" and "🔥 Survival Mode" (for when the budget gets tight). Features Kenyan campus staples like Githeri, Ugali, and Mandazi.
- **📚 Study AI**: Upload your lecture notes and instantly generate summaries, flashcards, and practice questions.
- **💪 Fitness System**: Log your daily readiness (sleep quality, energy) to get personalized workout recommendations.
- **🏆 Gamification**: Earn XP and unlock badges (like "Disciplined Comrade") by logging expenses, sticking to your schedule, and making smart AI-approved decisions.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Framer Motion (for smooth animations and glassmorphism UI)
- **Charts**: Recharts
- **Data Persistence**: `localStorage` (Serverless architecture, perfectly suited for static hosting)

---

## 🚀 How to Run Locally

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd comrade-os/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🌐 How to Deploy to InfinityFree

ComradeOS is built as a fully static Single Page Application (SPA). Because it uses `localStorage` for data instead of a traditional backend, it is **100% compatible with InfinityFree** (which only supports PHP/MySQL and static files, not Node.js).

### Step-by-Step Deployment Guide

1. **Build the Production Files**
   In your terminal, run:
   ```bash
   npm run build
   ```
   This creates a `dist/` folder containing your compiled, minified, production-ready static files.

2. **Login to InfinityFree**
   - Go to your InfinityFree client area.
   - Select your hosting account and click **Control Panel**.
   - Open the **Online File Manager** (or use an FTP client like FileZilla).

3. **Upload Files**
   - In the File Manager, navigate to the `htdocs` directory (this is the public web root).
   - **Delete** any existing files in `htdocs` (like the default InfinityFree `index2.html`).
   - Open your local `frontend/dist/` folder.
   - **Upload the entire contents** of the `dist/` folder directly into `htdocs`.
   - Ensure the `.htaccess` file (which is included in the build) is uploaded to `htdocs` to handle React routing.

4. **Done!**
   Visit your InfinityFree domain. ComradeOS will load instantly and save all user data locally in their browser.

---

## Project Structure

```text
comrade-os/
├── frontend/
│   ├── index.html           # Main HTML entry with SEO tags
│   ├── vite.config.js       # Vite bundler configuration
│   ├── tailwind.config.js   # Custom Tailwind theme (colors, fonts, animations)
│   ├── public/
│   │   └── .htaccess        # Apache rewrite rules for SPA routing
│   └── src/
│       ├── components/      # UI Components (GlassCard, Sidebar, etc.)
│       ├── context/         # React Context for global state
│       ├── pages/           # Route views (Dashboard, Finance, etc.)
│       └── utils/
│           ├── aiEngine.js  # AI logic simulator
│           ├── dataService.js # localStorage CRUD operations
│           └── seedData.js  # Default Kenyan data models
└── backend-reference/       # Legacy Express/MongoDB backend (not used in production)
```
