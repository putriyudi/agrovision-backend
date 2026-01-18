import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const SoilReading = db.define(
  "soil_readings",
  {
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    moisture: { type: DataTypes.FLOAT, defaultValue: 0 },
    temperature: { type: DataTypes.FLOAT, defaultValue: 0 },
    ph: DataTypes.FLOAT,
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false }
);

export default SoilReading;