import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import config from "../config";

const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
});

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: "migrations/*.ts",
    },
    storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });
  const migrations = await migrator.up();
  console.log("Migrations up to date", {
    files: migrations.map((mig) => mig.name),
  });
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, connectToDatabase };
