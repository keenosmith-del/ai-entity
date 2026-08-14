import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import conversationRoutes from "./routes/conversationRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

app.use("/api/conversations", conversationRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Entity API is running",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();