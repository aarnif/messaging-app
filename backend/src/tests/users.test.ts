import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import type {
  ChangePasswordInput,
  EditProfileInput,
  LoginInput,
  User,
} from "~/types/graphql";
import {
  expectedUser1,
  expectedUser2,
  user1Details,
  user1Input,
  user2Input,
} from "./helpers/data.js";
import {
  assertError,
  assertUserEquality,
  assertValidationError,
  createUser,
  query,
} from "./helpers/funcs.js";
import {
  CHANGE_PASSWORD,
  EDIT_PROFILE,
  FIND_USER_BY_ID,
  LOGIN,
  ME,
} from "./helpers/queries.js";
import { describeGraphQLSuite } from "./helpers/setup.js";

describeGraphQLSuite("Users", () => {
  void describe("User creation", () => {
    void test("fails with username shorter than 3 characters", async () => {
      const responseBody = await createUser({
        ...user1Input,
        username: "us",
      });

      const user = responseBody.data?.createUser;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(
        responseBody,
        "Username must be at least 3 characters long",
      );
    });

    void test("fails with password shorter than 6 characters", async () => {
      const responseBody = await createUser({
        ...user1Input,
        password: "short",
      });
      const user = responseBody.data?.createUser;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(
        responseBody,
        "Password must be at least 6 characters long",
      );
    });

    void test("fails when passwords do not match", async () => {
      const responseBody = await createUser({
        ...user1Input,
        confirmPassword: "passwor",
      });
      const user = responseBody.data?.createUser;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(responseBody, "Passwords do not match");
    });

    void test("fails if user already exists", async () => {
      await createUser(user1Input);
      const responseBody = await createUser(user1Input);
      const user = responseBody.data?.createUser;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "Username already exists", "BAD_USER_INPUT");
    });

    void test("succeeds with valid input", async () => {
      const responseBody = await createUser(user1Input);
      const user = responseBody.data?.createUser;

      assertUserEquality(user, expectedUser1);
    });
  });

  void describe("User login", () => {
    beforeEach(async () => {
      await createUser(user1Input);
    });

    void test("fails with non-existent username", async () => {
      const responseBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: "nonexistent",
          password: user1Details.password,
        },
      });
      const token = responseBody.data?.login;

      assert.strictEqual(token, null, "Token should be null");
      assertError(
        responseBody,
        "Invalid username or password",
        "BAD_USER_INPUT",
      );
    });

    void test("fails with incorrect password", async () => {
      const responseBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: "wrongpassword",
        },
      });
      const token = responseBody.data?.login;

      assert.strictEqual(token, null, "Token should be null");
      assertError(
        responseBody,
        "Invalid username or password",
        "BAD_USER_INPUT",
      );
    });

    void test("succeeds with valid credentials", async () => {
      const responseBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
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
      const loginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<{ me: User }>(ME, {}, "");
      const user = responseBody.data?.me;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("succeeds with valid token", async () => {
      const responseBody = await query<{ me: User }>(ME, {}, token);
      const user = responseBody.data?.me;

      assertUserEquality(user, expectedUser1);
    });

    void test("fails with invalid token", async () => {
      const responseBody = await query<{ me: User }>(
        ME,
        {},
        "invalid-token",
        500,
        true,
      );
      const user = responseBody.data?.me;

      assert.strictEqual(user, undefined, "User should be undefined");
      assertError(
        responseBody,
        "Context creation failed: jwt malformed",
        "INTERNAL_SERVER_ERROR",
      );
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

      const loginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<{ findUserById: User }, { id: string }>(
        FIND_USER_BY_ID,
        { id: user2Id },
        "",
      );

      const user = responseBody.data?.findUserById;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent user ID", async () => {
      const responseBody = await query<{ findUserById: User }, { id: string }>(
        FIND_USER_BY_ID,
        { id: "999" },
        token,
      );

      const user = responseBody.data?.findUserById;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "User not found", "NOT_FOUND");
    });

    void test("succeeds with valid user ID", async () => {
      const responseBody = await query<{ findUserById: User }, { id: string }>(
        FIND_USER_BY_ID,
        { id: user2Id },
        token,
      );

      const user = responseBody.data?.findUserById;

      assertUserEquality(user, expectedUser2);
    });
  });

  void describe("Edit profile", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Input);
      const loginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<
        { editProfile: User },
        { input: EditProfileInput }
      >(
        EDIT_PROFILE,
        {
          input: {
            name: "Updated Name",
            about: "Updated about",
            is24HourClock: true,
          },
        },
        "",
      );

      const user = responseBody.data?.editProfile;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with name shorter than 3 characters", async () => {
      const responseBody = await query<
        { editProfile: User },
        { input: EditProfileInput }
      >(
        EDIT_PROFILE,
        {
          input: {
            name: "AB",
            about: "Valid about text",
            is24HourClock: true,
          },
        },
        token,
      );

      const user = responseBody.data?.editProfile;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(
        responseBody,
        "Name must be at least 3 characters long",
      );
    });

    void test("succeeds updating name and about", async () => {
      const updatedName = "Updated Name";
      const updatedAbout = "This is my updated about section";

      const responseBody = await query<
        { editProfile: User },
        { input: EditProfileInput }
      >(
        EDIT_PROFILE,
        {
          input: {
            name: updatedName,
            about: updatedAbout,
            is24HourClock: true,
          },
        },
        token,
      );

      const user = responseBody.data?.editProfile;

      assertUserEquality(user, {
        ...expectedUser1,
        name: updatedName,
        about: updatedAbout,
      });
    });

    void test("succeeds updating name with null about", async () => {
      const updatedName = "Another Updated Name";

      const responseBody = await query<
        { editProfile: User },
        { input: EditProfileInput }
      >(
        EDIT_PROFILE,
        {
          input: {
            name: updatedName,
            about: null,
            is24HourClock: true,
          },
        },
        token,
      );

      const user = responseBody.data?.editProfile;

      assertUserEquality(user, {
        ...expectedUser1,
        name: updatedName,
      });
    });
  });

  void describe("Change password", () => {
    let token: string;

    beforeEach(async () => {
      await createUser(user1Input);
      const loginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<
        { changePassword: User },
        { input: ChangePasswordInput }
      >(
        CHANGE_PASSWORD,
        {
          input: {
            currentPassword: user1Details.password,
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
        },
        "",
      );

      const user = responseBody.data?.changePassword;

      assert.strictEqual(user, null, "User should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with wrong current password", async () => {
      const responseBody = await query<
        { changePassword: User },
        { input: ChangePasswordInput }
      >(
        CHANGE_PASSWORD,
        {
          input: {
            currentPassword: "wrong",
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
        },
        token,
      );

      const user = responseBody.data?.changePassword;

      assert.strictEqual(user, null, "User should be null");
      assertError(
        responseBody,
        "Current password does not match",
        "BAD_USER_INPUT",
      );
    });

    void test("fails with new password shorter than 6 characters", async () => {
      const responseBody = await query<
        { changePassword: User },
        { input: ChangePasswordInput }
      >(
        CHANGE_PASSWORD,
        {
          input: {
            currentPassword: user1Details.password,
            newPassword: "short",
            confirmNewPassword: "short",
          },
        },
        token,
      );

      const user = responseBody.data?.changePassword;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(
        responseBody,
        "Password must be at least 6 characters long",
      );
    });

    void test("fails with new passwords not matching", async () => {
      const responseBody = await query<
        { changePassword: User },
        { input: ChangePasswordInput }
      >(
        CHANGE_PASSWORD,
        {
          input: {
            currentPassword: user1Details.password,
            newPassword: "password",
            confirmNewPassword: "different",
          },
        },
        token,
      );

      const user = responseBody.data?.changePassword;

      assert.strictEqual(user, null, "User should be null");
      assertValidationError(responseBody, "Passwords do not match");
    });

    void test("succeeds changing password", async () => {
      const responseBody = await query<
        { changePassword: User },
        { input: ChangePasswordInput }
      >(
        CHANGE_PASSWORD,
        {
          input: {
            currentPassword: user1Details.password,
            newPassword: "newpassword",
            confirmNewPassword: "newpassword",
          },
        },
        token,
      );

      const user = responseBody.data?.changePassword;

      assertUserEquality(user, expectedUser1);
    });
  });
});
