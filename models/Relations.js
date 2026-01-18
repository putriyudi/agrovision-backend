import User from "./User.js";
import Field from "./Field.js";
import Drone from "./Drone.js";
import Camera from "./Camera.js";
import Telemetry from "./Telemetry.js";
import SoilReading from "./SoilReading.js";
import Mission from "./Mission.js";
import Report from "./Report.js";

// Field relations
Field.hasMany(Drone, { foreignKey: "field_id" });
Drone.belongsTo(Field, { foreignKey: "field_id" });

Field.hasMany(Camera, { foreignKey: "field_id" });
Camera.belongsTo(Field, { foreignKey: "field_id" });

Field.hasMany(SoilReading, { foreignKey: "field_id" });
SoilReading.belongsTo(Field, { foreignKey: "field_id" });

Field.hasMany(Mission, { foreignKey: "field_id" });
Mission.belongsTo(Field, { foreignKey: "field_id" });

Field.hasMany(Report, { foreignKey: "field_id" });
Report.belongsTo(Field, { foreignKey: "field_id" });

// Drone relations
Drone.hasMany(Telemetry, { foreignKey: "drone_id" });
Telemetry.belongsTo(Drone, { foreignKey: "drone_id" });

Drone.hasMany(Mission, { foreignKey: "drone_id" });
Mission.belongsTo(Drone, { foreignKey: "drone_id" });

// User relations
User.hasMany(Report, { foreignKey: "created_by" });
Report.belongsTo(User, { foreignKey: "created_by" });

export { User, Field, Drone, Camera, Telemetry, SoilReading, Mission, Report };