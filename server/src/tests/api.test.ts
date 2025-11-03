import request from "supertest";
import type { Response } from "supertest";
import type { ApolloServer, BaseContext } from "@apollo/server";
import type { HTTPGraphQLResponse } from "../types/other";
import type {
  User,
  Contact,
  Chat,
  CreateUserInput,
  LoginInput,
  EditProfileInput,
  CreateChatInput,
  EditChatInput,
  SendMessageInput,
  ChangePasswordInput,
} from "~/types/graphql";
import {
  user1Details,
  user2Details,
  user3Details,
  privateChatDetails,
  groupChatDetails,
} from "./helpers/data";
import {
  COUNT_DOCUMENTS,
  CREATE_USER,
  LOGIN,
  ME,
  ADD_CONTACT,
  ADD_CONTACTS,
  REMOVE_CONTACT,
  CREATE_CHAT,
  EDIT_CHAT,
  DELETE_CHAT,
  TOGGLE_BLOCK_CONTACT,
  SEND_MESSAGE,
  LEAVE_CHAT,
  EDIT_PROFILE,
  FIND_USER_BY_ID,
  FIND_CHAT_BY_ID,
  IS_BLOCKED_BY_USER,
  ALL_CONTACTS_BY_USER,
  CONTACTS_WITHOUT_PRIVATE_CHAT,
  ALL_CHATS_BY_USER,
  FIND_CONTACT_BY_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  CHANGE_PASSWORD,
  FIND_CONTACT_BY_USER_ID,
} from "./helpers/queries";

import { sequelize } from "../db";
import { start } from "../server";
import { emptyDatabase, createDatabase } from "../populateDatabase";
import { describe, before, beforeEach, test, after } from "node:test";
import assert from "node:assert";

let url: string;

const { id: _, name: _name1, ...user1Input } = user1Details;
const { id: _id, name: _name2, ...user2Input } = user2Details;
const { id: _id2, name: _name3, ...user3Input } = user3Details;

const makeRequest = async <Variables>(
  query: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200
): Promise<Response> => {
  const response = request(url).post("/").send({
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

const countDocuments = async (): Promise<Response> =>
  await makeRequest(COUNT_DOCUMENTS, {});

const createUser = async (
  input: CreateUserInput
): Promise<
  HTTPGraphQLResponse<{
    createUser: User;
  }>
> => {
  const response = await makeRequest(CREATE_USER, { input });
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    createUser: User;
  }>;
  return responseBody;
};

const login = async (
  input: LoginInput
): Promise<HTTPGraphQLResponse<{ login: { value: string } }>> => {
  const response = await makeRequest(LOGIN, { input });
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    login: { value: string };
  }>;
  return responseBody;
};

const getMe = async (token?: string, expectedCode = 200): Promise<Response> =>
  await makeRequest(ME, {}, token, expectedCode);

const addContact = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    addContact: Contact;
  }>
> => {
  const response = await makeRequest(ADD_CONTACT, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    addContact: Contact;
  }>;
  return responseBody;
};

const addContacts = async (
  ids: string[],
  token: string
): Promise<
  HTTPGraphQLResponse<{
    addContacts: Contact[];
  }>
> => {
  const response = await makeRequest(ADD_CONTACTS, { ids }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    addContacts: Contact[];
  }>;

  return responseBody;
};

const removeContact = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    removeContact: Contact;
  }>
> => {
  const response = await makeRequest(REMOVE_CONTACT, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    removeContact: Contact;
  }>;

  return responseBody;
};

const toggleBlockContact = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    toggleBlockContact: Contact;
  }>
> => {
  const response = await makeRequest(TOGGLE_BLOCK_CONTACT, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    toggleBlockContact: Contact;
  }>;

  return responseBody;
};

const createChat = async (
  input: CreateChatInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    createChat: Chat;
  }>
> => {
  const response = await makeRequest(CREATE_CHAT, { input }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    createChat: Chat;
  }>;

  return responseBody;
};

const editChat = async (
  input: EditChatInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    editChat: Chat;
  }>
> => {
  const response = await makeRequest(EDIT_CHAT, { input }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    editChat: Chat;
  }>;

  return responseBody;
};

const deleteChat = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    deleteChat: Chat;
  }>
> => {
  const response = await makeRequest(DELETE_CHAT, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    deleteChat: Chat;
  }>;

  return responseBody;
};

const sendMessage = async (
  input: SendMessageInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    sendMessage: Chat;
  }>
> => {
  const response = await makeRequest(SEND_MESSAGE, { input }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    sendMessage: Chat;
  }>;

  return responseBody;
};

const leaveChat = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    leaveChat: Chat;
  }>
> => {
  const response = await makeRequest(LEAVE_CHAT, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    leaveChat: Chat;
  }>;

  return responseBody;
};

const editProfile = async (
  input: EditProfileInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    editProfile: User;
  }>
> => {
  const response = await makeRequest(EDIT_PROFILE, { input }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    editProfile: User;
  }>;

  return responseBody;
};

const findUserById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findUserById: User;
  }>
> => {
  const response = await makeRequest(FIND_USER_BY_ID, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findUserById: User;
  }>;

  return responseBody;
};

const findChatById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findChatById: Chat;
  }>
> => {
  const response = await makeRequest(FIND_CHAT_BY_ID, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findChatById: Chat;
  }>;

  return responseBody;
};

const isBlockedByUser = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    isBlockedByUser: boolean;
  }>
> => {
  const response = await makeRequest(IS_BLOCKED_BY_USER, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    isBlockedByUser: boolean;
  }>;

  return responseBody;
};

const allContactsByUser = async (
  search: string | null,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    allContactsByUser: Contact[];
  }>
> => {
  const response = await makeRequest(
    ALL_CONTACTS_BY_USER,
    search ? { search } : {},
    token
  );

  const responseBody = response.body as HTTPGraphQLResponse<{
    allContactsByUser: Contact[];
  }>;

  return responseBody;
};

const contactsWithoutPrivateChat = async (
  search: string | null,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    contactsWithoutPrivateChat: Contact[];
  }>
> => {
  const response = await makeRequest(
    CONTACTS_WITHOUT_PRIVATE_CHAT,
    search ? { search } : {},
    token
  );

  const responseBody = response.body as HTTPGraphQLResponse<{
    contactsWithoutPrivateChat: Contact[];
  }>;

  return responseBody;
};

const allChatsByUser = async (
  search: string | null,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    allChatsByUser: Chat[];
  }>
> => {
  const response = await makeRequest(
    ALL_CHATS_BY_USER,
    search ? { search } : {},
    token
  );

  const responseBody = response.body as HTTPGraphQLResponse<{
    allChatsByUser: Chat[];
  }>;

  return responseBody;
};

const findContactById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findContactById: Contact;
  }>
> => {
  const response = await makeRequest(FIND_CONTACT_BY_ID, { id }, token);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findContactById: Contact;
  }>;

  return responseBody;
};

const findPrivateChatWithContact = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findPrivateChatWithContact: Chat;
  }>
> => {
  const response = await makeRequest(
    FIND_PRIVATE_CHAT_WITH_CONTACT,
    { id },
    token
  );

  const responseBody = response.body as HTTPGraphQLResponse<{
    findPrivateChatWithContact: Chat;
  }>;

  return responseBody;
};

const changePassword = async (
  input: ChangePasswordInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    changePassword: User;
  }>
> => {
  const response = await makeRequest(CHANGE_PASSWORD, { input }, token);

  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    changePassword: User;
  }>;

  return responseBody;
};

const findContactByUserId = async (
  id: string,
  token: string
): Promise<Response> =>
  await makeRequest(FIND_CONTACT_BY_USER_ID, { id }, token);

void describe("GraphQL API", () => {
  let server: ApolloServer<BaseContext>;

  before(async () => {
    ({ server, url } = await start());
  });

  beforeEach(async () => {
    await emptyDatabase();
    await createDatabase();
  });

  void test("returns document count from database", async () => {
    const response = await countDocuments();

    assert.strictEqual(response.error, false);

    const responseBody = response.body as HTTPGraphQLResponse<{
      countDocuments: number;
    }>;
    const count = responseBody.data?.countDocuments;
    assert.strictEqual(count, 0);
  });

  void describe("Users", () => {
    void describe("User creation", () => {
      void test("fails with username shorter than 3 characters", async () => {
        const responseBody = await createUser({
          ...user1Input,
          username: "us",
        });

        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Username must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with password shorter than 6 characters", async () => {
        const responseBody = await createUser({
          ...user1Input,
          password: "short",
        });
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Password must be at least 6 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails when passwords do not match", async () => {
        const responseBody = await createUser({
          ...user1Input,
          confirmPassword: "passwor",
        });
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Passwords do not match"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails if user already exists", async () => {
        await createUser(user1Input);
        const responseBody = await createUser(user1Input);
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Username already exists");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds with valid input", async () => {
        const responseBody = await createUser(user1Input);
        const user = responseBody.data?.createUser;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(
          user.name,
          user1Details.username[0].toUpperCase() +
            user1Details.username.slice(1)
        );
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });

    void describe("User login", () => {
      beforeEach(async () => {
        await createUser(user1Input);
      });

      void test("fails with non-existent username", async () => {
        const responseBody = await login({
          username: "nonexistent",
          password: user1Details.password,
        });
        const token = responseBody.data?.login;

        assert.strictEqual(token, null, "Token should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Invalid username or password");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with incorrect password", async () => {
        const responseBody = await login({
          username: user1Details.username,
          password: "wrongpassword",
        });
        const token = responseBody.data?.login;

        assert.strictEqual(token, null, "Token should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Invalid username or password");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds with valid credentials", async () => {
        const responseBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });
        const token = responseBody.data?.login;

        assert.ok(token, "Token should be defined");
        assert.ok(token.value, "Token value should be defined");
        assert.strictEqual(typeof token.value, "string");
        assert.ok(token.value.length > 0, "Token should not be empty");
      });
    });

    void describe("Get current user", () => {
      let token: string;

      beforeEach(async () => {
        await createUser(user1Input);
        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const response = await getMe();

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          me: User;
        }>;
        const user = responseBody.data?.me;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("succeeds with valid token", async () => {
        const response = await getMe(token);

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          me: User;
        }>;
        const user = responseBody.data?.me;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(
          user.name,
          user1Details.username[0].toUpperCase() +
            user1Details.username.slice(1)
        );
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
        assert.ok(user.id, "User ID should be defined");
      });

      void test("fails with invalid token", async () => {
        const response = await getMe("invalid-token", 500);

        const responseBody = response.body as HTTPGraphQLResponse<{
          me: User;
        }>;
        const user = responseBody.data?.me;

        assert.strictEqual(user, undefined, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(
          error.message,
          "Context creation failed: jwt malformed"
        );
        assert.strictEqual(error.extensions?.code, "INTERNAL_SERVER_ERROR");
      });
    });

    void describe("Find user by ID", () => {
      let token: string;
      let user2Id: string;

      beforeEach(async () => {
        await createUser(user1Input);
        const user2Body = await createUser(user2Input);
        assert.ok(user2Body.data?.createUser?.id, "User2 ID should be defined");
        user2Id = user2Body.data.createUser.id;

        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const responseBody = await findUserById(user2Id, "");

        const user = responseBody.data?.findUserById;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const responseBody = await findUserById("999", token);

        const user = responseBody.data?.findUserById;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "User not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds with valid user ID", async () => {
        const responseBody = await findUserById(user2Id, token);

        const user = responseBody.data?.findUserById;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.id, user2Id);
        assert.strictEqual(user.username, user2Details.username);
        assert.strictEqual(
          user.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });

    void describe("Edit profile", () => {
      let token: string;

      beforeEach(async () => {
        await createUser(user1Input);
        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const responseBody = await editProfile(
          {
            name: "Updated Name",
            about: "Updated about",
            is24HourClock: true,
          },
          ""
        );

        const user = responseBody.data?.editProfile;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with name shorter than 3 characters", async () => {
        const responseBody = await editProfile(
          {
            name: "AB",
            about: "Valid about text",
            is24HourClock: true,
          },
          token
        );

        const user = responseBody.data?.editProfile;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Name must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds updating name and about", async () => {
        const updatedName = "Updated Name";
        const updatedAbout = "This is my updated about section";

        const responseBody = await editProfile(
          {
            name: updatedName,
            about: updatedAbout,
            is24HourClock: true,
          },
          token
        );

        const user = responseBody.data?.editProfile;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.id, user1Details.id);
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(user.name, updatedName);
        assert.strictEqual(user.about, updatedAbout);
        assert.strictEqual(user.avatar, null);
      });

      void test("succeeds updating name with null about", async () => {
        const updatedName = "Another Updated Name";

        const responseBody = await editProfile(
          {
            name: updatedName,
            about: null,
            is24HourClock: true,
          },
          token
        );

        const user = responseBody.data?.editProfile;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.id, user1Details.id);
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(user.name, updatedName);
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });

    void describe("Change password", () => {
      let token: string;

      beforeEach(async () => {
        await createUser(user1Input);
        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const responseBody = await changePassword(
          {
            currentPassword: user1Details.password,
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
          ""
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with wrong current password", async () => {
        const responseBody = await changePassword(
          {
            currentPassword: "wrong",
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
          token
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Current password do not match");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with new password shorter than 6 characters", async () => {
        const responseBody = await changePassword(
          {
            currentPassword: user1Details.password,
            newPassword: "short",
            confirmNewPassword: "short",
          },
          token
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );
        assert.strictEqual(
          responseBody.errors[0].message,
          "Input validation failed"
        );
        assert.strictEqual(
          responseBody.errors[0].extensions?.code,
          "BAD_USER_INPUT"
        );
        assert.strictEqual(
          responseBody.errors[0].extensions?.validationErrors?.[0]?.message,
          "Password must be at least 6 characters long"
        );
      });

      void test("fails with new passwords not matching", async () => {
        const responseBody = await changePassword(
          {
            currentPassword: user1Details.password,
            newPassword: "password",
            confirmNewPassword: "different",
          },
          token
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );
        assert.strictEqual(
          responseBody.errors[0].message,
          "Input validation failed"
        );
        assert.strictEqual(
          responseBody.errors[0].extensions?.code,
          "BAD_USER_INPUT"
        );
        assert.strictEqual(
          responseBody.errors[0].extensions?.validationErrors?.[0]?.message,
          "Passwords do not match"
        );
      });

      void test("succeeds changing password", async () => {
        const responseBody = await changePassword(
          {
            currentPassword: user1Details.password,
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
          token
        );

        const user = responseBody.data?.changePassword;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.id, user1Details.id);
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(user.name, user1Details.name);
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });
  });

  void describe("Contacts", () => {
    let user1Token: string;
    let user2Token: string;

    beforeEach(async () => {
      await createUser(user1Input);
      await createUser(user2Input);
      await createUser(user3Input);

      const user1LoginBody = await login({
        username: user1Details.username,
        password: user1Details.password,
      });

      assert.ok(
        user1LoginBody.data,
        "User1 login token value should be defined"
      );
      user1Token = user1LoginBody.data.login.value;

      const user2LoginBody = await login({
        username: user2Details.username,
        password: user2Details.password,
      });

      assert.ok(user2LoginBody.data, "User2 login token should be defined");
      user2Token = user2LoginBody.data.login.value;
    });

    void describe("Add contact", () => {
      void test("fails without authentication", async () => {
        const responseBody = await addContact(user1Details.id, "");

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails when trying to add yourself as contact", async () => {
        const responseBody = await addContact(user1Details.id, user1Token);

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Cannot add yourself as a contact");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds with valid user ID", async () => {
        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;

        assert.ok(contact, "Contact should be defined");
        assert.strictEqual(contact.isBlocked, false);
        assert.ok(contact.contactDetails, "Contact details should be defined");
        assert.strictEqual(contact.contactDetails.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
        assert.strictEqual(
          contact.contactDetails.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
        assert.strictEqual(contact.contactDetails.about, null);
        assert.strictEqual(contact.contactDetails.avatar, null);
      });

      void test("fails when trying to add same contact twice", async () => {
        await addContact(user2Details.id, user1Token);
        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact already exists");
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });
    });

    void describe("Add contacts", () => {
      void test("fails without authentication", async () => {
        const responseBody = await addContacts(
          [user2Details.id, user3Details.id],
          ""
        );

        const contacts = responseBody.data?.addContacts;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("succeeds with valid user IDs", async () => {
        const responseBody = await addContacts(
          [user2Details.id, user3Details.id],
          user1Token
        );

        const contacts = responseBody.data?.addContacts;

        assert.ok(contacts, "Contacts should be defined");
        assert.strictEqual(contacts.length, 2, "Should have 2 contacts");

        const expectedUsers = [user2Details, user3Details];

        contacts.forEach((contact, index) => {
          const expected = expectedUsers[index];
          assert.ok(contact, `Contact ${index} should be defined`);
          assert.strictEqual(contact.isBlocked, false);
          assert.ok(
            contact.contactDetails,
            `Contact details ${index} should be defined`
          );
          assert.strictEqual(contact.contactDetails.id, expected.id);
          assert.strictEqual(
            contact.contactDetails.username,
            expected.username
          );
          assert.strictEqual(
            contact.contactDetails.name,
            expected.username[0].toUpperCase() + expected.username.slice(1)
          );
          assert.strictEqual(contact.contactDetails.about, null);
          assert.strictEqual(contact.contactDetails.avatar, null);
        });
      });
    });

    void describe("Remove contact", () => {
      let contactId: string;
      beforeEach(async () => {
        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await removeContact(contactId, "");

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await removeContact("999", user1Token);

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds with valid contact ID", async () => {
        const responseBody = await removeContact(contactId, user1Token);

        const contact = responseBody.data?.removeContact;

        assert.ok(contact, "Contact should be defined");
        assert.strictEqual(contact.id, "1");
        assert.strictEqual(contact.isBlocked, false);
        assert.ok(contact.contactDetails, "Contact details should be defined");
        assert.strictEqual(contact.contactDetails.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
        assert.strictEqual(
          contact.contactDetails.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
      });

      void test("fails when trying to remove same contact twice", async () => {
        await removeContact(contactId, user1Token);
        const responseBody = await removeContact(contactId, user1Token);

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });
    });

    void describe("Toggle block contact", () => {
      let contactId: string;

      beforeEach(async () => {
        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await toggleBlockContact(contactId, "");

        const contact = responseBody.data?.toggleBlockContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await toggleBlockContact("999", user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds blocking contact", async () => {
        const responseBody = await toggleBlockContact(contactId, user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assert.ok(contact, "Contact should be defined");
        assert.strictEqual(contact.id, contactId);
        assert.strictEqual(contact.isBlocked, true);
        assert.ok(contact.contactDetails, "Contact details should be defined");
        assert.strictEqual(contact.contactDetails.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
        assert.strictEqual(
          contact.contactDetails.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
      });

      void test("succeeds unblocking contact", async () => {
        await toggleBlockContact(contactId, user1Token);
        const responseBody = await toggleBlockContact(contactId, user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assert.ok(contact, "Contact should be defined");
        assert.strictEqual(contact.id, contactId);
        assert.strictEqual(contact.isBlocked, false);
        assert.ok(contact.contactDetails, "Contact details should be defined");
        assert.strictEqual(contact.contactDetails.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
        assert.strictEqual(
          contact.contactDetails.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
      });
    });

    void describe("Is blocked by user", () => {
      let contactId: string;
      beforeEach(async () => {
        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
        await addContact(user1Details.id, user2Token);
      });

      void test("fails without authentication", async () => {
        const responseBody = await isBlockedByUser(user1Details.id, "");

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, null, "IsBlocked should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await isBlockedByUser("999", user2Token);

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, null, "IsBlocked should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("returns false when not blocked", async () => {
        const responseBody = await isBlockedByUser(user1Details.id, user2Token);

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, false, "Should not be blocked");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });

      void test("returns true when blocked", async () => {
        await toggleBlockContact(contactId, user1Token);
        const responseBody = await isBlockedByUser(user1Details.id, user2Token);

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, true, "Should be blocked");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });
    });

    void describe("All contacts by user", () => {
      void test("fails without authentication", async () => {
        const responseBody = await allContactsByUser(null, "");

        const contacts = responseBody.data?.allContactsByUser;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("returns empty array when no contacts exist", async () => {
        const responseBody = await allContactsByUser(null, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });

      void test("returns all contacts when user has contacts", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const responseBody = await allContactsByUser(null, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 2, "Should have 2 contacts");
      });

      void test("filters contacts by username search", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const responseBody = await allContactsByUser(
          user2Details.username,
          user1Token
        );

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
      });

      void test("filters contacts by name search", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const newName = "New Name";

        await editProfile(
          {
            name: newName,
            about: null,
            is24HourClock: true,
          },
          user2Token
        );

        const responseBody = await allContactsByUser(newName, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
        assert.strictEqual(contact.contactDetails.name, newName);
      });

      void test("returns empty array when search has no matches", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const responseBody = await allContactsByUser("nonexistent", user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
      });

      void test("search is case insensitive", async () => {
        await addContact(user2Details.id, user1Token);

        const responseBody = await allContactsByUser("USER2", user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
      });
    });

    void describe("Contacts without private chat", () => {
      void test("fails without authentication", async () => {
        const responseBody = await contactsWithoutPrivateChat(null, "");

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("returns empty array when no contacts exist", async () => {
        const responseBody = await contactsWithoutPrivateChat(null, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });

      void test("returns all contacts without private chat when user has contacts", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);
        await createChat(privateChatDetails, user1Token);

        const responseBody = await contactsWithoutPrivateChat(null, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contacts");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user3Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user3Details.username
        );
      });

      void test("filters contacts by username search", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const responseBody = await contactsWithoutPrivateChat(
          user2Details.username,
          user1Token
        );

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
        assert.strictEqual(
          contact.contactDetails.username,
          user2Details.username
        );
      });

      void test("filters contacts by name search", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const newName = "New Name";

        await editProfile(
          {
            name: newName,
            about: null,
            is24HourClock: true,
          },
          user2Token
        );

        const responseBody = await contactsWithoutPrivateChat(
          newName,
          user1Token
        );

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
        assert.strictEqual(contact.contactDetails.name, newName);
      });

      void test("returns empty array when search has no matches", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const responseBody = await contactsWithoutPrivateChat(
          "nonexistent",
          user1Token
        );

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
      });

      void test("search is case insensitive", async () => {
        await addContact(user2Details.id, user1Token);

        const responseBody = await contactsWithoutPrivateChat(
          "USER2",
          user1Token
        );

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
      });
    });

    void describe("Find contact by ID", () => {
      let token: string;
      let contactId: string;

      beforeEach(async () => {
        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;

        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await findContactById(contactId, "");

        const contact = responseBody.data?.findContactById;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const responseBody = await findContactById("999", token);

        const contact = responseBody.data?.findContactById;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds with valid contact ID", async () => {
        const responseBody = await findContactById(contactId, token);

        const contact = responseBody.data?.findContactById;

        assert.ok(contact, "Contact should be defined");
        assert.strictEqual(contact.id, contactId);
        const user = contact.contactDetails;
        assert.strictEqual(user.username, user2Details.username);
        assert.strictEqual(
          user.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });

    void describe("Find contact by user ID", () => {
      let token: string;

      beforeEach(async () => {
        const loginBody = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;

        const responseBody = await addContact(user2Details.id, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact, "Contact should be defined");
      });

      void test("fails without authentication", async () => {
        const response = await findContactByUserId(user2Details.id, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          findContactByUserId: Contact;
        }>;
        const contact = responseBody.data?.findContactByUserId;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const response = await findContactByUserId("999", token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findContactByUserId: Contact;
        }>;
        const contact = responseBody.data?.findContactByUserId;

        assert.strictEqual(contact, null, "Contact should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Contact not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds with valid user ID", async () => {
        const response = await findContactByUserId(user2Details.id, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findContactByUserId: Contact;
        }>;
        const contact = responseBody.data?.findContactByUserId;

        assert.ok(contact, "Contact should be defined");
        const user = contact.contactDetails;
        assert.strictEqual(user.id, user2Details.id);
        assert.strictEqual(user.username, user2Details.username);
        assert.strictEqual(
          user.name,
          user2Details.username[0].toUpperCase() +
            user2Details.username.slice(1)
        );
        assert.strictEqual(user.about, null);
        assert.strictEqual(user.avatar, null);
      });
    });
  });

  void describe("Chats", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Input);
      await createUser(user2Input);
      await createUser(user3Input);

      const loginBody = await login({
        username: user1Details.username,
        password: user1Details.password,
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void describe("Create chat", () => {
      void test("fails without authentication", async () => {
        const responseBody = await createChat(privateChatDetails, "");

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with empty initial message", async () => {
        const responseBody = await createChat(
          {
            ...privateChatDetails,
            initialMessage: "",
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Message content cannot be empty"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with group chat without name", async () => {
        const responseBody = await createChat(
          {
            ...groupChatDetails,
            name: "",
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Group chat name must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with group chat name shorter than 3 characters", async () => {
        const responseBody = await createChat(
          {
            ...groupChatDetails,
            name: "te",
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Group chat name must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds creating private chat", async () => {
        const responseBody = await createChat(privateChatDetails, token);

        const chat = responseBody.data?.createChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.type, "private");
        assert.strictEqual(chat.name, user2Details.name);
        assert.strictEqual(chat.description, null);
        assert.strictEqual(chat.avatar, null);
        assert.strictEqual(chat.members?.length, 2);
        assert.strictEqual(chat.messages?.length, 1);
        assert.strictEqual(chat.messages[0]?.content, "Hello world");
        assert.strictEqual(chat.messages[0]?.sender?.id, user1Details.id);

        const creator = chat.members.find(
          (member) => member?.id === user1Details.id
        );
        const member = chat.members.find(
          (member) => member?.id === user2Details.id
        );
        assert.ok(creator, "Creator should be in members");
        assert.ok(member, "Member should be in members");
        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(member.role, "member");
      });

      void test("succeeds creating group chat", async () => {
        const responseBody = await createChat(groupChatDetails, token);

        const chat = responseBody.data?.createChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.type, "group");
        assert.strictEqual(chat.name, groupChatDetails.name);
        assert.strictEqual(chat.description, groupChatDetails.description);
        assert.strictEqual(chat.avatar, null);
        assert.strictEqual(chat.members?.length, 3);
        assert.strictEqual(chat.messages?.length, 1);
        assert.strictEqual(
          chat?.messages[0]?.content,
          groupChatDetails.initialMessage
        );
        assert.strictEqual(chat?.messages[0]?.sender?.id, user1Details.id);
        const creator = chat.members.find(
          (member) => member?.id === user1Details.id
        );
        const member1 = chat.members.find(
          (member) => member?.id === user2Details.id
        );
        const member2 = chat.members.find(
          (member) => member?.id === user3Details.id
        );
        assert.ok(creator, "Creator should be in members");
        assert.ok(member1, "Member 1 should be in members");
        assert.ok(member2, "Member 2 should be in members");
        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(member1.role, "member");
        assert.strictEqual(member2.role, "member");
      });
    });

    void describe("Edit chat", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await createChat(groupChatDetails, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "Updated Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          ""
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with empty chat name", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "",
            description: "Updated description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Group chat name must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with chat name shorter than 3 characters", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "AB",
            description: "Updated description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Group chat name must be at least 3 characters long"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await editChat(
          {
            id: "999",
            name: "Updated Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Chat not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds updating chat name and description", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "Updated Group Chat",
            description: "Updated test description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "group");
        assert.strictEqual(chat.name, "Updated Group Chat");
        assert.strictEqual(chat.description, "Updated test description");
        assert.strictEqual(chat.members?.length, 3);

        const creator = chat.members?.find((m) => m?.id === user1Details.id);
        const member1 = chat.members?.find((m) => m?.id === user2Details.id);
        const member2 = chat.members?.find((m) => m?.id === user3Details.id);

        assert.ok(creator, "Creator should be in members");
        assert.ok(member1, "Member 1 should be in members");
        assert.ok(member2, "Member 2 should be in members");
        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(member1.role, "member");
        assert.strictEqual(member2.role, "member");
      });

      void test("succeeds removing member from chat", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "Updated Group Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.members?.length, 2);

        const creator = chat.members?.find(
          (member) => member?.id === user1Details.id
        );
        const member = chat.members?.find(
          (member) => member?.id === user2Details.id
        );
        const removedMember = chat.members?.find(
          (member) => member?.id === user3Details.id
        );

        assert.ok(creator, "Creator should be in members");
        assert.ok(member, "Member should be in members");
        assert.strictEqual(removedMember, undefined, "User3 should be removed");
      });

      void test("succeeds with null description", async () => {
        const responseBody = await editChat(
          {
            id: chatId,
            name: "Chat with No Description",
            description: null,
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.name, "Chat with No Description");
        assert.strictEqual(chat.description, null);
      });
    });

    void describe("Delete chat", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await createChat(groupChatDetails, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await deleteChat(chatId, "");

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await deleteChat("999", token);

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Chat not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds deleting chat with valid ID", async () => {
        const responseBody = await deleteChat(chatId, token);

        const chat = responseBody.data?.deleteChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "group");
        assert.strictEqual(chat.name, groupChatDetails.name);
        assert.strictEqual(chat.description, groupChatDetails.description);
      });

      void test("fails when trying to delete same chat twice", async () => {
        await deleteChat(chatId, token);
        const responseBody = await deleteChat(chatId, token);

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Chat not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });
    });

    void describe("Find chat by ID", () => {
      let chatId: string;

      beforeEach(async () => {
        const responseBody = await createChat(groupChatDetails, token);
        assert.ok(
          responseBody.data?.createChat.id,
          "Chat ID should be defined"
        );
        chatId = responseBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await findChatById(chatId, "");

        const chat = responseBody.data?.findChatById;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await findChatById("999", token);

        const chat = responseBody.data?.findChatById;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Chat not found");
        assert.strictEqual(error.extensions?.code, "NOT_FOUND");
      });

      void test("succeeds finding chat", async () => {
        const responseBody = await findChatById(chatId, token);

        const chat = responseBody.data?.findChatById;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "group");
        assert.strictEqual(chat.name, groupChatDetails.name);
        assert.strictEqual(chat.description, groupChatDetails.description);
        assert.strictEqual(chat.avatar, null);
        assert.strictEqual(chat.members?.length, 3);
        assert.strictEqual(chat.messages?.length, 1);

        const creator = chat.members?.find((m) => m?.id === user1Details.id);
        const member1 = chat.members?.find((m) => m?.id === user2Details.id);
        const member2 = chat.members?.find((m) => m?.id === user3Details.id);

        assert.ok(creator, "Creator should be in members");
        assert.ok(member1, "Member 1 should be in members");
        assert.ok(member2, "Member 2 should be in members");
        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(member1.role, "member");
        assert.strictEqual(member2.role, "member");

        const message = chat.messages?.[0];
        assert.ok(message, "Message should exist");
        assert.strictEqual(message.content, groupChatDetails.initialMessage);
        assert.strictEqual(message.sender?.id, user1Details.id);
        assert.strictEqual(message.sender?.username, user1Details.username);
      });
    });

    void describe("Send message", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await createChat(privateChatDetails, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await sendMessage(
          {
            id: chatId,
            content: "Hello from unauthenticated user",
          },
          ""
        );

        const chat = responseBody.data?.sendMessage;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("fails with empty message content", async () => {
        const responseBody = await sendMessage(
          {
            id: chatId,
            content: "",
          },
          token
        );

        const chat = responseBody.data?.sendMessage;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Input validation failed");
        assert.strictEqual(
          error.extensions?.validationErrors?.[0].message,
          "Message content cannot be empty"
        );
        assert.strictEqual(error.extensions?.code, "BAD_USER_INPUT");
      });

      void test("succeeds sending message to chat", async () => {
        const messageContent = "Hello from chat!";
        const responseBody = await sendMessage(
          {
            id: chatId,
            content: messageContent,
          },
          token
        );

        const chat = responseBody.data?.sendMessage;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "private");
        assert.strictEqual(chat.messages?.length, 2);

        const initialMessage = chat.messages?.[0];
        assert.ok(initialMessage, "Initial message should exist");
        assert.strictEqual(
          initialMessage.content,
          privateChatDetails.initialMessage
        );

        const newMessage = chat.messages?.[chat.messages.length - 1];
        assert.ok(newMessage, "New message should exist");
        assert.strictEqual(newMessage.content, messageContent);
        assert.strictEqual(newMessage.sender?.id, user1Details.id);
        assert.strictEqual(newMessage.sender?.username, user1Details.username);
      });
    });

    void describe("Leave chat", () => {
      let chatId: string;
      let token2: string;

      beforeEach(async () => {
        const chatBody = await createChat(groupChatDetails, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;

        const loginResponseBody = await login({
          username: user2Details.username,
          password: user2Details.password,
        });

        assert.ok(
          loginResponseBody.data,
          "User2 login token value should be defined"
        );
        token2 = loginResponseBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const responseBody = await leaveChat(chatId, "");

        const chat = responseBody.data?.leaveChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("succeeds when member leaves group chat", async () => {
        const responseBody = await leaveChat(chatId, token2);

        const chat = responseBody.data?.leaveChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.members?.length, 2);

        const leftMember = chat.members?.find(
          (member) => member?.id === user2Details.id
        );
        const creator = chat.members?.find(
          (member) => member?.id === user1Details.id
        );
        const otherMember = chat.members?.find(
          (member) => member?.id === user3Details.id
        );

        assert.strictEqual(
          leftMember,
          undefined,
          "User2 should no longer be in members"
        );
        assert.ok(creator, "Creator should still be in members");
        assert.ok(otherMember, "User3 should still be in members");

        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(otherMember.role, "member");
      });
    });

    void describe("All chats by user", () => {
      void test("fails without authentication", async () => {
        const responseBody = await allChatsByUser(null, "");

        const chats = responseBody.data?.allChatsByUser;

        assert.strictEqual(chats, undefined, "Chats should be undefined");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("returns empty array when no chats exist", async () => {
        const responseBody = await allChatsByUser(null, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 0, "Should have no chats");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });

      void test("returns all chats when user has chats", async () => {
        await createChat(privateChatDetails, token);
        await createChat(groupChatDetails, token);

        const responseBody = await allChatsByUser(null, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 2, "Should have 2 chats");
      });

      void test("filters chats by name search", async () => {
        await createChat(privateChatDetails, token);
        await createChat(groupChatDetails, token);

        const responseBody = await allChatsByUser(groupChatDetails.name, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });

      void test("filters chats by description search", async () => {
        await createChat(privateChatDetails, token);
        await createChat(groupChatDetails, token);

        const responseBody = await allChatsByUser(
          groupChatDetails.description,
          token
        );

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });

      void test("search is case insensitive", async () => {
        await createChat(groupChatDetails, token);

        const responseBody = await allChatsByUser("TEST", token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });
    });

    void describe("Find private with contact", () => {
      let userId: string;
      let chatId: string;

      beforeEach(async () => {
        const contactResponseBody = await addContact(user2Details.id, token);

        assert.ok(
          contactResponseBody.data?.addContact.id,
          "Contact ID should be defined"
        );
        userId = contactResponseBody.data.addContact.contactDetails.id;

        const chatResponseBody = await createChat(privateChatDetails, token);
        assert.ok(
          chatResponseBody.data?.createChat.id,
          "Chat ID should be defined"
        );
        chatId = chatResponseBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await findPrivateChatWithContact(userId, "");

        const chat = responseBody.data?.findPrivateChatWithContact;

        assert.strictEqual(chat, null, "Chat should be null");
        assert.ok(responseBody.errors, "Response should have errors");
        assert.ok(
          responseBody.errors?.length > 0,
          "Should have at least one error"
        );

        const error = responseBody.errors[0];
        assert.strictEqual(error.message, "Not authenticated");
        assert.strictEqual(error.extensions?.code, "UNAUTHENTICATED");
      });

      void test("returns null with non-existent chat ID", async () => {
        const responseBody = await findPrivateChatWithContact("999", token);

        const chat = responseBody.data?.findPrivateChatWithContact;

        assert.strictEqual(chat, null, "Chat should be null");
      });

      void test("succeeds finding chat", async () => {
        const responseBody = await findPrivateChatWithContact(userId, token);

        const chat = responseBody.data?.findPrivateChatWithContact;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "private");
        assert.strictEqual(chat.name, user2Details.name);
        assert.strictEqual(chat.description, null);
        assert.strictEqual(chat.avatar, null);
        assert.strictEqual(chat.members?.length, 2);

        const creator = chat.members?.find((m) => m?.id === user1Details.id);
        const member1 = chat.members?.find((m) => m?.id === user2Details.id);

        assert.ok(creator, "Creator should be in members");
        assert.ok(member1, "Member 1 should be in members");
        assert.strictEqual(creator.role, "admin");
        assert.strictEqual(member1.role, "member");
      });
    });
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
