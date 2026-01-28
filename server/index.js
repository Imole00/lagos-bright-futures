import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import orphanageRoutes from './routes/orphanages.js';
import documentRoutes from './routes/documents.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orphanages', orphanageRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Lagos Bright Futures API'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🌟 Lagos Bright Futures Initiative API Server           ║
║                                                            ║
║  Status: Running                                          ║
║  Port: ${PORT}                                               ║
║  Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                            ║
║  API Endpoints:                                           ║
║  - POST /api/auth/register                                ║
║  - POST /api/auth/login                                   ║
║  - GET  /api/orphanages                                   ║
║  - POST /api/orphanages                                   ║
║  - GET  /api/orphanages/stats/overview                    ║
║  - POST /api/documents/upload                             ║
║                                                            ║
║  Ready to make an impact! 🚀                              ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
