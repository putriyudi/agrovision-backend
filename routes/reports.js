import express from "express";
import Report from "../models/Report.js";
import Field from "../models/Field.js";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const rows = await Report.findAll({
    order: [["id", "DESC"]],
    include: [{ model: Field }, { model: User, attributes: ["id", "username", "name", "role"] }],
  });
  res.json(rows);
});

router.get("/:id", verifyToken, async (req, res) => {
  const row = await Report.findByPk(req.params.id, {
    include: [{ model: Field }, { model: User, attributes: ["id", "username", "name", "role"] }],
  });
  if (!row) return res.status(404).json({ msg: "Not found" });
  res.json(row);
});

// CREATE (admin) - created_by otomatis
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const payload = { ...req.body, created_by: req.user.id };
    const created = await Report.create(payload);
    res.json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.patch("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Report.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.update(req.body);
  res.json(row);
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const row = await Report.findByPk(req.params.id);
  if (!row) return res.status(404).json({ msg: "Not found" });

  await row.destroy();
  res.json({ msg: "deleted" });
});

export default router;