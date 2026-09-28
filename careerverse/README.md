# CareerVerse 🚀
### *"Your Career. Your Opportunities. Your Future."*

CareerVerse is an AI-powered career guidance and opportunity discovery ecosystem designed specifically for college students and fresh graduates. Unlike conventional mockups with hardcoded static lists, CareerVerse is built on a **Strict Live Data Architecture**—dynamically synchronizing verified employment opportunities, public sector notifications, university scholarships, and technology news from legitimate APIs and official portals.

---

## 🌟 Core Modules & Capabilities

1. **Live Jobs & Internships**
   - Continuously synchronized from **Adzuna REST API** and the **National Career Service (NCS)**.
   - Preserves official application URLs, required qualifications, stipends, and verification timestamps.
2. **Official Government Jobs & Examination Tracker**
   - Ingests direct notifications from **UPSC**, **SSC**, and **Railway Recruitment Boards (RRB)**.
   - Displays vacancies, eligibility, age limits, exam patterns, and official PDF circular links.
3. **National Scholarship Portal (NSP) Integration**
   - Live scholarship schemes from the Ministry of Education, AICTE Pragati for Women, and Post-Matric grants.
   - Dynamic application status (`OPEN`, `CLOSING_SOON`, `CLOSED`) based on authentic portal dates.
4. **AI Career Assistant (RAG Grounded)**
   - Powered by Google Gemini with **Retrieval-Augmented Generation**.
   - Strictly answers opportunity queries by inspecting verified database records first. Anti-hallucination guardrails guarantee zero fabricated jobs, salaries, or deadlines.
5. **Resume Keyword Analyzer & Scorer**
   - Ingests student resumes, evaluates keyword density, detects strengths and weaknesses, and produces actionable formatting suggestions.
6. **Role Skill-Gap Engine**
   - Compares user skill profiles against target roles (Software Engineer, Cloud Engineer, Data Scientist) to identify strong, improving, and missing skills.
7. **Mock Interview Arena**
   - Generates technical, coding, and behavioral interview questions with real-time AI scoring and missing concept feedback.
8. **Automated Roadmaps & Milestone Tracker**
   - Generates progressive learning milestones from fundamentals to production deployments with live progress percentages.
9. **Live Technology News Feed**
   - Ingests real-time headlines across AI, Cloud, Cybersecurity, and Hiring via NewsAPI and fallback open RSS feeds.
10. **Application Lifecycle Tracker**
    - Students can track opportunities across `Saved`, `Applied`, `Interview`, `Selected`, and `Rejected` stages.
11. **Web Admin Dashboard**
    - Control room to monitor API health, view `DataSyncLog` audit records, toggle external sources, and trigger manual synchronization cycles.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
|---|---|
| **Mobile Client** | React Native, Expo 52, TypeScript, React Navigation (Tabs + Native Stack), Axios, AsyncStorage |
| **Backend API** | Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, express-rate-limit, fast-xml-parser |
| **Database** | MongoDB + Mongoose (with automated embedded `mongodb-memory-server` fallback for zero-friction local setup) |
| **Background Scheduling** | `node-cron` automated synchronization |
| **AI Integration** | Google Gemini REST API with strict RAG database grounding |
| **Admin Dashboard** | HTML5 / JavaScript Single Page Application with Tailwind CSS |

---

## 📂 Project Structure

```
careerverse/
├── backend/
│   ├── config/             # DB connection with memory fallback & env validation
│   ├── controllers/        # Auth, Opportunity, News, AI, Application, Admin handlers
│   ├── jobs/               # node-cron scheduled sync workers
│   ├── middleware/         # JWT auth, rate limiting, and centralized error handling
│   ├── models/             # Mongoose schemas with compound indexes
│   ├── providers/          # BaseProvider, AdzunaProvider, NCSProvider, GovProvider, NewsProvider
│   ├── routes/             # REST endpoint definitions
│   ├── seed/               # Initial administrative user & taxonomy seeder
│   ├── services/           # SyncService, DuplicateDetection, Recommendation, AIService
│   ├── tests/              # Built-in node:test automated unit & integration test suites
│   ├── package.json
│   └── server.js
├── mobile/
│   ├── src/
│   │   ├── api/            # Axios client with dynamic IP override
│   │   ├── components/     # OpportunityCard, NewsCard, SourceBadge, DeadlineBadge
│   │   ├── context/        # AuthContext for session & profile persistence
│   │   ├── navigation/     # Bottom TabNavigator & RootNavigator
│   │   ├── screens/        # Auth, Home, Opportunities, AI, News, Tracker, Roadmap, Profile
│   │   ├── types/          # Full TypeScript interfaces
│   │   └── utils/          # Storage, formatters, and offline cache helpers
│   ├── app.json            # Expo Android configuration & cleartext traffic permissions
│   ├── package.json
│   └── tsconfig.json
├── admin/
│   ├── index.html          # Standalone responsive control dashboard
│   └── package.json
├── docs/
│   └── ARCHITECTURE.md     # In-depth architectural specifications
├── DATA_SOURCES.md         # Comprehensive external source reference
├── API_DOCUMENTATION.md    # OpenAPI-style REST reference
├── .env.example            # Environment configuration template
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ or v22+ (tested on v22.14.0)
- **npm**: v10+

### 2. Environment Configuration
Copy the template in `backend/.env.example` to `backend/.env`:
```bash
cd careerverse/backend
cp .env.example .env
```
Key configuration items:
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/careerverse` (If MongoDB is not running locally, the backend automatically starts an in-memory database server!)
- `JWT_SECRET=your_jwt_secret_here`
- `GEMINI_API_KEY=your_gemini_api_key_here` (Optional: Enables AI chat, resume analysis, and interview evaluation)
- `ADZUNA_APP_ID=` & `ADZUNA_APP_KEY=` (Optional: Enables Adzuna job search API)
- `NEWS_API_KEY=` (Optional: NewsAPI key; live tech RSS feeds serve as fallback automatically)

### 3. Start the Backend API
```bash
cd careerverse/backend
npm install
npm run seed       # Seeds default student (student@careerverse.internal) & admin accounts
npm start          # Launches Express server on http://localhost:5000
```
Run automated unit and integration tests:
```bash
npm test
```

### 4. Launch the Web Admin Dashboard
Open `careerverse/admin/index.html` in any web browser, or serve it via Vite:
```bash
cd careerverse/admin
npm install
npm run dev
```
Features available in the Admin Dashboard:
- Real-time KPIs (Active opportunities, total students, application metrics)
- Configured providers & official portals status
- Manual **"Sync Now"** buttons to trigger live ingestion cycles immediately
- Real-time **DataSyncLog** audit table

### 5. Launch the Mobile Application
```bash
cd careerverse/mobile
npm install
npx expo start
```

---

## 📱 Android Physical Device & Emulator Testing (Section 59)

### Connecting from a Physical Android Phone over Wi-Fi
When running on a physical Android device, `localhost` refers to the phone itself rather than your computer.
1. Ensure your computer and your Android phone are connected to the same Wi-Fi network.
2. Find your computer's local IP address (in PowerShell, run `ipconfig`, look for IPv4 Address e.g. `192.168.1.100`).
3. In the CareerVerse mobile app, navigate to **Profile → Settings**.
4. Under **Android Physical Device IP Configuration**, set the base URL to:
   ```
   http://192.168.1.100:5000/api
   ```
5. Tap **Save API Endpoint**. The app will now communicate directly with your backend!

### Running on Android Emulator
The Android emulator uses `10.0.2.2` to access host `localhost`. CareerVerse automatically detects Android and routes to `http://10.0.2.2:5000/api` by default.

### Standalone APK Generation
To build a production standalone Android APK using EAS Build:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 🧪 Acceptance Verification Checklist (Section 62)

CareerVerse has been verified against the mandatory live-data acceptance criteria:

- [x] **Duplicate Detection**: `duplicateDetectionService` normalizes titles using stemming and word-frequency sets, matching identical opportunities across different feeds.
- [x] **Auto-Expiry**: Opportunities with `currentDate > deadline` automatically transition to `CLOSED` and `verificationStatus = 'EXPIRED'`.
- [x] **Offline Resilience**: Mobile app caches retrieved opportunities and news articles via `AsyncStorage`. If backend or Wi-Fi is disconnected, cached records are displayed without crashing.
- [x] **Official Source URLs**: Every card provides a **"View Original"** button opening the official government portal (`ncs.gov.in`, `upsc.gov.in`, `scholarships.gov.in`) or verified employer posting.
- [x] **Anti-Hallucination AI**: The Gemini AI assistant inspects live database records before generating answers, explicitly stating when no matching verified record is found.
- [x] **Data Freshness Indicators**: UI cards display human-readable timestamps (*"Updated 15m ago"*, *"Verified today"*).
- [x] **Live Search & Filter**: Search queries MongoDB cache with debounce, filtering by Category, Status (Open, Closing Soon, Closed, All), and Location.
- [x] **Admin Synchronization**: Admin control panel allows triggering immediate sync cycles and viewing audit logs.
