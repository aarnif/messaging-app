import { describeGraphQLSuite } from "./helpers/setup.js";
import { query } from "./helpers/funcs.js";
import { COUNT_DOCUMENTS } from "./helpers/queries.js";
import { test } from "node:test";
import assert from "node:assert";

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
