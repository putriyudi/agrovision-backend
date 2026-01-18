import express from "express";
import Drone from "../models/Drone.js";
import Mission from "../models/Mission.js";
import Field from "../models/Field.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// list drones (for dropdown)
router.get("/drones", verifyToken, async (req, res) => {
  const drones = await Drone.findAll({ order: [["id", "DESC"]] });
  res.json(drones);
});

// set target altitude (admin/operator ok)
router.post("/target-altitude", verifyToken, requireRole("admin", "operator"), async (req, res) => {
  const { drone_id, target_altitude } = req.body;
  if (!drone_id) return res.status(400).json({ msg: "drone_id wajib" });

  const d = await Drone.findByPk(drone_id);
  if (!d) return res.status(404).json({ msg: "Drone not found" });

  await d.update({
    target_altitude: target_altitude == null ? null : Number(target_altitude),
    last_command: `SET_ALT:${target_altitude}`,
    last_seen: new Date(),
  });

  res.json({ ok: true, drone: d });
});

// start mission (admin)
router.post("/mission/start", verifyToken, requireRole("admin"), async (req, res) => {
  const { field_id, drone_id, name } = req.body;
  if (!field_id || !drone_id) return res.status(400).json({ msg: "field_id & drone_id wajib" });

  // set drone active
  const d = await Drone.findByPk(drone_id);
  if (!d) return res.status(404).json({ msg: "Drone not found" });

  await d.update({ status: "active", last_command: "MISSION_START", last_seen: new Date() });

  const m = await Mission.create({
    field_id: Number(field_id),
    drone_id: Number(drone_id),
    name: name || `Mission ${new Date().toLocaleString()}`,
    start_time: new Date(),
    status: "running",
    notes: "Started via Control Panel",
  });

  res.json({ ok: true, mission: m });
});

// stop mission (admin)
router.post("/mission/stop", verifyToken, requireRole("admin"), async (req, res) => {
  const { mission_id, status } = req.body;
  if (!mission_id) return res.status(400).json({ msg: "mission_id wajib" });

  const m = await Mission.findByPk(mission_id);
  if (!m) return res.status(404).json({ msg: "Mission not found" });

  await m.update({
    end_time: new Date(),
    status: status || "completed",
    notes: (m.notes || "") + "\nStopped via Control Panel",
  });

  // optionally update drone command
  await Drone.update(
    { last_command: "MISSION_STOP", last_seen: new Date() },
    { where: { id: m.drone_id } }
  );

  res.json({ ok: true, mission: m });
});

// emergency stop (admin)
router.post("/emergency-stop", verifyToken, requireRole("admin"), async (req, res) => {
  const { drone_id } = req.body;
  if (!drone_id) return res.status(400).json({ msg: "drone_id wajib" });

  const d = await Drone.findByPk(drone_id);
  if (!d) return res.status(404).json({ msg: "Drone not found" });

  await d.update({ status: "maintenance", last_command: "EMERGENCY_STOP", last_seen: new Date() });

  // stop all running missions for this drone
  await Mission.update(
    { status: "cancelled", end_time: new Date(), notes: "Emergency stop triggered" },
    { where: { drone_id: d.id, status: "running" } }
  );

  res.json({ ok: true, msg: "Emergency stop executed", drone: d });
});

export default router;