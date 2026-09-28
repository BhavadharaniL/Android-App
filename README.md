# CareerVerse 🚀
### *"Your Career. Your Opportunities. Your Future."*

CareerVerse is an AI-powered career guidance and opportunity discovery ecosystem designed specifically for college students and fresh graduates. Unlike conventional mockups with hardcoded static lists, CareerVerse is built on a **Strict Live Data Architecture**—dynamically synchronizing verified employment opportunities, public sector notifications, university scholarships, and technology news from legitimate APIs and official portals.

---

## 📂 Project Architecture

The complete system is organized into modular workspaces:
- `/careerverse/backend`: Node.js/Express REST API, Mongoose models, providers (Adzuna, NCS, UPSC/SSC/RRB, NSP, NewsAPI, RSS), duplicate detection, node-cron scheduler, and Gemini RAG service.
- `/careerverse/mobile`: React Native (Expo) mobile application with dynamic home feed, live opportunities, Career AI, mock interviews, resume analyzer, and Wi-Fi device connectivity settings.
- `/careerverse/admin`: Web Admin control center for monitoring live ingestion, manual sync triggers, and sync logs.
- `/careerverse/docs`: Architectural design specifications.

See [careerverse/README.md](file:///c:/Users/Bhavadharani/OneDrive/Apps/Android%20App/careerverse/README.md) for full instructions, quickstart commands, and Android deployment steps.
See [careerverse/DATA_SOURCES.md](file:///c:/Users/Bhavadharani/OneDrive/Apps/Android%20App/careerverse/DATA_SOURCES.md) for external API specifications.
See [careerverse/API_DOCUMENTATION.md](file:///c:/Users/Bhavadharani/OneDrive/Apps/Android%20App/careerverse/API_DOCUMENTATION.md) for complete REST API reference.
