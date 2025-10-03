import request from "supertest";
import type { ApolloServer, BaseContext } from "@apollo/server";
import type { HTTPGraphQLResponse } from "../types/other";

import { sequelize } from "../db";
import { start } from "../server";
import { emptyDatabase, populateDatabase } from "../populateDatabase";
import { describe, before, beforeEach, test, after } from "node:test";
import assert from "node:assert";

let url: string;

const COUNT_DOCUMENTS = `
  query CountDocuments {
    countDocuments
  }
`;

void describe("GraphQL API", () => {
  let server: ApolloServer<BaseContext>;

  before(async () => {
    ({ server, url } = await start());
  });

  beforeEach(async () => {
    await emptyDatabase();
    await populateDatabase();
  });

  void test("counts documents from database", async () => {
    const response = await request(url)
      .post("/")
      .send({
        query: COUNT_DOCUMENTS,
      })
      .expect("Content-Type", /json/)
      .expect(200);

    assert.strictEqual(response.error, false);

    const responseBody = response.body as HTTPGraphQLResponse<{
      countDocuments: number;
    }>;
    const count = responseBody.data?.countDocuments;
    assert.ok(count, "Count should be defined");
    assert.strictEqual(count, 312);
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
