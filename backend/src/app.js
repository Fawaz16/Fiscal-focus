const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { errorHandler } = require("./middleware/errorhandler");
const path = require("path");

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const balanceRoutes = require('./routes/balanceRoutes');

dotenv.config();
const app = express();

// Configure rate limiter
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW) || 15
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        message: "Too many requests from the IP, please try again later."
      });
    });
};

// Security and rate limiting
app.use("/api/", rateLimiterMiddleware);
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.FRONTEND_DEV_URL
        : process.env.FRONTEND_PROD_URL,
    credentials: true
  })
);

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Compression
app.use(compression());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    success: true,
    timestamp: new Date().toISOString(),
    service: "Fiscal Focus API",
    version: "1.0.0"
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/user/balance', balanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;