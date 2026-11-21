import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_seo_assistant';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI Content and SEO Writing Assistant API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Main API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Connect to MongoDB & Start Server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ MongoDB connection deferred or offline. Running with seamless in-memory fallback store.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 AI Content & SEO Server running at http://localhost:${PORT}`);
  });
}

startServer();

export default app;