import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import db from "./config/Database.js";
import "./models/Relations.js"; // load associations ONCE

import authRoutes from "./routes/auth.js";
import fieldRoutes from "./routes/fields.js";
import droneRoutes from "./routes/drones.js";
import missionRoutes from "./routes/missions.js";
import reportRoutes from "./routes/reports.js";
import telemetryRoutes from "./routes/telemetry.js";
import soilRoutes from "./routes/soil.js";
import simRoutes from "./routes/sim.js";
import controlRoutes from "./routes/control.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// path helper (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ serve FRONTEND statics (index.html, css, js, vendor chart)
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// APIs
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/soil", soilRoutes);
app.use("/api/sim", simRoutes);
app.use("/api/control", controlRoutes);

// ✅ alias routes (kalau frontend lama masih pakai tanpa /api)
app.get("/telemetry", (req, res) => {
  req.url = "/";
  telemetryRoutes(req, res);
});

app.get("/soil/latest", (req, res) => {
  req.url = "/latest";
  soilRoutes(req, res);
});

app.get("/soil/readings", (req, res) => {
  req.url = "/readings";
  soilRoutes(req, res);
});

app.post("/telemetry", (req, res) => {
  req.url = "/";
  telemetryRoutes(req, res);
});

app.post("/soil/readings", (req, res) => {
  req.url = "/readings";
  soilRoutes(req, res);
});

// health
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

(async () => {
  try {
    await db.authenticate();
    console.log("DB connected");
    app.listen(PORT, () => console.log(`Backend running: http://localhost:${PORT}`));
  } catch (e) {
    console.error("DB error:", e.message);
  }
})();