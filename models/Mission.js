import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Mission = db.define(
  "missions",
  {
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    drone_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    status: { type: DataTypes.ENUM("planned", "running", "completed", "cancelled"), defaultValue: "planned" },
    notes: DataTypes.TEXT,
  },
  { freezeTableName: true, timestamps: true }
);

export default Mission;