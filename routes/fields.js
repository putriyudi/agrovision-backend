import express from "express";
import Field from "../models/Field.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const data = await Field.findAll({ order: [["id", "DESC"]] });
  res.json(data);
});

router.get("/:id", verifyToken, async (req, res) => {
  const row = await Field.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });
  res.json(row);
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const created = await Field.create(req.body);
    res.json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.patch("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Field.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.update(req.body);
  res.json(row);
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Field.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.destroy();
  res.json({ msg: "deleted" });
});

export default router;