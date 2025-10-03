const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration: allow Vercel frontend + localhost dev (and any in ALLOWED_ORIGINS env)
const defaultAllowed = [
  'http://localhost:5173', // Vite default dev port
  'http://localhost:3000',
  'https://sietportanz.vercel.app'
];
const envAllowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envAllowed]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser (no origin) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin not allowed')); 
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));

// Explicit preflight handling (optional but clear)
app.options('*', cors());
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || '6mb';
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection using environment variable with improved diagnostics
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('[Startup] MONGODB_URI env variable is NOT set. Database calls will fail.');
}

mongoose.connection.on('connecting', () => console.log('[MongoDB] Connecting...'));
mongoose.connection.on('connected', () => console.log('[MongoDB] Connected.'));
mongoose.connection.on('reconnected', () => console.log('[MongoDB] Reconnected.'));
mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Disconnected.'));
mongoose.connection.on('error', (err) => console.error('[MongoDB] Connection error:', err.message));

// Helper to mask URI for logs
function maskUri(uri) {
  if (!uri) return 'undefined';
  try {
    const withoutCreds = uri.replace(/:\/\/([^@]+)@/, '://***:***@');
    return withoutCreds;
  } catch { return '***'; }
}

console.log('[MongoDB] Attempting to connect to:', maskUri(mongoUri));

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // allow cluster cold start but fail fast enough
};

// Start server only after successful DB connection to avoid buffering timeouts
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

mongoose.connect(mongoUri, mongooseOptions)
  .then(() => {
    console.log('[MongoDB] Initial connection established.');
    startServer();
  })
  .catch(err => {
    console.error('[MongoDB] Failed to connect on startup:', err.message);
    console.error('Tip: Verify Atlas network access (IP allowlist / 0.0.0.0/0), database user credentials, and that the cluster is active.');
    process.exit(1);
  });

// Routes
app.use('/api/questions', require('./routes/questions'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'College Programming Portal API' });
});

// Health endpoint (DB state: 0=disconnected,1=connected,2=connecting,3=disconnecting)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    dbState: mongoose.connection.readyState,
    dbReadable: ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown'
  });
});

// If DB never connects, we never call startServer(). This prevents serving 500s due to buffering.