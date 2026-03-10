import { Sequelize, QueryInterface } from "sequelize";
import { Umzug, SequelizeStorage, RunnableMigration } from "umzug";
import config from "../config";

const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
});

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: "src/migrations/*.ts",
      resolve: ({ name, path, context }) => {
        if (!path) {
          throw new Error(
            `Migration path not found for migration file: ${name}`,
          );
        }
        return {
          name,
          up: async () => {
            const migration = (await import(path)) as {
              default: RunnableMigration<QueryInterface>;
            };
            return migration.default.up({ name, path, context });
          },
        };
      },
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
