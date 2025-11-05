import request from "supertest";
import type { Response } from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
import { ME } from "./queries";
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

export const getMe = async (
  token?: string,
  expectedCode = 200
): Promise<Response> => await makeRequest(ME, {}, token, expectedCode);

export const query = async <Data, Variables>(
  query: string,
  variables: Variables,
  token: string = ""
): Promise<HTTPGraphQLResponse<Data>> => {
  const response = await makeRequest(query, variables, token);
  assert.strictEqual(response.error, false);
  return response.body as HTTPGraphQLResponse<Data>;
};
