# CareerVerse REST API Documentation

Base URL: `http://localhost:5000/api` (or `http://<YOUR_IP>:5000/api`)

All requests and responses use `application/json`.
Authenticated requests require the header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & Onboarding

### Register Student
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Alex Student",
    "email": "alex@example.com",
    "password": "Password123!",
    "college": "Anna University",
    "degree": "B.Tech",
    "branch": "Computer Science and Engineering",
    "currentYear": "3rd Year"
  }
  ```
- **Response** (201): Returns user profile and `token`.

### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (200): Returns user profile, preferences, and `token`.

### Complete Onboarding (Section 6)
- **Endpoint**: `PUT /api/auth/onboarding`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "careerGoals": ["Campus Placement", "Private Jobs", "Internships"],
    "programmingLanguages": ["Java", "Python", "JavaScript"],
    "technicalSkills": ["Java", "SQL", "Spring Boot", "React", "Data Structures"],
    "softSkills": ["Problem Solving", "Teamwork"],
    "areasOfInterest": ["Full Stack", "Cloud Computing"],
    "preferredRoles": ["Software Engineer", "Java Developer Intern"],
    "preferredLocations": ["Chennai", "Bangalore", "Remote"],
    "experienceLevel": "Student",
    "remotePreference": "Hybrid"
  }
  ```

---

## 2. Live Opportunities Module

### List Opportunities (Live Filters, Pagination, Status)
- **Endpoint**: `GET /api/opportunities`
- **Query Parameters**:
  - `category`: `job` | `internship` | `government_job` | `scholarship` | `course` | `certification` | `hackathon` | `higher_study`
  - `status`: `Open` (default) | `Closing Soon` | `Closed` | `All`
  - `search`: Keyword string (searches title, organization, skills, location)
  - `location`: e.g., `Chennai`, `Bangalore`, `Remote`
  - `workType`: `Remote` | `Hybrid` | `On-site`
  - `skills`: comma-separated e.g. `Java,SQL`
  - `page`: default 1
  - `limit`: default 15
  - `sortBy`: `newest` | `deadline` | `oldest`

### Personalized Recommendations
- **Endpoint**: `GET /api/opportunities/recommendations`
- **Auth**: Bearer Token
- **Query**: `?limit=10`
- **Response**: Returns sorted list with `matchScore` and `matchReason` (e.g. *"Matches your Java and SQL skills"*).

### Upcoming Deadlines
- **Endpoint**: `GET /api/opportunities/deadlines`
- **Response**: Active deadlines within next 30 days sorted by urgency.

### Opportunity Details
- **Endpoint**: `GET /api/opportunities/:id`
- **Response**: Complete item schema with official `applicationUrl`, `source`, `verificationStatus`, and `lastVerifiedAt`.

---

## 3. Technology News

### Get News Articles
- **Endpoint**: `GET /api/news`
- **Query**: `?category=AI&page=1&limit=15`
- **Categories**: `AI`, `Cloud Computing`, `Cybersecurity`, `Software Engineering`, `Data Science`, `Internships`, `Jobs`, `Technology`, `Startups`

### Trigger News Refresh
- **Endpoint**: `POST /api/news/refresh`

---

## 4. Career AI Assistant (RAG Grounded)

### Ask Question
- **Endpoint**: `POST /api/ai/ask`
- **Body**:
  ```json
  {
    "question": "Are there any Java internships available today?"
  }
  ```
- **Response**: Grounded response. Strictly cites live opportunities from database without hallucination.

### Resume Analyzer
- **Endpoint**: `POST /api/ai/resume-analyzer`
- **Body**:
  ```json
  {
    "resumeText": "...",
    "targetRole": "Software Engineer"
  }
  ```
- **Response**: Detailed score, extracted keywords, strengths, weaknesses, and actionable recommendations.

### Skill Gap Analysis
- **Endpoint**: `POST /api/ai/skill-gap`
- **Body**:
  ```json
  {
    "targetRole": "Cloud Engineer",
    "userSkills": ["Linux", "Python"]
  }
  ```
- **Response**: `strongSkills`, `skillsToImprove`, `missingSkills`, `readinessScore`, and recommended learning path.

### Mock Interview Practice
- **Endpoint**: `GET /api/ai/interview/questions?topic=Java&difficulty=Medium`
- **Endpoint**: `POST /api/ai/interview/evaluate`
  - **Body**: `{ "question": "...", "userAnswer": "..." }`
  - **Response**: `{ "score": 85, "feedback": "...", "missingConcepts": [...] }`

---

## 5. Application Tracker

- `POST /api/applications/save/:opportunityId` (Toggle bookmark)
- `GET /api/applications/saved` (View saved opportunities)
- `GET /api/applications` (View applied, interview, selected, rejected pipeline)
- `POST /api/applications` (Record new application status)
- `DELETE /api/applications/:id` (Remove record)

---

## 6. Admin Dashboard & Sync Operations

- `GET /api/admin/stats` (Overview KPIs, active opportunities, popular skills)
- `GET /api/admin/sources` (Manage Adzuna, NCS, UPSC, SSC, NSP, NewsAPI)
- `POST /api/admin/sync` (Trigger live synchronization cycle)
- `GET /api/admin/logs` (Audit sync logs with records added, updated, failed)
