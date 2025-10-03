import request from "supertest";
import type { Response } from "supertest";
import type { ApolloServer, BaseContext } from "@apollo/server";
import type { HTTPGraphQLResponse } from "../types/other";
import type { User } from "~/types/graphql";

import { sequelize } from "../db";
import { start } from "../server";
import { emptyDatabase, populateDatabase } from "../populateDatabase";
import { describe, before, beforeEach, test, after } from "node:test";
import assert from "node:assert";

let url: string;

const userDetails = {
  username: "user1",
  password: "password",
  confirmPassword: "password",
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

void describe("GraphQL API", () => {
  let server: ApolloServer<BaseContext>;

  before(async () => {
    ({ server, url } = await start());
  });

  beforeEach(async () => {
    await emptyDatabase();
    await populateDatabase();
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
    assert.ok(count, "Count should be defined");
    assert.strictEqual(count, 312);
  });

  void describe("User creation", () => {
    void test("fails with username shorter than 3 characters", async () => {
      const response = await createUser({
        ...userDetails,
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
        ...userDetails,
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
        ...userDetails,
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
      await createUser(userDetails);
      const response = await createUser(userDetails);

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
      const response = await createUser(userDetails);

      assert.strictEqual(response.error, false);

      const responseBody = response.body as HTTPGraphQLResponse<{
        createUser: User;
      }>;
      const user = responseBody.data?.createUser;

      assert.ok(user, "User should be defined");
      assert.strictEqual(user.username, userDetails.username);
      assert.strictEqual(
        user.name,
        userDetails.username[0].toUpperCase() + userDetails.username.slice(1)
      );
      assert.strictEqual(user.about, null);
      assert.strictEqual(user.avatar, null);
    });
  });

  after(async () => {
    await server.stop();
    await sequelize.close();
  });
});
