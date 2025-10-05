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
} from "~/types/graphql";

import { sequelize } from "../db";
import { start } from "../server";
import { emptyDatabase, createDatabase } from "../populateDatabase";
import { describe, before, beforeEach, test, after } from "node:test";
import assert from "node:assert";

let url: string;

const user1Details = {
  id: "1",
  username: "user1",
  password: "password",
  confirmPassword: "password",
};

const user2Details = {
  ...user1Details,
  id: "2",
  username: "user2",
};

const user3Details = {
  ...user1Details,
  id: "3",
  username: "user3",
};

const { id: _, ...user1Input } = user1Details;
const { id: _id, ...user2Input } = user2Details;
const { id: _id2, ...user3Input } = user3Details;

const privateChatDetails = {
  name: null,
  description: null,
  members: [user2Details.id],
  initialMessage: "Hello world",
};

const groupChatDetails = {
  name: "Group Chat",
  description: "Test description",
  members: [user2Details.id, user3Details.id],
  initialMessage: "Hello world",
};

const COUNT_DOCUMENTS = `
  query CountDocuments {
    countDocuments
  }
`;

const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      name
      about
      avatar
    }
  }
`;

const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      value
    }
  }
`;

const ME = `
  query Me {
    me {
      id
      username
      name
      about
      avatar
    }
  }
`;

const ADD_CONTACT = `
  mutation AddContact($id: ID!) {
    addContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
      }
    }
  }
`;

const REMOVE_CONTACT = `
  mutation RemoveContact($id: ID!) {
    removeContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
      }
    }
  }
`;

const CREATE_CHAT = `
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const EDIT_CHAT = `
  mutation EditChat($input: EditChatInput!) {
    editChat(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const DELETE_CHAT = `
  mutation DeleteChat($id: ID!) {
    deleteChat(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const TOGGLE_BLOCK_CONTACT = `
  mutation ToggleBlockContact($id: ID!) {
    toggleBlockContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
      }
    }
  }
`;

const SEND_MESSAGE = `
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const LEAVE_CHAT = `
  mutation LeaveChat($id: ID!) {
    leaveChat(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const EDIT_PROFILE = `
  mutation EditProfile($input: EditProfileInput!) {
    editProfile(input: $input) {
      id
      username
      name
      about
      avatar
    }
  }
`;

const FIND_USER_BY_ID = `
  query FindUserById($id: ID!) {
    findUserById(id: $id) {
      id
      username
      name
      about
      avatar
    }
  }
`;

const FIND_CHAT_BY_ID = `
  query FindChatById($id: ID!) {
    findChatById(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
      }
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

const IS_BLOCKED_BY_USER = `
  query IsBlockedByUser($id: ID!) {
    isBlockedByUser(id: $id) 
  }
`;

const ALL_CONTACTS_BY_USER = `
  query AllContactsByUser($search: String) {
    allContactsByUser(search: $search) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
      }
    }
  }
`;

const ALL_CHATS_BY_USER = `
  query AllChatsByUser($search: String) {
    allChatsByUser(search: $search) {
      id
      name
      avatar
      messages {
        id
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
`;

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

const createUser = async (input: CreateUserInput): Promise<Response> =>
  await makeRequest(CREATE_USER, { input });

const login = async (input: LoginInput): Promise<Response> =>
  await makeRequest(LOGIN, { input });

const getMe = async (token?: string, expectedCode = 200): Promise<Response> =>
  await makeRequest(ME, {}, token, expectedCode);

const addContact = async (id: string, token: string): Promise<Response> =>
  await makeRequest(ADD_CONTACT, { id }, token);

const removeContact = async (id: string, token: string): Promise<Response> =>
  await makeRequest(REMOVE_CONTACT, { id }, token);

const toggleBlockContact = async (
  id: string,
  token: string
): Promise<Response> => await makeRequest(TOGGLE_BLOCK_CONTACT, { id }, token);

const createChat = async (
  input: CreateChatInput,
  token: string
): Promise<Response> => await makeRequest(CREATE_CHAT, { input }, token);

const editChat = async (
  input: EditChatInput,
  token: string
): Promise<Response> => await makeRequest(EDIT_CHAT, { input }, token);

const deleteChat = async (id: string, token: string): Promise<Response> =>
  await makeRequest(DELETE_CHAT, { id }, token);

const sendMessage = async (
  input: SendMessageInput,
  token: string
): Promise<Response> => await makeRequest(SEND_MESSAGE, { input }, token);

const leaveChat = async (id: string, token: string): Promise<Response> =>
  await makeRequest(LEAVE_CHAT, { id }, token);

const editProfile = async (
  input: EditProfileInput,
  token: string
): Promise<Response> => await makeRequest(EDIT_PROFILE, { input }, token);

const findUserById = async (id: string, token: string): Promise<Response> =>
  await makeRequest(FIND_USER_BY_ID, { id }, token);

const findChatById = async (id: string, token: string): Promise<Response> =>
  await makeRequest(FIND_CHAT_BY_ID, { id }, token);

const isBlockedByUser = async (id: string, token: string): Promise<Response> =>
  await makeRequest(IS_BLOCKED_BY_USER, { id }, token);

const allContactsByUser = async (
  search: string | null,
  token: string
): Promise<Response> =>
  await makeRequest(ALL_CONTACTS_BY_USER, search ? { search } : {}, token);

const allChatsByUser = async (
  search: string | null,
  token: string
): Promise<Response> =>
  await makeRequest(ALL_CHATS_BY_USER, search ? { search } : {}, token);

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
    const response = await request(url)
      .post("/")
      .send({
        query: COUNT_DOCUMENTS,
      })
      .expect("Content-Type", /json/)
      .expect(200);

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
        const response = await createUser({
          ...user1Input,
          username: "us",
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
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
        const response = await createUser({
          ...user1Input,
          password: "short",
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
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
        const response = await createUser({
          ...user1Input,
          confirmPassword: "passwor",
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
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
        const response = await createUser(user1Input);

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
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
        const response = await createUser(user1Input);

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
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
        const response = await login({
          username: "nonexistent",
          password: user1Details.password,
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
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
        const response = await login({
          username: user1Details.username,
          password: "wrongpassword",
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
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
        const response = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        assert.strictEqual(response.error, false);

        const responseBody = response.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
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
        const loginResponse = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        const loginBody = loginResponse.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
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

    void describe.only("Find user by ID", () => {
      let token: string;
      let user2Id: string;

      beforeEach(async () => {
        await createUser(user1Input);
        const user2Response = await createUser(user2Input);

        const user2Body = user2Response.body as HTTPGraphQLResponse<{
          createUser: User;
        }>;
        assert.ok(user2Body.data?.createUser?.id, "User2 ID should be defined");
        user2Id = user2Body.data.createUser.id;

        const loginResponse = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        const loginBody = loginResponse.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const response = await findUserById(user2Id, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          findUserById: User;
        }>;
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
        const response = await findUserById("999", token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findUserById: User;
        }>;
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
        const response = await findUserById(user2Id, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findUserById: User;
        }>;
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
        const loginResponse = await login({
          username: user1Details.username,
          password: user1Details.password,
        });

        const loginBody = loginResponse.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
        assert.ok(loginBody.data, "Login token value should be defined");
        token = loginBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const response = await editProfile(
          {
            name: "Updated Name",
            about: "Updated about",
          },
          ""
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editProfile: User;
        }>;
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
        const response = await editProfile(
          {
            name: "AB",
            about: "Valid about text",
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editProfile: User;
        }>;
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

        const response = await editProfile(
          {
            name: updatedName,
            about: updatedAbout,
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editProfile: User;
        }>;
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

        const response = await editProfile(
          {
            name: updatedName,
            about: null,
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editProfile: User;
        }>;
        const user = responseBody.data?.editProfile;

        assert.ok(user, "User should be defined");
        assert.strictEqual(user.id, user1Details.id);
        assert.strictEqual(user.username, user1Details.username);
        assert.strictEqual(user.name, updatedName);
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

      const loginResponse = await login({
        username: user1Details.username,
        password: user1Details.password,
      });

      const user1LoginBody = loginResponse.body as HTTPGraphQLResponse<{
        login: { value: string };
      }>;
      assert.ok(
        user1LoginBody.data,
        "User1 login token value should be defined"
      );
      user1Token = user1LoginBody.data.login.value;

      const user2LoginResponse = await login({
        username: user2Details.username,
        password: user2Details.password,
      });

      const user2LoginBody = user2LoginResponse.body as HTTPGraphQLResponse<{
        login: { value: string };
      }>;
      assert.ok(user2LoginBody.data, "User2 login token should be defined");
      user2Token = user2LoginBody.data.login.value;
    });

    void describe("Add contact", () => {
      void test("fails without authentication", async () => {
        const response = await addContact(user1Details.id, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;
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
        const response = await addContact(user1Details.id, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;
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
        const response = await addContact(user2Details.id, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;
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
        const response = await addContact(user2Details.id, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;
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

    void describe("Remove contact", () => {
      let contactId: string;
      beforeEach(async () => {
        const response = await addContact(user2Details.id, user1Token);
        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const response = await removeContact(contactId, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          removeContact: Contact;
        }>;
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
        const response = await removeContact("999", user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          removeContact: Contact;
        }>;
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
        const response = await removeContact(contactId, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          removeContact: Contact;
        }>;
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
        const response = await removeContact(contactId, user1Token);
        const responseBody = response.body as HTTPGraphQLResponse<{
          removeContact: Contact;
        }>;
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
        const response = await addContact(user2Details.id, user1Token);
        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const response = await toggleBlockContact(contactId, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          toggleBlockContact: Contact;
        }>;
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
        const response = await toggleBlockContact("999", user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          toggleBlockContact: Contact;
        }>;
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
        const response = await toggleBlockContact(contactId, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          toggleBlockContact: Contact;
        }>;
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
        const response = await toggleBlockContact(contactId, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          toggleBlockContact: Contact;
        }>;
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
        const response = await addContact(user2Details.id, user1Token);
        const responseBody = response.body as HTTPGraphQLResponse<{
          addContact: Contact;
        }>;

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
        await addContact(user1Details.id, user2Token);
      });

      void test("fails without authentication", async () => {
        const response = await isBlockedByUser(user1Details.id, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          isBlockedByUser: boolean;
        }>;
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
        const response = await isBlockedByUser("999", user2Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          isBlockedByUser: boolean;
        }>;
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
        const response = await isBlockedByUser(user1Details.id, user2Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          isBlockedByUser: boolean;
        }>;
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
        const response = await isBlockedByUser(user1Details.id, user2Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          isBlockedByUser: boolean;
        }>;
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
        const response = await allContactsByUser(null, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
        const contacts = responseBody.data?.allContactsByUser;

        assert.strictEqual(contacts, null, "Contacts should be null");
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
        const response = await allContactsByUser(null, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
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

        const response = await allContactsByUser(null, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 2, "Should have 2 contacts");
      });

      void test("filters contacts by username search", async () => {
        await addContact(user2Details.id, user1Token);
        await addContact(user3Details.id, user1Token);

        const response = await allContactsByUser(
          user2Details.username,
          user1Token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
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
          },
          user2Token
        );

        const response = await allContactsByUser(newName, user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
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

        const response = await allContactsByUser("nonexistent", user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
      });

      void test("search is case insensitive", async () => {
        await addContact(user2Details.id, user1Token);

        const response = await allContactsByUser("USER2", user1Token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allContactsByUser: Contact[];
        }>;
        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];
        assert.ok(contact, "Contact should exist");
        assert.strictEqual(contact?.contactDetails?.id, user2Details.id);
      });
    });
  });

  void describe("Chats", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Input);
      await createUser(user2Input);
      await createUser(user3Input);

      const loginResponse = await login({
        username: user1Details.username,
        password: user1Details.password,
      });

      const loginBody = loginResponse.body as HTTPGraphQLResponse<{
        login: { value: string };
      }>;
      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void describe("Create chat", () => {
      void test("fails without authentication", async () => {
        const response = await createChat(privateChatDetails, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
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
        const response = await createChat(
          {
            ...privateChatDetails,
            initialMessage: "",
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
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
        const response = await createChat(
          {
            ...groupChatDetails,
            name: "",
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
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
        const response = await createChat(
          {
            ...groupChatDetails,
            name: "te",
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
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
        const response = await createChat(privateChatDetails, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        const chat = responseBody.data?.createChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.type, "private");
        assert.strictEqual(chat.name, null);
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
        const response = await createChat(groupChatDetails, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
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
        const response = await createChat(groupChatDetails, token);
        const chatBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const response = await editChat(
          {
            id: chatId,
            name: "Updated Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          ""
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: chatId,
            name: "",
            description: "Updated description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: chatId,
            name: "AB",
            description: "Updated description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: "999",
            name: "Updated Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: chatId,
            name: "Updated Group Chat",
            description: "Updated test description",
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: chatId,
            name: "Updated Group Chat",
            description: "Updated description",
            members: [user2Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
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
        const response = await editChat(
          {
            id: chatId,
            name: "Chat with No Description",
            description: null,
            members: [user2Details.id, user3Details.id],
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          editChat: Chat;
        }>;
        const chat = responseBody.data?.editChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.name, "Chat with No Description");
        assert.strictEqual(chat.description, null);
      });
    });

    void describe("Delete chat", () => {
      let chatId: string;

      beforeEach(async () => {
        const response = await createChat(groupChatDetails, token);
        const chatBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const response = await deleteChat(chatId, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          deleteChat: Chat;
        }>;
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
        const response = await deleteChat("999", token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          deleteChat: Chat;
        }>;
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
        const response = await deleteChat(chatId, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          deleteChat: Chat;
        }>;
        const chat = responseBody.data?.deleteChat;

        assert.ok(chat, "Chat should be defined");
        assert.strictEqual(chat.id, chatId);
        assert.strictEqual(chat.type, "group");
        assert.strictEqual(chat.name, groupChatDetails.name);
        assert.strictEqual(chat.description, groupChatDetails.description);
      });

      void test("fails when trying to delete same chat twice", async () => {
        await deleteChat(chatId, token);
        const response = await deleteChat(chatId, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          deleteChat: Chat;
        }>;
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
        const response = await createChat(groupChatDetails, token);
        const responseBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        assert.ok(
          responseBody.data?.createChat.id,
          "Chat ID should be defined"
        );
        chatId = responseBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const response = await findChatById(chatId, "");
        const responseBody = response.body as HTTPGraphQLResponse<{
          findChatById: Chat;
        }>;
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
        const response = await findChatById("999", token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findChatById: Chat;
        }>;
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
        const response = await findChatById(chatId, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          findChatById: Chat;
        }>;
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
        const response = await createChat(privateChatDetails, token);
        const chatBody = response.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const response = await sendMessage(
          {
            id: chatId,
            content: "Hello from unauthenticated user",
          },
          ""
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          sendMessage: Chat;
        }>;
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
        const response = await sendMessage(
          {
            id: chatId,
            content: "",
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          sendMessage: Chat;
        }>;
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
        const response = await sendMessage(
          {
            id: chatId,
            content: messageContent,
          },
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          sendMessage: Chat;
        }>;
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
        const chatResponse = await createChat(groupChatDetails, token);
        const chatBody = chatResponse.body as HTTPGraphQLResponse<{
          createChat: Chat;
        }>;
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;

        const loginResponse = await login({
          username: user2Details.username,
          password: user2Details.password,
        });

        const loginResponseBody = loginResponse.body as HTTPGraphQLResponse<{
          login: { value: string };
        }>;
        assert.ok(
          loginResponseBody.data,
          "User2 login token value should be defined"
        );
        token2 = loginResponseBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const response = await leaveChat(chatId, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          leaveChat: Chat;
        }>;
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
        const response = await leaveChat(chatId, token2);

        const responseBody = response.body as HTTPGraphQLResponse<{
          leaveChat: Chat;
        }>;
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
        const response = await allChatsByUser(null, "");

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
        const chats = responseBody.data?.allChatsByUser;

        assert.strictEqual(chats, null, "Chats should be null");
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
        const response = await allChatsByUser(null, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
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

        const response = await allChatsByUser(null, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 2, "Should have 2 chats");
      });

      void test("filters chats by name search", async () => {
        await createChat(privateChatDetails, token);
        await createChat(groupChatDetails, token);

        const response = await allChatsByUser(groupChatDetails.name, token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
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

        const response = await allChatsByUser(
          groupChatDetails.description,
          token
        );

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });

      void test("search is case insensitive", async () => {
        await createChat(groupChatDetails, token);

        const response = await allChatsByUser("TEST", token);

        const responseBody = response.body as HTTPGraphQLResponse<{
          allChatsByUser: Chat[];
        }>;
        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });
    });
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
