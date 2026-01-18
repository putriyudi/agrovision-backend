import express from "express";
import Telemetry from "../models/Telemetry.js";
import Drone from "../models/Drone.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET list (filter)
router.get("/", verifyToken, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 5000);
  const where = {};
  if (req.query.drone_id) where.drone_id = Number(req.query.drone_id);

  const rows = await Telemetry.findAll({
    where,
    limit,
    order: [["timestamp", "DESC"]],
    include: [{ model: Drone }],
  });

  // biar chart gampang: balikin urut lama -> baru
  res.json(rows.reverse());
});

// GET latest
router.get("/latest", verifyToken, async (req, res) => {
  const where = {};
  if (req.query.drone_id) where.drone_id = Number(req.query.drone_id);

  const row = await Telemetry.findOne({
    where,
    order: [["timestamp", "DESC"]],
    include: [{ model: Drone }],
  });

  if (!row) return res.json(null);
  res.json(row);
});

// POST ingest (admin & operator boleh)
router.post("/", verifyToken, requireRole("admin", "operator"), async (req, res) => {
  try {
    const created = await Telemetry.create(req.body);
    res.json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

export default router;