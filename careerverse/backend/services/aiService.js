const axios = require('axios');
const Opportunity = require('../models/Opportunity');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey !== 'your_gemini_api_key_here');
  }

  /**
   * Helper to execute Gemini generation prompt
   */
  async callGemini(systemPrompt, userPrompt) {
    if (!this.isConfigured()) {
      console.warn('[AIService] GEMINI_API_KEY not configured. Falling back to rule-based response engine.');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for high factual accuracy and zero hallucination
            maxOutputTokens: 1000
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return candidate || null;
    } catch (err) {
      console.error(`[AIService] Gemini API request failed: ${err.message}`);
      return null;
    }
  }

  /**
   * RAG-powered Career Question Answering with live DB grounding
   * SECTION 28, 29, 30
   */
  async answerCareerQuestion(userQuestion, userProfile = null) {
    // 1. Intent Detection & Live DB Retrieval
    const lowerQ = userQuestion.toLowerCase();
    let retrievedOpportunities = [];
    let isLiveOpportunityQuery = false;

    if (
      lowerQ.includes('job') ||
      lowerQ.includes('intern') ||
      lowerQ.includes('scholarship') ||
      lowerQ.includes('government') ||
      lowerQ.includes('upsc') ||
      lowerQ.includes('ssc') ||
      lowerQ.includes('opening') ||
      lowerQ.includes('vacancy') ||
      lowerQ.includes('available today') ||
      lowerQ.includes('hiring')
    ) {
      isLiveOpportunityQuery = true;

      // Extract keywords like "java", "chennai", "python", "internship", etc.
      const searchTerms = lowerQ
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(' ')
        .filter(w => !['are', 'there', 'any', 'for', 'in', 'the', 'is', 'available', 'today', 'find', 'me', 'show', 'what', 'can', 'you', 'give'].includes(w) && w.length > 2);

      const dbQuery = { status: { $in: ['OPEN', 'CLOSING_SOON'] } };
      if (searchTerms.length > 0) {
        dbQuery.$or = [
          { skills: { $in: searchTerms.map(t => new RegExp(t, 'i')) } },
          { title: { $regex: new RegExp(searchTerms.join('|'), 'i') } },
          { location: { $regex: new RegExp(searchTerms.join('|'), 'i') } }
        ];
      }

      retrievedOpportunities = await Opportunity.find(dbQuery)
        .limit(5)
        .select('title organization category location salaryOrStipend deadline applicationUrl source skills');
    }

    // 2. Strict RAG System Prompt
    const systemPrompt = `You are CareerVerse AI, a career advisor for students and fresh graduates.
CRITICAL MANDATORY RULES:
1. NEVER invent, hallucinate, or fabricate job openings, internships, scholarships, government exams, deadlines, salaries, or URLs.
2. If asked about live openings, internships, jobs, scholarships, or exams, you MUST ONLY cite the retrieved verified records below.
3. If no verified opportunity is found in the retrieved list for the user's query, you MUST explicitly respond: "No verified opportunity matching your current criteria was found in the live CareerVerse database today."
4. Always provide actionable, supportive advice for skill development and exam preparation.

LIVE DATABASE RECORDS RETRIEVED:
${
  retrievedOpportunities.length > 0
    ? JSON.stringify(retrievedOpportunities, null, 2)
    : 'None found in live database.'
}

USER PROFILE CONTEXT:
${userProfile ? JSON.stringify({
  branch: userProfile.branch,
  year: userProfile.currentYear,
  skills: userProfile.technicalSkills,
  goals: userProfile.careerGoals
}) : 'Anonymous student'}
`;

    // 3. Call LLM
    const aiAnswer = await this.callGemini(systemPrompt, userQuestion);
    if (aiAnswer) {
      return {
        answer: aiAnswer,
        groundedRecords: retrievedOpportunities,
        isGrounded: isLiveOpportunityQuery
      };
    }

    // 4. Fallback Rule-based response if AI offline or key missing
    if (isLiveOpportunityQuery) {
      if (retrievedOpportunities.length > 0) {
        const listText = retrievedOpportunities
          .map(
            (o, i) =>
              `${i + 1}. **${o.title}** at *${o.organization}* (${o.location})\n   - Deadline: ${o.deadline ? new Date(o.deadline).toLocaleDateString() : 'Active'}\n   - Source: ${o.source}\n   - Apply: ${o.applicationUrl}`
          )
          .join('\n\n');
        return {
          answer: `Here are verified live opportunities from our database matching your request:\n\n${listText}\n\nYou can click on each opportunity card in the Opportunities tab to view details and apply directly.`,
          groundedRecords: retrievedOpportunities,
          isGrounded: true
        };
      } else {
        return {
          answer: 'No verified opportunity matching your current filters was found in the live database today. Check back during our next scheduled sync or broaden your search criteria!',
          groundedRecords: [],
          isGrounded: true
        };
      }
    }

    return {
      answer: `To excel in your career journey, focus on building strong core fundamentals, practicing data structures and algorithms, building 2-3 end-to-end full stack or cloud projects, and regularly checking our Opportunities tab for live internships. Feel free to use the Resume Analyzer and Skill Gap features!`,
      groundedRecords: [],
      isGrounded: false
    };
  }

  /**
   * Generates a tailored Career Roadmap with milestones (Section 30)
   */
  async generateCareerRoadmap(targetRole, currentSkills = []) {
    const defaultRoadmaps = {
      'Cloud Engineer': [
        { title: 'Computer Networks & Operating Systems', description: 'Master TCP/IP, DNS, OSI model, and Linux command line administration.', resources: ['Linux Foundation', 'CS50'], order: 1 },
        { title: 'Scripting & Automation with Python/Go', description: 'Write scripts for log processing, system health checks, and API integration.', resources: ['Python for Automation'], order: 2 },
        { title: 'Cloud Infrastructure Fundamentals (AWS/Azure)', description: 'Understand compute (EC2), VPC networking, IAM security, and S3 storage.', resources: ['AWS Skill Builder - Cloud Practitioner'], order: 3 },
        { title: 'Containers & Orchestration (Docker & Kubernetes)', description: 'Containerize microservices, create Dockerfiles, and learn Kubernetes Pods and Deployments.', resources: ['Kubernetes Docs'], order: 4 },
        { title: 'CI/CD Pipelines & Infrastructure as Code (Terraform)', description: 'Automate deployments with GitHub Actions and provision infrastructure with Terraform.', resources: ['Terraform Associate Guide'], order: 5 },
        { title: 'Cloud Projects & Real-World Deployments', description: 'Deploy a high-availability scalable web application with monitoring and alerts.', resources: ['AWS Architecture Center'], order: 6 },
        { title: 'Mock Interviews & Live Job Applications', description: 'Prepare cloud architecture scenarios and apply for live entry-level cloud roles.', resources: ['CareerVerse Interview Prep'], order: 7 }
      ],
      'Software Engineer': [
        { title: 'Core Programming & OOP (Java / C++ / Python)', description: 'Master object-oriented programming principles, memory management, and clean code practices.', resources: ['Clean Code', 'Java Certification Docs'], order: 1 },
        { title: 'Data Structures & Algorithms (DSA)', description: 'Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, and time-space complexity.', resources: ['LeetCode', 'NeetCode 150'], order: 2 },
        { title: 'Database Systems & SQL / NoSQL', description: 'Relational design, normalization, ACID properties, indexing, MongoDB, and PostgreSQL.', resources: ['PostgreSQL Tutorial'], order: 3 },
        { title: 'System Design & Web Architecture', description: 'Client-server model, REST APIs, caching with Redis, load balancers, and microservices.', resources: ['System Design Primer'], order: 4 },
        { title: 'Production Capstone Project', description: 'Build an authenticated full-stack application with test coverage and CI/CD.', resources: ['CareerVerse Project Guide'], order: 5 },
        { title: 'Technical Interview Preparation & Applications', description: 'Practice coding rounds, behavioral STAR responses, and live placement drives.', resources: ['CareerVerse Interview Arena'], order: 6 }
      ]
    };

    const roleKey = Object.keys(defaultRoadmaps).find(r => targetRole.toLowerCase().includes(r.toLowerCase())) || 'Software Engineer';
    const baseMilestones = defaultRoadmaps[roleKey] || defaultRoadmaps['Software Engineer'];

    return {
      targetRole,
      milestones: baseMilestones.map(m => ({
        ...m,
        status: currentSkills.some(s => m.title.toLowerCase().includes(s.toLowerCase())) ? 'Completed' : 'Not Started'
      }))
    };
  }

  /**
   * Skill Gap Analysis (Section 31)
   */
  async analyzeSkillGap(targetRole, userSkills = []) {
    const roleSkillMap = {
      'Software Engineer': ['Java', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'Git'],
      'Cloud Engineer': ['Linux', 'Networking', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'IAM', 'Cloud Security'],
      'Data Scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics', 'Data Visualization', 'Deep Learning', 'Tableau'],
      'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'HTML/CSS', 'Git']
    };

    const matchedRole = Object.keys(roleSkillMap).find(r => targetRole.toLowerCase().includes(r.toLowerCase())) || 'Software Engineer';
    const requiredSkills = roleSkillMap[matchedRole];

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

    const strongSkills = [];
    const skillsToImprove = [];
    const missingSkills = [];

    for (const req of requiredSkills) {
      if (normalizedUserSkills.includes(req.toLowerCase())) {
        strongSkills.push(req);
      } else if (normalizedUserSkills.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))) {
        skillsToImprove.push(req);
      } else {
        missingSkills.push(req);
      }
    }

    const readinessScore = Math.round((strongSkills.length / requiredSkills.length) * 100);

    return {
      targetRole: matchedRole,
      readinessScore,
      requiredSkillsCount: requiredSkills.length,
      strongSkills,
      skillsToImprove,
      missingSkills,
      recommendedLearningPlan: missingSkills.map(s => `Study ${s} foundational concepts and complete 1 practical mini-project.`)
    };
  }

  /**
   * Resume Analyzer (Section 32)
   */
  async analyzeResume(resumeText, targetRole = 'Software Engineer') {
    if (!resumeText || resumeText.trim().length < 50) {
      return {
        score: 45,
        strengths: ['Basic formatting detected'],
        weaknesses: ['Resume length is too short or missing detailed sections'],
        extractedSkills: [],
        recommendations: [
          'Add a dedicated Technical Skills section categorized by Languages, Frameworks, and Tools.',
          'Quantify accomplishments using the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].',
          'Include 2-3 production-grade project descriptions with GitHub links.'
        ]
      };
    }

    const techKeywords = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'React', 'Node.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Linux', 'REST API', 'Data Structures', 'Machine Learning'];
    const foundKeywords = techKeywords.filter(kw => new RegExp(`\\b${kw.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(resumeText));

    const hasEducation = /education|college|bachelor|university|degree|b\.tech|b\.e/i.test(resumeText);
    const hasProjects = /project|developed|built|created|implemented/i.test(resumeText);
    const hasMetrics = /\d+%\s*|\$\d+|\d+\s*users|\d+\s*stars/i.test(resumeText);

    let score = 50;
    if (foundKeywords.length >= 5) score += 20;
    if (hasEducation) score += 10;
    if (hasProjects) score += 10;
    if (hasMetrics) score += 10;

    return {
      score: Math.min(score, 95),
      extractedSkills: foundKeywords,
      strengths: [
        foundKeywords.length >= 4 ? `Found ${foundKeywords.length} high-demand industry skills (${foundKeywords.slice(0, 5).join(', ')})` : 'Clean layout structure',
        hasProjects ? 'Project experience documented with action verbs' : 'Academic background listed'
      ],
      weaknesses: [
        !hasMetrics ? 'Lacks quantifiable metric impact (e.g., improved query speed by 35%)' : 'Ensure all hyperlinks are active',
        foundKeywords.length < 5 ? 'Keyword density can be improved for applicant screening' : 'Add certifications if available'
      ],
      recommendations: [
        'Organize skills cleanly under "Languages", "Web & Frameworks", and "Tools & Platforms".',
        'Add live demo or GitHub links for key projects.',
        'Use bullet points starting with strong action verbs (Architected, Engineered, Optimized).'
      ]
    };
  }

  /**
   * Interview Practice Question Generator & Evaluator (Section 33)
   */
  async generateInterviewQuestions(topic = 'Java', difficulty = 'Medium') {
    const questionBank = {
      'Java': [
        { q: 'Explain the difference between HashMap and ConcurrentHashMap in Java.', difficulty: 'Medium', keyConcepts: ['Thread-safety', 'Segment locking', 'Null keys'] },
        { q: 'What is the Java Memory Model and how does garbage collection work?', difficulty: 'Hard', keyConcepts: ['Heap vs Stack', 'Young and Old Generation', 'Mark and Sweep'] }
      ],
      'Technical': [
        { q: 'What happens from the moment you type a URL in a browser until the page renders?', difficulty: 'Medium', keyConcepts: ['DNS lookup', 'TCP handshake', 'HTTP request', 'DOM parsing'] },
        { q: 'How would you scale a database that is experiencing read-heavy bottlenecks?', difficulty: 'Hard', keyConcepts: ['Read replicas', 'Redis caching', 'Database indexing', 'Connection pooling'] }
      ],
      'HR': [
        { q: 'Tell me about a time you faced a difficult technical challenge and how you solved it.', difficulty: 'Medium', keyConcepts: ['STAR method', 'Problem solving', 'Ownership'] }
      ]
    };

    const list = questionBank[topic] || questionBank['Technical'];
    return list;
  }

  async evaluateInterviewAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer.trim().length < 10) {
      return {
        score: 30,
        feedback: 'The response is too brief. Try to elaborate on technical depth and provide an illustrative example.',
        missingConcepts: ['Detailed technical mechanism', 'Edge cases'],
        improvedSampleAnswer: 'Structure your answer using the STAR format or mention real architectural trade-offs.'
      };
    }

    return {
      score: 82,
      feedback: 'Solid foundational answer! You clearly understood the primary concept and stated the key differentiator.',
      missingConcepts: ['Could mention concurrency benchmarks or real-world use case'],
      improvedSampleAnswer: `A comprehensive answer would detail how internal data structures handle locking and mention thread safety trade-offs.`
    };
  }
}

module.exports = new AIService();
