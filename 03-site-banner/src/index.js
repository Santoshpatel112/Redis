import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
const BANNER_KEY = "site_banner";

redis.on("connect", () => console.log("[ioredis] connecting to Redis"));
redis.on("ready", () => console.log("[ioredis] connected to Redis"));
redis.on("error", (error) => console.error("[ioredis] error:", error));
redis.on("close", () => console.log("[ioredis] connection closed"));

app.use((req, res, next) => {
  console.log(`[request] ${req.method} ${req.url}`);
  next();
});

app.post("/banner", async (req, res) => {
  try {
    const { message } = req.body;
    await redis.set(BANNER_KEY, message || "Welcome to our site!");
    return res.json({ message: "Banner updated successfully" });
  } catch (error) {
    console.error("Error setting banner:", error);
    return res.status(500).json({ error: "Failed to update banner" });
  }
});

app.get("/banner", async (req, res) => {
  try {
    const bannerMessage = await redis.get(BANNER_KEY);
    return res.json({ banner: bannerMessage });
  } catch (error) {
    console.error("Error reading banner:", error);
    return res.status(500).json({ error: "Failed to read banner" });
  }
});

app.delete("/banner", async (req, res) => {
  try {
    await redis.del(BANNER_KEY);
    return res.json({ message: "Banner removed successfully" });
  } catch (error) {
    console.error("Error removing banner:", error);
    return res.status(500).json({ error: "Failed to remove banner" });
  }
});

app.get("/banner/exit", async (req, res) => {
  try {
    const exists = await redis.exists(BANNER_KEY);
    return res.json({
      message: exists ? "Banner exists" : "No banner set",
      exists: Boolean(exists),
    });
  } catch (error) {
    console.error("Error checking banner existence:", error);
    return res.status(500).json({ error: "Failed to check banner status" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", method: req.method, path: req.path });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
