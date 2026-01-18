import express from "express";
import Drone from "../models/Drone.js";
import Field from "../models/Field.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET all
router.get("/", verifyToken, async (req, res) => {
  const rows = await Drone.findAll({
    order: [["id", "DESC"]],
    include: [{ model: Field }],
  });
  res.json(rows);
});

// GET by id
router.get("/:id", verifyToken, async (req, res) => {
  const row = await Drone.findByPk(req.params.id, { include: [{ model: Field }] });
  if (!row) return res.status(404).json({ msg: "Not found" });
  res.json(row);
});

// CREATE (admin)
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const created = await Drone.create(req.body);
    res.json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// UPDATE (admin)
router.patch("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Drone.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.update(req.body);
  res.json(row);
});

// DELETE (admin)
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Drone.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.destroy();
  res.json({ msg: "deleted" });
});

export default router;