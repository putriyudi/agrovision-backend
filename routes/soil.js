import express from "express";
import SoilReading from "../models/SoilReading.js";
import Field from "../models/Field.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET list
router.get("/readings", verifyToken, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 5000);
  const where = {};
  if (req.query.field_id) where.field_id = Number(req.query.field_id);

  const rows = await SoilReading.findAll({
    where,
    limit,
    order: [["timestamp", "DESC"]],
    include: [{ model: Field }],
  });

  res.json(rows.reverse());
});

// GET latest (format "dashboard-friendly")
router.get("/latest", verifyToken, async (req, res) => {
  const where = {};
  if (req.query.field_id) where.field_id = Number(req.query.field_id);

  const row = await SoilReading.findOne({ where, order: [["timestamp", "DESC"]] });

  if (!row) {
    return res.json({
      moisture: 0,
      temperature: 0,
      status: "Unknown",
      timestamp: Date.now(),
      weather: "-",
      recommendation: "-",
    });
  }

  const status = row.moisture >= 45 ? "Suitable" : "Not Suitable";
  res.json({
    moisture: row.moisture,
    temperature: row.temperature,
    status,
    timestamp: row.timestamp,
    weather: row.temperature >= 30 ? "Sunny" : "Cloudy",
    recommendation:
      status === "Suitable"
        ? "Continue mapping priority plots."
        : "Check irrigation + moisture level.",
  });
});

// POST ingest (admin & operator boleh)
router.post("/readings", verifyToken, requireRole("admin", "operator"), async (req, res) => {
  try {
    const created = await SoilReading.create(req.body);
    res.json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

export default router;