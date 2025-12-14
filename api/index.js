import express from "express";

const app = express();
app.use(express.json());

// Only API routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Let Vercel handle static files
export default app;
