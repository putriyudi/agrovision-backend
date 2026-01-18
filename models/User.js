import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const User = db.define(
  "users",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // plain text (demo)
    role: { type: DataTypes.ENUM("admin", "operator"), allowNull: false, defaultValue: "operator" },
  },
  { freezeTableName: true, timestamps: true }
);

export default User;