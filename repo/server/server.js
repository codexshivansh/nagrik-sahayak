// Nagrik Sahayak backend — serves scheme data from Supabase Postgres.
// Matching/eligibility logic stays on the frontend (client-side); this
// API's only job is to return the up-to-date scheme list as JSON in the
// same shape the frontend already expects.

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "WARNING: DATABASE_URL is not set. Set it in Render's Environment " +
    "tab to your Supabase connection string (Project Settings > Database " +
    "> Connection string > URI, 'Transaction' pooler mode recommended)."
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const app = express();
app.use(cors()); // open CORS — this is a public read-only data API, no auth needed
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// GET /api/schemes -> full list of schemes, same shape as the old
// hardcoded SCHEMES array: {id, name, category, tags, description,
// benefits, documents, link, criteria}
app.get("/api/schemes", async (req, res) => {
  try {
    const result = await pool.query(
      "select id, name, category, tags, description, benefits, documents, link, criteria from schemes order by id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schemes:", err.message);
    res.status(500).json({ error: "Failed to fetch schemes", detail: err.message });
  }
});

// POST /api/feedback -> stores user feedback / feature requests in Supabase.
// Body: { type: "feedback" | "feature_request", message: string, name?: string, lang?: string }
app.post("/api/feedback", async (req, res) => {
  try {
    const { type, message, name, lang } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    const safeType = type === "feature_request" ? "feature_request" : "feedback";
    const safeMessage = message.trim().slice(0, 2000);
    const safeName = typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : null;
    const safeLang = typeof lang === "string" ? lang.slice(0, 5) : null;

    await pool.query(
      "insert into feedback (type, message, name, lang) values ($1, $2, $3, $4)",
      [safeType, safeMessage, safeName, safeLang]
    );
    res.status(201).json({ status: "ok" });
  } catch (err) {
    console.error("Error saving feedback:", err.message);
    res.status(500).json({ error: "Failed to save feedback", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Nagrik Sahayak backend listening on port ${PORT}`);
});
