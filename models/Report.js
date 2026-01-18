import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Report = db.define(
  "reports",
  {
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    result: { type: DataTypes.ENUM("Suitable", "Not Suitable", "Unknown"), defaultValue: "Unknown" },
    score: DataTypes.FLOAT,
    summary: DataTypes.TEXT,
  },
  { freezeTableName: true, timestamps: true }
);

export default Report;