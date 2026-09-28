const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initScheduler } = require('./jobs/scheduler');
const syncService = require('./services/syncService');
const Opportunity = require('./models/Opportunity');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const newsRoutes = require('./routes/newsRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const path = require('path');
const fs = require('fs');

const app = express();

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const adminPath = path.join(__dirname, '../admin');
const mobileDistPath = path.join(__dirname, '../mobile/dist');

// Serve Web Admin Dashboard
app.use('/admin', express.static(adminPath));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});

// Serve Mobile Web Production Bundle
if (fs.existsSync(mobileDistPath)) {
  app.use(express.static(mobileDistPath));
  app.use('/app', express.static(mobileDistPath));
}

// Root Route: Serve Mobile Web App if built, or fallback to Admin Portal
app.get('/', (req, res) => {
  if (fs.existsSync(path.join(mobileDistPath, 'index.html'))) {
    return res.sendFile(path.join(mobileDistPath, 'index.html'));
  }
  res.redirect('/admin');
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'CareerVerse Live Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Apply General Rate Limiter to API routes
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Single-Page Application (SPA) Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(adminPath, 'index.html'));
  }
  if (fs.existsSync(path.join(mobileDistPath, 'index.html'))) {
    return res.sendFile(path.join(mobileDistPath, 'index.html'));
  }
  next();
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Initialize Cron Scheduler for Live Synchronization
    initScheduler();

    // 3. Check if initial live sync is required (if DB is freshly initialized)
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      console.log('[Server] Fresh database detected. Triggering initial live data synchronization cycle...');
      syncService.syncAllSources().catch(err => {
        console.warn('[Server] Initial live sync encountered non-blocking warning:', err.message);
      });
    }

    // 4. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CareerVerse API Server running on port ${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received. Closing HTTP server gracefully...');
      server.close(() => {
        console.log('[Server] Process terminated.');
      });
    });
  } catch (err) {
    console.error(`[Server] Failed to launch server: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
