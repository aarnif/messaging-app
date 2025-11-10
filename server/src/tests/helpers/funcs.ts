import request from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
import type { User, Contact, Chat } from "~/types/graphql";
import { user1Details } from "./data";
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
        code?: string;
        validationErrors?: Array<{
          message?: string;
        }>;
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

export const assertError = (
  responseBody: {
    errors?: Array<{
      message: string;
      extensions?: {
        code?: string;
        validationErrors?: Array<{
          message?: string;
        }>;
      };
    }>;
  },
  expectedMessage: string,
  expectedCode?: string
) => {
  assert.ok(responseBody.errors, "Response should have errors");
  assert.ok(responseBody.errors?.length > 0, "Should have at least one error");

  const error = responseBody.errors[0];
  assert.strictEqual(error.message, expectedMessage);

  if (expectedCode) {
    assert.strictEqual(error.extensions?.code, expectedCode);
  }
};

export const assertUserEquality = (
  actual: User | undefined,
  expected: User
) => {
  assert.ok(actual, "User should be defined");
  assert.strictEqual(actual.id, expected.id);
  assert.strictEqual(actual.username, expected.username);
  assert.strictEqual(actual.name, expected.name);
  assert.strictEqual(actual.about, expected.about);
  assert.strictEqual(actual.avatar, expected.avatar);
};

export const assertContactEquality = (
  actual: Contact | undefined,
  expected: Contact
) => {
  assert.ok(actual, "Contact should be defined");
  assert.strictEqual(actual.id, expected.id);
  assert.strictEqual(actual.isBlocked, expected.isBlocked);
  assert.ok(actual.contactDetails, "Contact details should be defined");

  assertUserEquality(actual.contactDetails, expected.contactDetails);
};

export const assertChatEquality = (
  actual: Chat | undefined,
  expected: Chat
) => {
  assert.ok(actual, "Chat should be defined");
  assert.strictEqual(actual.id, expected.id);
  assert.strictEqual(actual.type, expected.type);
  assert.strictEqual(actual.name, expected.name);
  assert.strictEqual(actual.avatar, expected.avatar);
  assert.strictEqual(actual.members.length, expected.members.length);
  assert.strictEqual(actual.messages.length, expected.messages.length);
  assert.strictEqual(actual.messages[0].content, expected.messages[0].content);
  assert.strictEqual(actual.messages[0].sender.id, user1Details.id);

  for (let i = 0; i < actual.members.length; ++i) {
    const member: Chat["members"][number] = actual.members[i];

    if (i === 0) {
      assert.ok(member, "Creator should be in members");
      assert.strictEqual(member?.role, "admin");
    } else {
      assert.ok(member, `Member ${i} should be in members`);
      assert.strictEqual(member?.role, "member");
    }
  }
};
