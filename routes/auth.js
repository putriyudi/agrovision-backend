import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ msg: "username & password wajib" });

    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(400).json({ msg: "username sudah dipakai" });

    const u = await User.create({
      name: name || username,
      username,
      password,
      role: role || "operator",
    });

    res.json({ id: u.id, name: u.name, username: u.username, role: u.role });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const u = await User.findOne({ where: { username } });
    if (!u) return res.status(400).json({ msg: "Username tidak ditemukan" });

    if (u.password !== password) return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign(
      { id: u.id, username: u.username, role: u.role, name: u.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: u.id, name: u.name, username: u.username, role: u.role } });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

export default router;