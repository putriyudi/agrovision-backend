import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Camera = db.define(
  "cameras",
  {
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    stream_url: DataTypes.STRING,
    status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "inactive" },
  },
  { freezeTableName: true, timestamps: true }
);

export default Camera;