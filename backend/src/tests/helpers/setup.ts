import type { ApolloServer, BaseContext } from "@apollo/server";
import { describe, before, beforeEach, after } from "node:test";
import { sequelize } from "../../db";
import { start } from "../../server";
import { emptyDatabase, createDatabase } from "../../populateDatabase";

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
