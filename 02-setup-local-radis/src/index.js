import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";
const app = express();

export const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");


app.get("/redis", async (req, res) => {
  try {
    if (redis.status !== "ready") {
      await redis.connect();
    }
    const reply = await redis.ping();
    return res.json({ message: "Hello from Express and Redis!", reply });
  } catch (error) {
    console.error("Redis ping failed:", error);
    return res.status(503).json({ error: "Redis is unavailable" });
  }
});

app.get("/mongo", async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/radis");
    return res.json({
      message: "Hello from Express and MongoDB!",
      database: mongoose.connection.db.databaseName,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return res.status(500).json({ error: "Failed to connect to MongoDB" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
