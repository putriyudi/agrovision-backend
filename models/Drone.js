import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Drone = db.define(
  "drones",
  {
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    serial_no: { type: DataTypes.STRING, allowNull: true, unique: true },
    status: { type: DataTypes.ENUM("active", "inactive", "maintenance"), defaultValue: "inactive" },
    last_seen: DataTypes.DATE,
  },
  { freezeTableName: true, timestamps: true }
);

export default Drone;