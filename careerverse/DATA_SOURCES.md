# CareerVerse - Data Sources & External Ingestion Specification

CareerVerse adheres to a strict **Live Data Ingestion Protocol**:
- **Zero Static Opportunity Data**: No dummy jobs, fake internships, or invented scholarships are hardcoded into the client.
- **Official Priority**: Official government portals and direct APIs are always preferred over secondary aggregators.
- **Integrity**: Original source links, deadlines, qualifications, and official notification PDFs are strictly preserved.
- **RAG AI Grounding**: AI chatbot strictly queries verified database entries before responding to opportunity inquiries.

---

## 1. Adzuna Job Search API

| Field | Detail |
|---|---|
| **Source Name** | Adzuna |
| **Purpose** | Verified private sector job advertisements & tech internships in India |
| **Official Website** | https://www.adzuna.in/ |
| **API Endpoint** | `https://api.adzuna.com/v1/api/jobs/in/search/{page}` |
| **Data Format** | JSON REST API |
| **Authentication Required** | Yes (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`) |
| **Refresh Frequency** | 30 - 60 minutes (`SYNC_JOBS_INTERVAL=*/30 * * * *`) |
| **Rate Limits** | 25 requests / min on developer tier |
| **Terms / Restrictions** | Commercial developer attribution required; redirect links must point to Adzuna redirect URL |
| **Fields Collected** | `title`, `company.display_name`, `location.display_name`, `salary_min`, `salary_max`, `description`, `redirect_url`, `created` |
| **Fallback Mechanism** | Cached database results + National Career Service verified listings |
| **Last Verified** | September 2026 |

---

## 2. National Career Service (NCS)

| Field | Detail |
|---|---|
| **Source Name** | National Career Service (Ministry of Labour & Employment, Govt of India) |
| **Purpose** | Central/State classified government vacancies, public sector apprenticeships, and verified industry jobs |
| **Official Website** | https://www.ncs.gov.in/ |
| **Feed / Endpoint** | `https://www.ncs.gov.in/Pages/RSSJobPostings.aspx` |
| **Data Format** | XML / RSS 2.0 Feed & Open Structured Catalog |
| **Authentication Required** | None (Public Governmental Feed) |
| **Refresh Frequency** | Every 60 - 120 minutes |
| **Rate Limits** | Standard public feed etiquette (cached via node-cron) |
| **Terms / Restrictions** | Non-commercial educational dissemination; official application portal links must be used |
| **Fields Collected** | `title`, `organization`, `location`, `stipend/salary`, `qualification`, `skills`, `deadline`, `applicationUrl`, `pubDate` |
| **Fallback Mechanism** | MongoDB local cache with freshness timestamp indicators |
| **Last Verified** | September 2026 |

---

## 3. Union Public Service Commission (UPSC)

| Field | Detail |
|---|---|
| **Source Name** | UPSC Official Examination & Recruitment Portal |
| **Purpose** | Civil Services, Engineering Services, CDS, NDA, and Central Technical appointments |
| **Official Website** | https://www.upsc.gov.in/ |
| **Feed URL** | `https://www.upsc.gov.in/whats-new/feed` & OTR Portal (`upsconline.nic.in`) |
| **Data Format** | RSS / Official Notification Bulletins (PDF & Structured HTML) |
| **Authentication Required** | None |
| **Refresh Frequency** | Every 2 hours (`SYNC_GOVERNMENT_INTERVAL=0 */2 * * *`) |
| **Rate Limits** | Standard governmental server courtesy |
| **Terms / Restrictions** | Unaltered preservation of official advertisement numbers and PDF circulars |
| **Fields Collected** | `title`, `department`, `vacancyCount`, `ageLimit`, `examPattern`, `syllabus`, `officialNotificationPdf`, `deadline`, `applicationUrl` |
| **Fallback Mechanism** | Retained verified notifications marked with `lastVerifiedAt` |
| **Last Verified** | September 2026 |

---

## 4. Staff Selection Commission (SSC)

| Field | Detail |
|---|---|
| **Source Name** | Staff Selection Commission (Govt of India) |
| **Purpose** | Junior Engineer (JE), CGL, CHSL, and Technical Staff recruitment notices |
| **Official Website** | https://ssc.gov.in/ |
| **Endpoint / Noticeboard** | `https://ssc.gov.in/api/notifications` |
| **Data Format** | JSON / Official PDF Circulars |
| **Authentication Required** | None |
| **Refresh Frequency** | Every 2 - 3 hours |
| **Rate Limits** | Respect server capacity via backend caching |
| **Terms / Restrictions** | Strict candidate redirection to `ssc.gov.in` One-Time Registration (OTR) |
| **Fields Collected** | Exam title, qualifying degree (Diploma/B.Tech), grade pay / pay level, exam pattern, syllabus |
| **Fallback Mechanism** | Indexed database cache |
| **Last Verified** | September 2026 |

---

## 5. Railway Recruitment Boards (RRB)

| Field | Detail |
|---|---|
| **Source Name** | Railway Recruitment Boards (Ministry of Railways) |
| **Purpose** | Assistant Loco Pilot (ALP), Junior Engineer (RRB JE), and Technical Officer roles |
| **Official Website** | https://www.rrbcdg.gov.in/ & https://www.rrbapply.gov.in/ |
| **Data Format** | Centralized Employment Notices (CEN) |
| **Authentication Required** | None |
| **Refresh Frequency** | Every 3 hours |
| **Terms / Restrictions** | Direct application link to official RRB Apply portal |
| **Fields Collected** | CEN number, vacancies, eligibility, medical fitness level, application start & end dates |
| **Fallback Mechanism** | MongoDB cache |
| **Last Verified** | September 2026 |

---

## 6. National Scholarship Portal (NSP) & AICTE

| Field | Detail |
|---|---|
| **Source Name** | National Scholarship Portal (Ministry of Electronics and Information Technology) |
| **Purpose** | Central Sector, AICTE Pragati, Post-Matric, and Merit-cum-Means college scholarships |
| **Official Website** | https://scholarships.gov.in/ |
| **Data Format** | Official Public Scheme Guidelines |
| **Authentication Required** | None |
| **Refresh Frequency** | Daily / Periodic verification (`SYNC_SCHOLARSHIP_INTERVAL=0 0 * * *`) |
| **Terms / Restrictions** | Do not predict deadlines; only display open dates verified by the portal |
| **Fields Collected** | `schemeName`, `provider`, `academicYear`, `incomeRequirement`, `scholarshipAmount`, `requiredDocuments`, `courseApplicable`, `closingDate`, `officialUrl` |
| **Fallback Mechanism** | Cached schemes with clear `lastVerifiedAt` timestamps |
| **Last Verified** | September 2026 |

---

## 7. NewsAPI & Open Technology RSS Channels

| Field | Detail |
|---|---|
| **Source Name** | NewsAPI + Hacker News RSS + Dev.to Community Feed |
| **Purpose** | Live technology news covering AI, Cloud Computing, Cybersecurity, Software, and Tech Hiring |
| **Official Website** | https://newsapi.org/ |
| **API Endpoint** | `https://newsapi.org/v2/everything` |
| **Data Format** | JSON REST API + XML RSS |
| **Authentication Required** | `NEWS_API_KEY` for NewsAPI; None for RSS fallback channels |
| **Refresh Frequency** | Every 15 - 30 minutes (`SYNC_NEWS_INTERVAL=*/15 * * * *`) |
| **Rate Limits** | 100 requests / 24 hours on NewsAPI Free Tier (Handled via server-side scheduler caching) |
| **Terms / Restrictions** | Unmodified headline & description; direct links to publisher source |
| **Fields Collected** | `title`, `description`, `content`, `imageUrl`, `sourceName`, `url`, `category`, `publishedAt` |
| **Fallback Mechanism** | Live RSS endpoints (`hnrss.org/frontpage`, `dev.to/feed`) ensure 100% live uptime even without API keys |
| **Last Verified** | September 2026 |

---

## 8. AWS Skill Builder & Google Cloud Skills Boost

| Field | Detail |
|---|---|
| **Source Name** | AWS Training & Certification + Google Cloud Skills Boost |
| **Purpose** | Free student certifications, cloud practitioner foundations, and learning badges |
| **Official Website** | https://aws.amazon.com/training/ & https://www.cloudskillsboost.google/ |
| **Data Format** | Public Curriculum Catalog |
| **Authentication Required** | None |
| **Fields Collected** | Course name, duration, difficulty, free badge access, certification link |
| **Last Verified** | September 2026 |

---

## Duplicate Detection & Data Freshness Protocol
1. **Duplicate Matching**: Candidate opportunities undergo URL exact matching and fuzzy token similarity analysis (threshold >= 0.75). Duplicates are merged rather than creating double cards.
2. **Deadline Management**: Whenever `currentDate > deadline`, the system automatically transitions opportunity status to `CLOSED` and updates `verificationStatus = 'EXPIRED'`.
3. **Data Freshness Indicator**: Every card in the UI displays human-readable freshness:
   - *"Updated 15 minutes ago"*
   - *"Verified today"*
   - *"Source: Adzuna (Verified API)"*
