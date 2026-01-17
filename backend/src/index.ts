import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { corsMiddleware } from './middleware/cors';
import { explainRouter } from './routes/explain';
import { chatRouter } from './routes/chat';
import { sessionRouter } from './routes/session';
import { validateRouter } from './routes/validate';
import { supportChatRouter } from './routes/supportChat';
import formsRouter from './routes/forms';
import eligibilityRouter from './routes/eligibility';
import demoRouter from './routes/demo';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'FormBridge API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/forms', formsRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/explain', explainRouter);
app.use('/api/chat', chatRouter);
app.use('/api/session', sessionRouter);
app.use('/api/validate', validateRouter);
app.use('/api/support-chat', supportChatRouter);
app.use('/api/demo', demoRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formbridge';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /              - Health check');
  console.log('  GET  /forms         - List available forms');
  console.log('  GET  /forms/:id     - Get full form template');
  console.log('  POST /eligibility   - Check eligibility');
  console.log('  POST /explain       - Get explanation for a form question');
  console.log('  POST /chat          - Chat about a form question');
  console.log('  GET  /session/:id   - Load session');
  console.log('  POST /session       - Save session');
  console.log('  POST /validate      - Validate form answers');
  console.log('  GET  /demo/session  - Load demo session');
  console.log('  POST /demo/reset    - Reset demo session');
  console.log('  GET  /demo/personas - List demo personas');
});

export { app };
