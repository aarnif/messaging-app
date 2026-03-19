import type { ApolloServer, BaseContext } from "@apollo/server";

import { query } from "./helpers/funcs";
import { COUNT_DOCUMENTS } from "./helpers/queries";
import { sequelize } from "../db";
import { start } from "../server";
import { emptyDatabase, createDatabase } from "../populateDatabase";
import { describe, before, beforeEach, test, after } from "node:test";
import assert from "node:assert";

void describe("GraphQL API", () => {
  let server: ApolloServer<BaseContext>;

  before(async () => {
    server = await start();
  });

  beforeEach(async () => {
    await emptyDatabase();
    await createDatabase();
  });

  void test("returns document count from database", async () => {
    const responseBody = await query<{ countDocuments: number }, object>(
      COUNT_DOCUMENTS,
      {},
    );
    const count = responseBody.data?.countDocuments;
    assert.strictEqual(count, 0);
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
