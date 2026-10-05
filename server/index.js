const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
app.use(express.json());

// Log every API request: method, url, status, time taken, and body for writes
app.use("/api", (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const body = ["POST", "PUT"].includes(req.method)
      ? ` ${JSON.stringify(req.body)}`
      : "";
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms${body}`
    );
  });
  next();
});

// API routes
app.use("/api/todos", todoRoutes);

// Express error middleware for database fallback
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — returning mock empty response");
    if (req.method === "GET") {
      return res.json(
        req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {}
      );
    }
    return res
      .status(503)
      .json({ message: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// Serve the React build (used in production)
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

mongoose.set("bufferCommands", false);
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/mock")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) =>
    console.warn(
      "MongoDB not connected — using in-memory store fallback:",
      err.message
    )
  );

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
