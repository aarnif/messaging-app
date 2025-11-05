import request from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
import config from "config";
import assert from "node:assert";

export const query = async <Data, Variables = Record<string, never>>(
  query: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200,
  skipErrorCheck: boolean = false // Needed for testing invalid token
): Promise<HTTPGraphQLResponse<Data>> => {
  const response = request(config.SERVER_URL).post("/").send({
    query,
    variables,
  });

  if (token) {
    response.set("Authorization", `Bearer ${token}`);
  }

  const result = await response
    .expect("Content-Type", /json/)
    .expect(expectedStatusCode);

  if (!skipErrorCheck) {
    assert.strictEqual(result.error, false);
  }

  return result.body as HTTPGraphQLResponse<Data>;
};
