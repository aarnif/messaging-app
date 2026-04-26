import assert from "node:assert";
import request from "supertest";
import type {
  ChangePasswordInput,
  Chat,
  Contact,
  CreateChatInput,
  CreateUserInput,
  EditChatInput,
  EditMessageInput,
  EditProfileInput,
  LoginInput,
  User,
  UserChat,
} from "~/types/graphql";
import config from "../../../config.js";
import type { HTTPGraphQLResponse } from "../../types/other.js";
import { user1Details } from "./data.js";
import {
  ADD_CONTACT,
  ADD_CONTACTS,
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  CHANGE_PASSWORD,
  CONTACTS_WITHOUT_PRIVATE_CHAT,
  CREATE_CHAT,
  CREATE_USER,
  DELETE_CHAT,
  DELETE_MESSAGE,
  EDIT_CHAT,
  EDIT_MESSAGE,
  EDIT_PROFILE,
  FIND_CHAT_BY_ID,
  FIND_CONTACT_BY_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  FIND_CONTACT_BY_USER_ID,
  FIND_USER_BY_ID,
  IS_BLOCKED_BY_USER,
  LOGIN,
  ME,
  NON_CONTACT_USERS,
  REMOVE_CONTACT,
  TOGGLE_BLOCK_CONTACT,
} from "./queries.js";

export const query = async <Data, Variables = Record<string, never>>(
  query: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200,
  skipErrorCheck: boolean = false, // Needed for testing invalid token
): Promise<HTTPGraphQLResponse<Data>> => {
  const response = request(config.SERVER_URL).post("/graphql").send({
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

export const createUser = (input: CreateUserInput) =>
  query<{ createUser: User }, { input: CreateUserInput }>(CREATE_USER, {
    input,
  });

export const login = (input: LoginInput) =>
  query<{ login: { value: string } }, { input: LoginInput }>(LOGIN, {
    input,
  });

export const changePassword = (input: ChangePasswordInput, token: string) =>
  query<{ changePassword: User }, { input: ChangePasswordInput }>(
    CHANGE_PASSWORD,
    {
      input,
    },
    token,
  );

export const editProfile = (input: EditProfileInput, token: string) =>
  query<{ editProfile: User }, { input: EditProfileInput }>(
    EDIT_PROFILE,
    {
      input,
    },
    token,
  );

export const findUserById = (id: string, token: string) =>
  query<{ findUserById: User }, { id: string }>(
    FIND_USER_BY_ID,
    {
      id,
    },
    token,
  );

export const me = (
  token: string,
  expectedStatusCode: number = 200,
  skipErrorCheck: boolean = false,
) => query<{ me: User }>(ME, {}, token, expectedStatusCode, skipErrorCheck);

export const addContact = (id: string, token: string) =>
  query<{ addContact: Contact }, { id: string }>(ADD_CONTACT, { id }, token);

export const addContacts = (ids: string[], token: string) =>
  query<{ addContacts: Contact[] }, { ids: string[] }>(
    ADD_CONTACTS,
    { ids },
    token,
  );

export const allContactsByUser = (search: string, token: string) =>
  query<{ allContactsByUser: Contact[] }, { search?: string }>(
    ALL_CONTACTS_BY_USER,
    { search },
    token,
  );

export const contactsWithoutPrivateChat = (search: string, token: string) =>
  query<{ contactsWithoutPrivateChat: Contact[] }, { search?: string }>(
    CONTACTS_WITHOUT_PRIVATE_CHAT,
    { search },
    token,
  );

export const createChat = (input: CreateChatInput, token: string) =>
  query<{ createChat: Chat }, { input: CreateChatInput }>(
    CREATE_CHAT,
    {
      input,
    },
    token,
  );

export const findContactById = (id: string, token: string) =>
  query<{ findContactById: Contact }, { id: string }>(
    FIND_CONTACT_BY_ID,
    {
      id,
    },
    token,
  );

export const findContactByUserId = (id: string, token: string) =>
  query<
    {
      findContactByUserId: Contact;
    },
    { id: string }
  >(FIND_CONTACT_BY_USER_ID, { id }, token);

export const isBlockedByUser = (id: string, token: string) =>
  query<{ isBlockedByUser: boolean }, { id: string }>(
    IS_BLOCKED_BY_USER,
    { id },
    token,
  );

export const nonContactUsers = (search: string, token: string) =>
  query<{ nonContactUsers: User[] }, { search?: string }>(
    NON_CONTACT_USERS,
    { search },
    token,
  );

export const removeContact = (id: string, token: string) =>
  query<{ removeContact: Contact }, { id: string }>(
    REMOVE_CONTACT,
    { id },
    token,
  );

export const toggleBlockContact = (id: string, token: string) =>
  query<{ toggleBlockContact: Contact }, { id: string }>(
    TOGGLE_BLOCK_CONTACT,
    { id },
    token,
  );

export const allChatsByUser = (search: string, token: string) =>
  query<{ allChatsByUser: UserChat[] }, { search?: string }>(
    ALL_CHATS_BY_USER,
    { search },
    token,
  );

export const deleteChat = (id: string, token: string) =>
  query<{ deleteChat: Chat }, { id: string }>(DELETE_CHAT, { id }, token);

export const deleteMessage = (id: string, token: string) =>
  query<{ deleteMessage: Chat }, { id: string }>(DELETE_MESSAGE, { id }, token);

export const editChat = (input: EditChatInput, token: string) =>
  query<{ editChat: Chat }, { input: EditChatInput }>(
    EDIT_CHAT,
    {
      input,
    },
    token,
  );

export const editMessage = (input: EditMessageInput, token: string) =>
  query<{ editMessage: Chat }, { input: EditMessageInput }>(
    EDIT_MESSAGE,
    {
      input,
    },
    token,
  );

export const findChatById = (id: string, token: string) =>
  query<{ findChatById: Chat }, { id: string }>(FIND_CHAT_BY_ID, { id }, token);

export const findPrivateChatWithContact = (id: string, token: string) =>
  query<{ findPrivateChatWithContact: Chat }, { id: string }>(
    FIND_PRIVATE_CHAT_WITH_CONTACT,
    { id },
    token,
  );

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
  expectedCode: string = "BAD_USER_INPUT",
) => {
  assert.ok(responseBody.errors, "Response should have errors");
  assert.ok(responseBody.errors?.length > 0, "Should have at least one error");

  const error = responseBody.errors[0];
  assert.strictEqual(error.message, "Input validation failed");
  assert.strictEqual(
    error.extensions?.validationErrors?.[0].message,
    expectedValidationMessage,
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
  expectedCode?: string,
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
  expected: User,
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
  expected: Contact,
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
  entityName: string,
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
  expected: UserChat,
) => {
  const userChat = assertChatBasics<UserChat>(actual, expected, "User Chat");

  assert.strictEqual(userChat.unreadCount, expected.unreadCount);
  assert.ok(userChat.latestMessage, "Latest message should be defined");
  assert.strictEqual(
    userChat.latestMessage.content,
    expected.latestMessage.content,
  );
  assert.strictEqual(userChat.latestMessage.sender.id, user1Details.id);
};

export const assertChatEquality = (
  actual: Chat | undefined,
  expected: Chat,
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
