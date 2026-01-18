import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Field = db.define(
  "fields",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    location: DataTypes.STRING,
    area_ha: DataTypes.FLOAT,
    status: { type: DataTypes.ENUM("Suitable", "Not Suitable", "Unknown"), defaultValue: "Unknown" },
    notes: DataTypes.TEXT,
  },
  { freezeTableName: true, timestamps: true }
);

export default Field;