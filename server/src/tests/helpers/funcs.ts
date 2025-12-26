import request from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
import type { User, Contact, Chat, UserChat } from "~/types/graphql";
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
  assert.strictEqual(actual.is24HourClock, expected.is24HourClock);
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

const assertChatBasics = <T extends UserChat | Chat>(
  actual: T | undefined,
  expected: T,
  entityName: string
): T => {
  assert.ok(actual, `${entityName} should be defined`);
  assert.strictEqual(actual.id, expected.id);
  assert.strictEqual(actual.type, expected.type);
  assert.strictEqual(actual.name, expected.name);
  assert.strictEqual(actual.avatar, expected.avatar);
  assert.strictEqual(actual.members.length, expected.members.length);

  return actual;
};

export const assertUserChatEquality = (
  actual: UserChat | undefined,
  expected: UserChat
) => {
  const userChat = assertChatBasics<UserChat>(actual, expected, "User Chat");

  assert.strictEqual(userChat.unreadCount, expected.unreadCount);
  assert.ok(userChat.latestMessage, "Latest message should be defined");
  assert.strictEqual(
    userChat.latestMessage.content,
    expected.latestMessage.content
  );
  assert.strictEqual(userChat.latestMessage.sender.id, user1Details.id);
};

export const assertChatEquality = (
  actual: Chat | undefined,
  expected: Chat
) => {
  const chat = assertChatBasics<Chat>(actual, expected, "Chat");

  assert.strictEqual(chat.messages.length, expected.messages.length);

  for (let i = 0; i < chat.members.length; ++i) {
    const member = chat.members[i];

    if (i === 0) {
      assert.ok(member, "Creator should be in members");
      assert.strictEqual(member?.role, "admin");
    } else {
      assert.ok(member, `Member ${i} should be in members`);
      assert.strictEqual(member?.role, "member");
    }
    assert.strictEqual(member.unreadCount, expected.members[i].unreadCount);
  }
};
