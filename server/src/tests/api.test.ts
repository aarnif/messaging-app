import request from "supertest";
import type { Response } from "supertest";
import type { ApolloServer, BaseContext } from "@apollo/server";
import type { HTTPGraphQLResponse } from "../types/other";
import type {
  User,
  Contact,
  Chat,
  CreateChatInput,
  EditChatInput,
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

const createUser = async ({
  username,
  password,
  confirmPassword,
}: {
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: CREATE_USER,
      variables: {
        input: {
          username,
          password,
          confirmPassword,
        },
      },
    })
    .expect("Content-Type", /json/)
    .expect(200);
};

const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: LOGIN,
      variables: {
        input: {
          username,
          password,
        },
      },
    })
    .expect("Content-Type", /json/)
    .expect(200);
};

const getMe = async (token?: string, expectedCode = 200): Promise<Response> => {
  const response = request(url).post("/").send({
    query: ME,
  });

  if (token) {
    response.set("Authorization", `Bearer ${token}`);
  }

  return await response.expect("Content-Type", /json/).expect(expectedCode);
};

const addContact = async (id: string, token: string): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: ADD_CONTACT,
      variables: { id },
    })
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect(200);
};

const removeContact = async (id: string, token: string): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: REMOVE_CONTACT,
      variables: { id },
    })
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect(200);
};

const createChat = async (
  input: CreateChatInput,
  token: string
): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: CREATE_CHAT,
      variables: { input },
    })
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect(200);
};

const editChat = async (
  input: EditChatInput,
  token: string
): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: EDIT_CHAT,
      variables: { input },
    })
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect(200);
};

const deleteChat = async (id: string, token: string): Promise<Response> => {
  return await request(url)
    .post("/")
    .send({
      query: DELETE_CHAT,
      variables: { id },
    })
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect(200);
};

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
          ...user1Details,
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
          ...user1Details,
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
          ...user1Details,
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
        await createUser(user1Details);
        const response = await createUser(user1Details);

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
        const response = await createUser(user1Details);

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
        await createUser(user1Details);
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
        await createUser(user1Details);
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
  });

  void describe("Contacts", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Details);
      await createUser(user2Details);
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
        const response = await addContact(user1Details.id, token);

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
        const response = await addContact(user2Details.id, token);

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
        await addContact(user2Details.id, token);
        const response = await addContact(user2Details.id, token);

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
        const response = await addContact(user2Details.id, token);
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
        const response = await removeContact("999", token);

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
        const response = await removeContact(contactId, token);

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
        await removeContact(contactId, token);
        const response = await removeContact(contactId, token);
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
  });

  void describe("Chats", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Details);
      await createUser(user2Details);
      await createUser(user3Details);
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

        const creator = chat.members?.find((m) => m?.id === user1Details.id);
        const member = chat.members?.find((m) => m?.id === user2Details.id);
        const removedMember = chat.members?.find(
          (m) => m?.id === user3Details.id
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
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
