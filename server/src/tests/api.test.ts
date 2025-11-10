import type { ApolloServer, BaseContext } from "@apollo/server";
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
  expectedUser1,
  expectedUser2,
  expectedContact1,
  expectedContact2,
  privateChatDetails,
  groupChatDetails,
  expectedPrivateChat,
  expectedGroupChat,
} from "./helpers/data";
import {
  query,
  assertValidationError,
  assertError,
  assertUserEquality,
  assertContactEquality,
  assertChatEquality,
} from "./helpers/funcs";
import {
  COUNT_DOCUMENTS,
  ME,
  CREATE_USER,
  LOGIN,
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

const { id: _, name: _name1, ...user1Input } = user1Details;
const { id: _id, name: _name2, ...user2Input } = user2Details;
const { id: _id2, name: _name3, ...user3Input } = user3Details;

void describe("GraphQL API", () => {
  let server: ApolloServer<BaseContext>;

  before(async () => {
    ({ server } = await start());
  });

  beforeEach(async () => {
    await emptyDatabase();
    await createDatabase();
  });

  void test("returns document count from database", async () => {
    const responseBody = await query<{ countDocuments: number }, object>(
      COUNT_DOCUMENTS,
      {}
    );
    const count = responseBody.data?.countDocuments;
    assert.strictEqual(count, 0);
  });

  void describe("Users", () => {
    void describe("User creation", () => {
      void test("fails with username shorter than 3 characters", async () => {
        const responseBody = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, {
          input: {
            ...user1Input,
            username: "us",
          },
        });

        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assertValidationError(
          responseBody,
          "Username must be at least 3 characters long"
        );
      });

      void test("fails with password shorter than 6 characters", async () => {
        const responseBody = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, {
          input: {
            ...user1Input,
            password: "short",
          },
        });
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assertValidationError(
          responseBody,
          "Password must be at least 6 characters long"
        );
      });

      void test("fails when passwords do not match", async () => {
        const responseBody = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, {
          input: {
            ...user1Input,
            confirmPassword: "passwor",
          },
        });
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assertValidationError(responseBody, "Passwords do not match");
      });

      void test("fails if user already exists", async () => {
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
        const responseBody = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, { input: user1Input });
        const user = responseBody.data?.createUser;

        assert.strictEqual(user, null, "User should be null");
        assertError(responseBody, "Username already exists", "BAD_USER_INPUT");
      });

      void test("succeeds with valid input", async () => {
        const responseBody = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, { input: user1Input });
        const user = responseBody.data?.createUser;

        assertUserEquality(user, expectedUser1);
      });
    });

    void describe("User login", () => {
      beforeEach(async () => {
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
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
          "BAD_USER_INPUT"
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
          "BAD_USER_INPUT"
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
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
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
          true
        );
        const user = responseBody.data?.me;

        assert.strictEqual(user, undefined, "User should be undefined");
        assertError(
          responseBody,
          "Context creation failed: jwt malformed",
          "INTERNAL_SERVER_ERROR"
        );
      });
    });

    void describe("Find user by ID", () => {
      let token: string;
      let user2Id: string;

      beforeEach(async () => {
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
        const user2Body = await query<
          { createUser: User },
          { input: CreateUserInput }
        >(CREATE_USER, { input: user2Input });
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
        const responseBody = await query<
          { findUserById: User },
          { id: string }
        >(FIND_USER_BY_ID, { id: user2Id }, "");

        const user = responseBody.data?.findUserById;

        assert.strictEqual(user, null, "User should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const responseBody = await query<
          { findUserById: User },
          { id: string }
        >(FIND_USER_BY_ID, { id: "999" }, token);

        const user = responseBody.data?.findUserById;

        assert.strictEqual(user, null, "User should be null");
        assertError(responseBody, "User not found", "NOT_FOUND");
      });

      void test("succeeds with valid user ID", async () => {
        const responseBody = await query<
          { findUserById: User },
          { id: string }
        >(FIND_USER_BY_ID, { id: user2Id }, token);

        const user = responseBody.data?.findUserById;

        assertUserEquality(user, expectedUser2);
      });
    });

    void describe("Edit profile", () => {
      let token: string;

      beforeEach(async () => {
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
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
          ""
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
          token
        );

        const user = responseBody.data?.editProfile;

        assert.strictEqual(user, null, "User should be null");
        assertValidationError(
          responseBody,
          "Name must be at least 3 characters long"
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
          token
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
          token
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
        await query<{ createUser: User }, { input: CreateUserInput }>(
          CREATE_USER,
          { input: user1Input }
        );
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
          ""
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
          token
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assertError(
          responseBody,
          "Current password does not match",
          "BAD_USER_INPUT"
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
          token
        );

        const user = responseBody.data?.changePassword;

        assert.strictEqual(user, null, "User should be null");
        assertValidationError(
          responseBody,
          "Password must be at least 6 characters long"
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
          token
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
          token
        );

        const user = responseBody.data?.changePassword;

        assertUserEquality(user, expectedUser1);
      });
    });
  });

  void describe("Contacts", () => {
    let user1Token: string;
    let user2Token: string;

    beforeEach(async () => {
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user1Input }
      );
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user2Input }
      );
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user3Input }
      );

      const user1LoginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user1Details.username,
          password: user1Details.password,
        },
      });

      assert.ok(
        user1LoginBody.data,
        "User1 login token value should be defined"
      );
      user1Token = user1LoginBody.data.login.value;

      const user2LoginBody = await query<
        { login: { value: string } },
        { input: LoginInput }
      >(LOGIN, {
        input: {
          username: user2Details.username,
          password: user2Details.password,
        },
      });

      assert.ok(user2LoginBody.data, "User2 login token should be defined");
      user2Token = user2LoginBody.data.login.value;
    });

    void describe("Add contact", () => {
      void test("fails without authentication", async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user1Details.id }, "");

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails when trying to add yourself as contact", async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user1Details.id }, user1Token);

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(
          responseBody,
          "Cannot add yourself as a contact",
          "BAD_USER_INPUT"
        );
      });

      void test("succeeds with valid user ID", async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;

        assertContactEquality(contact, expectedContact1);
      });

      void test("fails when trying to add same contact twice", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact already exists", "BAD_USER_INPUT");
      });
    });

    void describe("Add contacts", () => {
      void test("fails without authentication", async () => {
        const responseBody = await query<
          { addContacts: Contact[] },
          { ids: string[] }
        >(ADD_CONTACTS, { ids: [user2Details.id, user3Details.id] }, "");

        const contacts = responseBody.data?.addContacts;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("succeeds with valid user IDs", async () => {
        const responseBody = await query<
          { addContacts: Contact[] },
          { ids: string[] }
        >(
          ADD_CONTACTS,
          { ids: [user2Details.id, user3Details.id] },
          user1Token
        );

        const contacts = responseBody.data?.addContacts;

        assert.ok(contacts, "Contacts should be defined");
        assert.strictEqual(contacts.length, 2, "Should have 2 contacts");

        const expectedContacts = [expectedContact1, expectedContact2];

        contacts.forEach((contact, index) => {
          const expected = expectedContacts[index];
          assertContactEquality(contact, expected);
        });
      });
    });

    void describe("Remove contact", () => {
      let contactId: string;
      beforeEach(async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { removeContact: Contact },
          { id: string }
        >(REMOVE_CONTACT, { id: contactId }, "");

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await query<
          { removeContact: Contact },
          { id: string }
        >(REMOVE_CONTACT, { id: "999" }, user1Token);

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });

      void test("succeeds with valid contact ID", async () => {
        const responseBody = await query<
          { removeContact: Contact },
          { id: string }
        >(REMOVE_CONTACT, { id: contactId }, user1Token);

        const contact = responseBody.data?.removeContact;

        assertContactEquality(contact, expectedContact1);
      });

      void test("fails when trying to remove same contact twice", async () => {
        await query<{ removeContact: Contact }, { id: string }>(
          REMOVE_CONTACT,
          { id: contactId },
          user1Token
        );
        const responseBody = await query<
          { removeContact: Contact },
          { id: string }
        >(REMOVE_CONTACT, { id: contactId }, user1Token);

        const contact = responseBody.data?.removeContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });
    });

    void describe("Toggle block contact", () => {
      let contactId: string;

      beforeEach(async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { toggleBlockContact: Contact },
          { id: string }
        >(TOGGLE_BLOCK_CONTACT, { id: contactId }, "");

        const contact = responseBody.data?.toggleBlockContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await query<
          { toggleBlockContact: Contact },
          { id: string }
        >(TOGGLE_BLOCK_CONTACT, { id: "999" }, user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });

      void test("succeeds blocking contact", async () => {
        const responseBody = await query<
          { toggleBlockContact: Contact },
          { id: string }
        >(TOGGLE_BLOCK_CONTACT, { id: contactId }, user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assertContactEquality(contact, {
          ...expectedContact1,
          isBlocked: true,
        });
      });

      void test("succeeds unblocking contact", async () => {
        await query<{ toggleBlockContact: Contact }, { id: string }>(
          TOGGLE_BLOCK_CONTACT,
          { id: contactId },
          user1Token
        );
        const responseBody = await query<
          { toggleBlockContact: Contact },
          { id: string }
        >(TOGGLE_BLOCK_CONTACT, { id: contactId }, user1Token);

        const contact = responseBody.data?.toggleBlockContact;

        assertContactEquality(contact, expectedContact1);
      });
    });

    void describe("Is blocked by user", () => {
      let contactId: string;
      beforeEach(async () => {
        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user1Details.id },
          user2Token
        );
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { isBlockedByUser: boolean },
          { id: string }
        >(IS_BLOCKED_BY_USER, { id: user1Details.id }, "");

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, null, "IsBlocked should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent contact", async () => {
        const responseBody = await query<
          { isBlockedByUser: boolean },
          { id: string }
        >(IS_BLOCKED_BY_USER, { id: "999" }, user2Token);

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, null, "IsBlocked should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });

      void test("returns false when not blocked", async () => {
        const responseBody = await query<
          { isBlockedByUser: boolean },
          { id: string }
        >(IS_BLOCKED_BY_USER, { id: user1Details.id }, user2Token);

        const isBlocked = responseBody.data?.isBlockedByUser;

        assert.strictEqual(isBlocked, false, "Should not be blocked");
        assert.strictEqual(
          responseBody.errors,
          undefined,
          "Should have no errors"
        );
      });

      void test("returns true when blocked", async () => {
        await query<{ toggleBlockContact: Contact }, { id: string }>(
          TOGGLE_BLOCK_CONTACT,
          { id: contactId },
          user1Token
        );
        const responseBody = await query<
          { isBlockedByUser: boolean },
          { id: string }
        >(IS_BLOCKED_BY_USER, { id: user1Details.id }, user2Token);

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
        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, {}, "");

        const contacts = responseBody.data?.allContactsByUser;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("returns empty array when no contacts exist", async () => {
        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, {}, user1Token);

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
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, {}, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 2, "Should have 2 contacts");

        const expectedContacts = [expectedContact1, expectedContact2];

        contacts.forEach((contact, index) => {
          const expected = expectedContacts[index];
          assertContactEquality(contact, expected);
        });
      });

      void test("filters contacts by username search", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, { search: user2Details.username }, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, expectedContact1);
      });

      void test("filters contacts by name search", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const newName = "New Name";

        await query<{ editProfile: User }, { input: EditProfileInput }>(
          EDIT_PROFILE,
          {
            input: {
              name: newName,
              about: null,
              is24HourClock: true,
            },
          },
          user2Token
        );

        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, { search: newName }, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, {
          ...expectedContact1,
          contactDetails: { ...expectedContact1.contactDetails, name: newName },
        });
      });

      void test("returns empty array when search has no matches", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, { search: "nonexistent" }, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
      });

      void test("search is case insensitive", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );

        const responseBody = await query<
          { allContactsByUser: Contact[] },
          { search?: string }
        >(ALL_CONTACTS_BY_USER, { search: "USER2" }, user1Token);

        const contacts = responseBody.data?.allContactsByUser;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, expectedContact1);
      });
    });

    void describe("Contacts without private chat", () => {
      void test("fails without authentication", async () => {
        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, {}, "");

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.strictEqual(contacts, undefined, "Contacts should be undefined");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("returns empty array when no contacts exist", async () => {
        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, {}, user1Token);

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
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: privateChatDetails },
          user1Token
        );

        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, {}, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, expectedContact2);
      });

      void test("filters contacts by username search", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(
          CONTACTS_WITHOUT_PRIVATE_CHAT,
          { search: user2Details.username },
          user1Token
        );

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, expectedContact1);
      });

      void test("filters contacts by name search", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const newName = "New Name";

        await query<{ editProfile: User }, { input: EditProfileInput }>(
          EDIT_PROFILE,
          {
            input: {
              name: newName,
              about: null,
              is24HourClock: true,
            },
          },
          user2Token
        );

        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, { search: newName }, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, {
          ...expectedContact1,
          contactDetails: { ...expectedContact1.contactDetails, name: newName },
        });
      });

      void test("returns empty array when search has no matches", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user3Details.id },
          user1Token
        );

        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, { search: "nonexistent" }, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 0, "Should have no contacts");
      });

      void test("search is case insensitive", async () => {
        await query<{ addContact: Contact }, { id: string }>(
          ADD_CONTACT,
          { id: user2Details.id },
          user1Token
        );

        const responseBody = await query<
          { contactsWithoutPrivateChat: Contact[] },
          { search?: string }
        >(CONTACTS_WITHOUT_PRIVATE_CHAT, { search: "USER2" }, user1Token);

        const contacts = responseBody.data?.contactsWithoutPrivateChat;

        assert.ok(Array.isArray(contacts), "Contacts should be an array");
        assert.strictEqual(contacts.length, 1, "Should have 1 contact");

        const contact = contacts[0];

        assertContactEquality(contact, expectedContact1);
      });
    });

    void describe("Find contact by ID", () => {
      let token: string;
      let contactId: string;

      beforeEach(async () => {
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

        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact?.id, "Contact ID should be defined");
        contactId = contact.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { findContactById: Contact },
          { id: string }
        >(FIND_CONTACT_BY_ID, { id: contactId }, "");

        const contact = responseBody.data?.findContactById;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const responseBody = await query<
          { findContactById: Contact },
          { id: string }
        >(FIND_CONTACT_BY_ID, { id: "999" }, token);

        const contact = responseBody.data?.findContactById;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });

      void test("succeeds with valid contact ID", async () => {
        const responseBody = await query<
          { findContactById: Contact },
          { id: string }
        >(FIND_CONTACT_BY_ID, { id: contactId }, token);

        const contact = responseBody.data?.findContactById;

        assertContactEquality(contact, expectedContact1);
      });
    });

    void describe("Find contact by user ID", () => {
      let token: string;

      beforeEach(async () => {
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

        const responseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, user1Token);

        const contact = responseBody.data?.addContact;
        assert.ok(contact, "Contact should be defined");
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          {
            findContactByUserId: Contact;
          },
          { id: string }
        >(FIND_CONTACT_BY_USER_ID, { id: user2Details.id }, "");

        const contact = responseBody.data?.findContactByUserId;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent user ID", async () => {
        const responseBody = await query<
          {
            findContactByUserId: Contact;
          },
          { id: string }
        >(FIND_CONTACT_BY_USER_ID, { id: "999" }, token);

        const contact = responseBody.data?.findContactByUserId;

        assert.strictEqual(contact, null, "Contact should be null");
        assertError(responseBody, "Contact not found", "NOT_FOUND");
      });

      void test("succeeds with valid user ID", async () => {
        const responseBody = await query<
          {
            findContactByUserId: Contact;
          },
          { id: string }
        >(FIND_CONTACT_BY_USER_ID, { id: user2Details.id }, token);

        const contact = responseBody.data?.findContactByUserId;

        assertContactEquality(contact, expectedContact1);
      });
    });
  });

  void describe("Chats", () => {
    let token: string;

    beforeEach(async () => {
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user1Input }
      );
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user2Input }
      );
      await query<{ createUser: User }, { input: CreateUserInput }>(
        CREATE_USER,
        { input: user3Input }
      );

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

    void describe("Create chat", () => {
      void test("fails without authentication", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: privateChatDetails }, "");

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with empty initial message", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(
          CREATE_CHAT,
          {
            input: {
              ...privateChatDetails,
              initialMessage: "",
            },
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(responseBody, "Message content cannot be empty");
      });

      void test("fails with group chat without name", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(
          CREATE_CHAT,
          {
            input: {
              ...groupChatDetails,
              name: "",
            },
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(
          responseBody,
          "Group chat name must be at least 3 characters long"
        );
      });

      void test("fails with group chat name shorter than 3 characters", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(
          CREATE_CHAT,
          {
            input: {
              ...groupChatDetails,
              name: "te",
            },
          },
          token
        );

        const chat = responseBody.data?.createChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(
          responseBody,
          "Group chat name must be at least 3 characters long"
        );
      });

      void test("succeeds creating private chat", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: privateChatDetails }, token);

        const chat = responseBody.data?.createChat;

        assertChatEquality(chat, expectedPrivateChat);
      });

      void test("succeeds creating group chat", async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: groupChatDetails }, token);

        const chat = responseBody.data?.createChat;

        assertChatEquality(chat, expectedGroupChat);
      });
    });

    void describe("Edit chat", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: groupChatDetails }, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "Updated Chat",
              description: "Updated description",
              members: [user2Details.id],
            },
          },
          ""
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with empty chat name", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "",
              description: "Updated description",
              members: [user2Details.id, user3Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(
          responseBody,
          "Group chat name must be at least 3 characters long"
        );
      });

      void test("fails with chat name shorter than 3 characters", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "AB",
              description: "Updated description",
              members: [user2Details.id, user3Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(
          responseBody,
          "Group chat name must be at least 3 characters long"
        );
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: "999",
              name: "Updated Chat",
              description: "Updated description",
              members: [user2Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Chat not found", "NOT_FOUND");
      });

      void test("succeeds updating chat name and description", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "Updated Group Chat",
              description: "Updated test description",
              members: [user2Details.id, user3Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assertChatEquality(chat, {
          ...expectedGroupChat,
          name: "Updated Group Chat",
          description: "Updated test description",
        });
      });

      void test("succeeds removing member from chat", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "Updated Group Chat",
              description: "Updated description",
              members: [user2Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assertChatEquality(chat, {
          ...expectedGroupChat,
          name: "Updated Group Chat",
          description: "Updated test description",
          members: expectedGroupChat.members.filter(
            (member) => member.id !== user3Details.id
          ),
        });
      });

      void test("succeeds with null description", async () => {
        const responseBody = await query<
          { editChat: Chat },
          { input: EditChatInput }
        >(
          EDIT_CHAT,
          {
            input: {
              id: chatId,
              name: "Chat with No Description",
              description: null,
              members: [user2Details.id, user3Details.id],
            },
          },
          token
        );

        const chat = responseBody.data?.editChat;

        assertChatEquality(chat, {
          ...expectedGroupChat,
          name: "Chat with No Description",
        });
      });
    });

    void describe("Delete chat", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: groupChatDetails }, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<{ deleteChat: Chat }, { id: string }>(
          DELETE_CHAT,
          { id: chatId },
          ""
        );

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await query<{ deleteChat: Chat }, { id: string }>(
          DELETE_CHAT,
          { id: "999" },
          token
        );

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Chat not found", "NOT_FOUND");
      });

      void test("succeeds deleting chat with valid ID", async () => {
        const responseBody = await query<{ deleteChat: Chat }, { id: string }>(
          DELETE_CHAT,
          { id: chatId },
          token
        );

        const chat = responseBody.data?.deleteChat;

        assertChatEquality(chat, expectedGroupChat);
      });

      void test("fails when trying to delete same chat twice", async () => {
        await query<{ deleteChat: Chat }, { id: string }>(
          DELETE_CHAT,
          { id: chatId },
          token
        );
        const responseBody = await query<{ deleteChat: Chat }, { id: string }>(
          DELETE_CHAT,
          { id: chatId },
          token
        );

        const chat = responseBody.data?.deleteChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Chat not found", "NOT_FOUND");
      });
    });

    void describe("Find chat by ID", () => {
      let chatId: string;

      beforeEach(async () => {
        const responseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: groupChatDetails }, token);
        assert.ok(
          responseBody.data?.createChat.id,
          "Chat ID should be defined"
        );
        chatId = responseBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { findChatById: Chat },
          { id: string }
        >(FIND_CHAT_BY_ID, { id: chatId }, "");

        const chat = responseBody.data?.findChatById;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with non-existent chat ID", async () => {
        const responseBody = await query<
          { findChatById: Chat },
          { id: string }
        >(FIND_CHAT_BY_ID, { id: "999" }, token);

        const chat = responseBody.data?.findChatById;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Chat not found", "NOT_FOUND");
      });

      void test("succeeds finding chat", async () => {
        const responseBody = await query<
          { findChatById: Chat },
          { id: string }
        >(FIND_CHAT_BY_ID, { id: chatId }, token);

        const chat = responseBody.data?.findChatById;

        assertChatEquality(chat, expectedGroupChat);
      });
    });

    void describe("Send message", () => {
      let chatId: string;

      beforeEach(async () => {
        const chatBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: privateChatDetails }, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { sendMessage: Chat },
          { input: SendMessageInput }
        >(
          SEND_MESSAGE,
          {
            input: {
              id: chatId,
              content: "Hello from unauthenticated user",
            },
          },
          ""
        );

        const chat = responseBody.data?.sendMessage;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("fails with empty message content", async () => {
        const responseBody = await query<
          { sendMessage: Chat },
          { input: SendMessageInput }
        >(
          SEND_MESSAGE,
          {
            input: {
              id: chatId,
              content: "",
            },
          },
          token
        );

        const chat = responseBody.data?.sendMessage;

        assert.strictEqual(chat, null, "Chat should be null");
        assertValidationError(responseBody, "Message content cannot be empty");
      });

      void test("succeeds sending message to chat", async () => {
        const messageContent = "Hello from chat!";
        const responseBody = await query<
          { sendMessage: Chat },
          { input: SendMessageInput }
        >(
          SEND_MESSAGE,
          {
            input: {
              id: chatId,
              content: messageContent,
            },
          },
          token
        );

        const chat = responseBody.data?.sendMessage;

        assertChatEquality(chat, {
          ...expectedPrivateChat,
          messages: expectedPrivateChat.messages.concat({
            id: "2",
            sender: expectedUser2,
            content: "Hello from chat!",
            createdAt: 1759094100000 + 86400000,
          }),
        });
      });
    });

    void describe("Leave chat", () => {
      let chatId: string;
      let token2: string;

      beforeEach(async () => {
        const chatBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: groupChatDetails }, token);
        assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
        chatId = chatBody.data.createChat.id;

        const loginResponseBody = await query<
          { login: { value: string } },
          { input: LoginInput }
        >(LOGIN, {
          input: {
            username: user2Details.username,
            password: user2Details.password,
          },
        });

        assert.ok(
          loginResponseBody.data,
          "User2 login token value should be defined"
        );
        token2 = loginResponseBody.data.login.value;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<{ leaveChat: Chat }, { id: string }>(
          LEAVE_CHAT,
          { id: chatId },
          ""
        );

        const chat = responseBody.data?.leaveChat;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("succeeds when member leaves group chat", async () => {
        const responseBody = await query<{ leaveChat: Chat }, { id: string }>(
          LEAVE_CHAT,
          { id: chatId },
          token2
        );

        const chat = responseBody.data?.leaveChat;

        assertChatEquality(chat, {
          ...expectedGroupChat,
          members: expectedGroupChat.members.filter(
            (member) => member.id !== user2Details.id
          ),
        });
      });
    });

    void describe("All chats by user", () => {
      void test("fails without authentication", async () => {
        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, {}, "");

        const chats = responseBody.data?.allChatsByUser;

        assert.strictEqual(chats, undefined, "Chats should be undefined");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("returns empty array when no chats exist", async () => {
        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, {}, token);

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
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: privateChatDetails },
          token
        );
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: groupChatDetails },
          token
        );

        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, {}, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 2, "Should have 2 chats");
      });

      void test("filters chats by name search", async () => {
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: privateChatDetails },
          token
        );
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: groupChatDetails },
          token
        );

        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, { search: groupChatDetails.name }, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });

      void test("filters chats by description search", async () => {
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: privateChatDetails },
          token
        );
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: groupChatDetails },
          token
        );

        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, { search: groupChatDetails.description }, token);

        const chats = responseBody.data?.allChatsByUser;

        assert.ok(Array.isArray(chats), "Chats should be an array");
        assert.strictEqual(chats.length, 1, "Should have 1 chat");

        const chat = chats[0];
        assert.ok(chat, "Chat should exist");
        assert.strictEqual(chat.name, groupChatDetails.name);
      });

      void test("search is case insensitive", async () => {
        await query<{ createChat: Chat }, { input: CreateChatInput }>(
          CREATE_CHAT,
          { input: groupChatDetails },
          token
        );

        const responseBody = await query<
          { allChatsByUser: Chat[] },
          { search?: string }
        >(ALL_CHATS_BY_USER, { search: "TEST" }, token);

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
        const contactResponseBody = await query<
          { addContact: Contact },
          { id: string }
        >(ADD_CONTACT, { id: user2Details.id }, token);

        assert.ok(
          contactResponseBody.data?.addContact.id,
          "Contact ID should be defined"
        );
        userId = contactResponseBody.data.addContact.contactDetails.id;

        const chatResponseBody = await query<
          { createChat: Chat },
          { input: CreateChatInput }
        >(CREATE_CHAT, { input: privateChatDetails }, token);
        assert.ok(
          chatResponseBody.data?.createChat.id,
          "Chat ID should be defined"
        );
        chatId = chatResponseBody.data.createChat.id;
      });

      void test("fails without authentication", async () => {
        const responseBody = await query<
          { findPrivateChatWithContact: Chat },
          { id: string }
        >(FIND_PRIVATE_CHAT_WITH_CONTACT, { id: userId }, "");

        const chat = responseBody.data?.findPrivateChatWithContact;

        assert.strictEqual(chat, null, "Chat should be null");
        assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
      });

      void test("returns null with non-existent chat ID", async () => {
        const responseBody = await query<
          { findPrivateChatWithContact: Chat },
          { id: string }
        >(FIND_PRIVATE_CHAT_WITH_CONTACT, { id: "999" }, token);

        const chat = responseBody.data?.findPrivateChatWithContact;

        assert.strictEqual(chat, null, "Chat should be null");
      });

      void test("succeeds finding chat", async () => {
        const responseBody = await query<
          { findPrivateChatWithContact: Chat },
          { id: string }
        >(FIND_PRIVATE_CHAT_WITH_CONTACT, { id: userId }, token);

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
