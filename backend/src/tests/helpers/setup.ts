import type { ApolloServer, BaseContext } from "@apollo/server";
import { after, before, beforeEach, describe } from "node:test";
import { sequelize } from "../../db.js";
import { createDatabase, emptyDatabase } from "../../populateDatabase.js";
import { start } from "../../server.js";

export const describeGraphQLSuite = (title: string, callback: () => void) => {
  void describe(title, () => {
    let server: ApolloServer<BaseContext>;

    before(async () => {
      server = await start();
    });

    beforeEach(async () => {
      await emptyDatabase();
      await createDatabase();
    });

    callback();

    after(async () => {
      await server.stop();
      await sequelize.close();
    });
  });
};
