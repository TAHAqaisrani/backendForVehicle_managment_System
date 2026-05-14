import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes      from './src/routes/auth.js';
import bookingRoutes   from './src/routes/bookings.js';
import jobCardRoutes   from './src/routes/jobCards.js';
import repairLogRoutes from './src/routes/repairLogs.js';
import invoiceRoutes   from './src/routes/invoices.js';
import vehicleRoutes   from './src/routes/vehicles.js';
import packageRoutes   from './src/routes/packages.js';
import dashboardRoutes from './src/routes/dashboard.js';
import searchRoutes    from './src/routes/search.js';
import userRoutes      from './src/routes/users.js';

const app = express();

const allowedOrigins = [
  'https://frontend-for-vehicle-managment-syst.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/bookings',    bookingRoutes);
app.use('/api/job-cards',   jobCardRoutes);
app.use('/api/repair-logs', repairLogRoutes);
app.use('/api/invoices',    invoiceRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/packages',    packageRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/search',      searchRoutes);
app.use('/api/users',       userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 Vehicle Service API running on http://localhost:${PORT}`);
});
