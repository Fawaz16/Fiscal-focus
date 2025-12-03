const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { errorHandler } = require("./middleware/errorhandler");

dotenv.config();
const app = express();

//configure rate limiter
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW)
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

//security and rate limiting
app.use("/api/", rateLimiterMiddleware);
app.use(helmet());

//body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.FRONTEND_DEV_URL
        : process.env.FRONTEND_PROD_URL,
    credentials: true
  })
);

//logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//compression
app.use(compression());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    success: true,
    timestamp: new Date().toISOString()
  });
});

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

//error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
