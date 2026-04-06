import express from "express";
import cors from "cors";
// import helmet from 'helmet';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import requestLoggerMiddleware from "./middleware/request-logger.middleware.js";
// import authMiddleware from './middleware/auth.middleware.js';
// import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

// Security Middleware
// app.use(helmet());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:9000",
    "http://localhost:9001",
    "http://localhost:9002",
    "http://localhost:9003",
    "http://localhost:9004",
    "http://localhost:9005",
    "http://localhost:9006",
    "http://localhost:9007",
    "http://localhost:9008",
    "http://localhost:9009",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// app.use(authMiddleware);
app.use(requestLoggerMiddleware);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
});

export default app;
