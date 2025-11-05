import request from "supertest";
import type { Response } from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
import config from "config";
import assert from "node:assert";

const makeRequest = async <Variables>(
  query: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200
): Promise<Response> => {
  const response = request(config.SERVER_URL).post("/").send({
    query,
    variables,
  });

  if (token) {
    response.set("Authorization", `Bearer ${token}`);
  }

  return await response
    .expect("Content-Type", /json/)
    .expect(expectedStatusCode);
};

export const query = async <Data, Variables = Record<string, never>>(
  queryString: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200,
  skipErrorCheck: boolean = false
): Promise<HTTPGraphQLResponse<Data>> => {
  const response = await makeRequest(
    queryString,
    variables,
    token,
    expectedStatusCode
  );

  if (!skipErrorCheck) {
    assert.strictEqual(response.error, false);
  }

  return response.body as HTTPGraphQLResponse<Data>;
};
