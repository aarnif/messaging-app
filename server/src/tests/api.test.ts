import request from "supertest";
import type { Response } from "supertest";
import type { ApolloServer, BaseContext } from "@apollo/server";
import type { HTTPGraphQLResponse } from "../types/other";
import type { User, Contact } from "~/types/graphql";

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
        user1Details.username[0].toUpperCase() + user1Details.username.slice(1)
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
      token = loginBody.data!.login.value;
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
        user1Details.username[0].toUpperCase() + user1Details.username.slice(1)
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
      token = loginBody.data!.login.value;
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
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
