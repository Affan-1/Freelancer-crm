require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const { errorHandler, notFound } = require("./middleware/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require("./routes/project.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const notificationRoutes = require("./routes/notification.routes");
const eventRoutes = require("./routes/event.routes");
const teamRoutes = require("./routes/team.routes");

// Connect MongoDB
connectDB();

const app = express();

// Required on Render so the rate limiter sees each user's real IP
app.set("trust proxy", 1);

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

app.use("/api", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/team", teamRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Freelancer CRM API Running Successfully",
  });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;