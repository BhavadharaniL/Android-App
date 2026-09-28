# CareerVerse - Technical Architecture & Live Ingestion System

CareerVerse is engineered to address a pervasive flaw in student opportunity platforms: **stale, hardcoded data and fake mock listings**. CareerVerse mandates that every job, internship, scholarship, and government notification is ingested dynamically through verified external channels, deduplicated, evaluated for expiration, and served via a resilient caching backend.

---

## 1. High-Level Ingestion Flow

```
┌──────────────────────────────────────────────────────────┐
│                   External Providers                     │
│  - Adzuna API (Private Jobs & Tech Internships)          │
│  - National Career Service (Govt/Private Opportunities)  │
│  - UPSC / SSC / RRB Official Feeds & Examination Notices │
│  - National Scholarship Portal (NSP / AICTE Schemes)     │
│  - NewsAPI & Live Technology RSS Channels                │
│  - AWS / Google Cloud Official Certifications            │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│               Data Synchronization Layer                 │
│  - node-cron Scheduled Background Ingestion              │
│  - Provider Abstraction Layer (BaseProvider interface)   │
│  - Normalizer & URL Verification Protocol                │
│  - Fuzzy String & URL Duplicate Detection Engine         │
│  - Deadline Auto-Expiry Engine (currentDate > deadline)  │
│  - DataSyncLog Audit Recorder                            │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     MongoDB Cache                        │
│  - Opportunity (Compound Indexes: category, deadline)    │
│  - News (Compound Indexes: category, publishedAt)        │
│  - User Profiles (Skills, Target Roles, Education)       │
│  - Application Tracker (Saved, Applied, Interview)       │
│  - Roadmaps & Skill Gap Matrices                         │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│               Node.js + Express REST API                 │
│  - JWT Authentication & Role Authorization               │
│  - Multi-tier Rate Limiting (API, Auth, AI)              │
│  - Centralized Error Handling without Stack Leakage      │
│  - Gemini AI Service with Strict RAG Grounding           │
└──────────────────────┬─────────────┬─────────────────────┘
                       │             │
        ┌──────────────┘             └──────────────┐
        ▼                                           ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│  React Native (Expo) Client  │   │     Web Admin Dashboard      │
│  - Dynamic Home Dashboard    │   │  - Real-Time KPIs & Stats    │
│  - Multi-Category Live Feed  │   │  - Data Source Controls      │
│  - Offline AsyncStorage      │   │  - Manual "Sync Now" Trigger │
│  - RAG AI Career Chatbot     │   │  - Synchronization Logs      │
│  - Mock Interview Arena      │   │  - Source Enable/Disable     │
└──────────────────────────────┘   └──────────────────────────────┘
```

---

## 2. Zero Static Data & Anti-Hallucination Guarantees

### Zero Client Mockups
The React Native mobile client never embeds static JSON arrays or dummy placeholder objects for opportunities. If an external API or network is temporarily disconnected, the client displays locally cached verified opportunities accompanied by a clear *"Updated X minutes ago"* or *"Offline cache"* indicator.

### Strict RAG Grounding (Section 28-30)
When a user asks CareerVerse AI:
> *"Are there any Java internships available today in Chennai?"*

The system executes the following pipeline:
1. **Intent Detection**: The backend recognizes an inquiry regarding live openings.
2. **Database Query**: The backend executes a MongoDB query against active opportunities (`status: 'OPEN'`, `skills: 'Java'`, `category: 'internship'`).
3. **Prompt Grounding**: The actual retrieved records are injected into the Gemini context.
4. **Anti-Hallucination Rule**: The LLM system prompt strictly forbids inventing vacancies, salaries, deadlines, or URLs. If no record is found, it states: *"No verified Java internship matching your current filters was found in the live database today."*

---

## 3. Duplicate Detection Specification
Opportunities often appear on multiple platforms (e.g. Adzuna and NCS). The `DuplicateDetectionService` implements:
- URL canonicalization and exact comparison on `applicationUrl` and `sourceId`.
- Stemming normalization (`engineer` = `engineering`, `intern` = `internship`, `developer` = `development`).
- Set-based token similarity metric. If similarity $\ge 0.75$ and organization matches, the record is recognized as a duplicate and updated rather than duplicating UI cards.

---

## 4. Deadline Lifecycle Engine
Every opportunity includes a `deadline` timestamp:
- If $\text{currentDate} > \text{deadline}$: status becomes `CLOSED` and `verificationStatus = 'EXPIRED'`.
- If $\text{deadline} - \text{currentDate} \le 3\text{ days}$: status becomes `CLOSING_SOON`.
- Default query in Opportunities screen filters `status: { $in: ['OPEN', 'CLOSING_SOON'] }`, preserving closed items for historical application tracking while keeping the discovery feed clean.
