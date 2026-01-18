import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Telemetry = db.define(
  "telemetry",
  {
    drone_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pitch: { type: DataTypes.FLOAT, defaultValue: 0 },
    yaw: { type: DataTypes.FLOAT, defaultValue: 0 },
    roll: { type: DataTypes.FLOAT, defaultValue: 0 },
    altitude: DataTypes.FLOAT,
    battery: DataTypes.FLOAT,
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false }
);

export default Telemetry;