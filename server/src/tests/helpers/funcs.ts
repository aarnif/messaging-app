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

export const assertValidationError = (
  responseBody: {
    errors?: Array<{
      message: string;
      extensions?: {
        code?: string | undefined;
        validationErrors?:
          | {
              message?: string | undefined;
            }[]
          | undefined;
      };
    }>;
  },
  expectedValidationMessage: string,
  expectedCode: string = "BAD_USER_INPUT"
) => {
  assert.ok(responseBody.errors, "Response should have errors");
  assert.ok(responseBody.errors?.length > 0, "Should have at least one error");

  const error = responseBody.errors[0];
  assert.strictEqual(error.message, "Input validation failed");
  assert.strictEqual(
    error.extensions?.validationErrors?.[0].message,
    expectedValidationMessage
  );
  assert.strictEqual(error.extensions?.code, expectedCode);
};
