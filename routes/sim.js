import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";

import Drone from "../models/Drone.js";
import Field from "../models/Field.js";
import Telemetry from "../models/Telemetry.js";
import SoilReading from "../models/SoilReading.js";

const router = express.Router();

let teleTimer = null;
let soilTimer = null;

// state biar geraknya halus (random walk)
let state = {
  t: 0,
  altitude: 10,
  pitch: 0,
  roll: 0,
  yaw: 90,
  battery: 100,
  droneId: null,
  fieldId: null,
};

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

async function ensureDroneAndField() {
  // ensure field
  let field = await Field.findOne();
  if (!field) {
    field = await Field.create({
      name: "Demo Field A",
      location: "Demo Location",
      area_ha: 1.25,
      status: "Unknown",
      notes: "Auto created by simulator",
    });
  }

  // ensure drone
  let drone = await Drone.findOne();
  if (!drone) {
    drone = await Drone.create({
      field_id: field.id,
      name: "Drone Demo A",
      serial_no: "SIM-DRONE-001",
      status: "active",
      last_seen: new Date(),
    });
  }

  state.droneId = drone.id;
  state.fieldId = field.id;

  return { drone, field };
}

function startTelemetryLoop() {
  if (teleTimer) return;

  teleTimer = setInterval(async () => {
    try {
      state.t += 1;

      // altitude random walk + gelombang biar enak dilihat
      state.altitude = clamp(
        state.altitude + rand(-0.6, 0.9) + Math.sin(state.t / 8) * 0.15,
        2,
        80
      );

      // pitch/roll bergerak kecil-kecil
      state.pitch = clamp(state.pitch + rand(-1.8, 1.8), -18, 18);
      state.roll = clamp(state.roll + rand(-1.5, 1.5), -15, 15);

      // yaw perlahan muter 0-359
      state.yaw = (state.yaw + rand(2, 8)) % 360;

      // battery turun pelan
      state.battery = clamp(state.battery - rand(0.01, 0.06), 10, 100);

      await Telemetry.create({
        drone_id: state.droneId,
        pitch: state.pitch,
        yaw: state.yaw,
        roll: state.roll,
        altitude: state.altitude,
        battery: state.battery,
        timestamp: new Date(),
      });

      // update last_seen drone biar kelihatan aktif
      await Drone.update(
        { last_seen: new Date(), status: "active" },
        { where: { id: state.droneId } }
      );
    } catch (e) {
      // biar nggak spam
      // console.error("Telemetry sim error:", e.message);
    }
  }, 1000);
}

function startSoilLoop() {
  if (soilTimer) return;

  soilTimer = setInterval(async () => {
    try {
      // soil random tapi masuk akal
      const moisture = clamp(55 + Math.sin(state.t / 12) * 8 + rand(-3, 3), 5, 95);
      const temperature = clamp(29 + Math.cos(state.t / 15) * 2 + rand(-0.8, 0.8), 20, 38);
      const ph = clamp(6.5 + Math.sin(state.t / 25) * 0.3 + rand(-0.1, 0.1), 4.5, 8.5);

      await SoilReading.create({
        field_id: state.fieldId,
        moisture,
        temperature,
        ph,
        timestamp: new Date(),
      });
    } catch (e) {
      // console.error("Soil sim error:", e.message);
    }
  }, 3000);
}

function stopLoops() {
  if (teleTimer) clearInterval(teleTimer);
  if (soilTimer) clearInterval(soilTimer);
  teleTimer = null;
  soilTimer = null;
}

// STATUS
router.get("/status", verifyToken, (req, res) => {
  res.json({
    telemetry_running: !!teleTimer,
    soil_running: !!soilTimer,
    droneId: state.droneId,
    fieldId: state.fieldId,
  });
});

// START (admin)
router.post("/start", verifyToken, requireRole("admin"), async (req, res) => {
  await ensureDroneAndField();

  // optional: reset state kalau mau
  if (req.body?.reset === true) {
    state.t = 0;
    state.altitude = 10;
    state.pitch = 0;
    state.roll = 0;
    state.yaw = 90;
    state.battery = 100;
  }

  startTelemetryLoop();
  startSoilLoop();

  res.json({ ok: true, msg: "Simulator started", droneId: state.droneId, fieldId: state.fieldId });
});

// STOP (admin)
router.post("/stop", verifyToken, requireRole("admin"), (req, res) => {
  stopLoops();
  res.json({ ok: true, msg: "Simulator stopped" });
});

// (opsional) RESET DATA (hapus tabel) - admin
router.post("/reset-data", verifyToken, requireRole("admin"), async (req, res) => {
  await Telemetry.destroy({ where: {} });
  await SoilReading.destroy({ where: {} });
  res.json({ ok: true, msg: "Telemetry & soil_readings cleared" });
});

export default router;