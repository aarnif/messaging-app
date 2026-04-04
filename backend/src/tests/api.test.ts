import assert from "node:assert";
import { test } from "node:test";
import { query } from "./helpers/funcs.js";
import { COUNT_DOCUMENTS } from "./helpers/queries.js";
import { describeGraphQLSuite } from "./helpers/setup.js";

describeGraphQLSuite("GraphQL API", () => {
  void test("returns document count from database", async () => {
    const responseBody = await query<{ countDocuments: number }, object>(
      COUNT_DOCUMENTS,
      {},
    );
    const count = responseBody.data?.countDocuments;
    assert.strictEqual(count, 0);
  });
});
