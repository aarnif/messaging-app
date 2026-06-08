import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { ContactLookupBy } from "~/types/graphql.js";
import {
  expectedContact1,
  expectedContact2,
  expectedUser2,
  expectedUser3,
  privateChatDetails,
  user1Details,
  user1Input,
  user2Details,
  user2Input,
  user3Details,
  user3Input,
} from "./helpers/data.js";
import {
  addContacts,
  allContactsByUser,
  assertContactEquality,
  assertError,
  assertUserEquality,
  contactsWithoutPrivateChat,
  createChat,
  createUser,
  findContact,
  isBlockedByUser,
  login,
  nonContactUsers,
  removeContact,
  toggleBlockContact,
} from "./helpers/funcs.js";
import { describeGraphQLSuite } from "./helpers/setup.js";

describeGraphQLSuite("Contacts", () => {
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

    assert.ok(user1LoginBody.data, "User1 login token value should be defined");
    user1Token = user1LoginBody.data.login.value;

    const user2LoginBody = await login({
      username: user2Details.username,
      password: user2Details.password,
    });

    assert.ok(user2LoginBody.data, "User2 login token should be defined");
    user2Token = user2LoginBody.data.login.value;
  });

  void describe("Add contacts", () => {
    void test("fails without authentication", async () => {
      const responseBody = await addContacts(
        [user2Details.id, user3Details.id],
        "",
      );

      const contacts = responseBody.data?.addContacts;

      assert.strictEqual(contacts, undefined, "Contacts should be undefined");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("succeeds with valid user IDs", async () => {
      const responseBody = await addContacts(
        [user2Details.id, user3Details.id],
        user1Token,
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
      const responseBody = await addContacts([user2Details.id], user1Token);

      const contact = responseBody.data?.addContacts[0];
      assert.ok(contact?.id, "Contact ID should be defined");
      contactId = contact.id;
    });

    void test("fails without authentication", async () => {
      const responseBody = await removeContact(contactId, "");

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent contact", async () => {
      const responseBody = await removeContact("999", user1Token);

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("succeeds with valid contact ID", async () => {
      const responseBody = await removeContact(contactId, user1Token);

      const contact = responseBody.data?.removeContact;

      assertContactEquality(contact, expectedContact1);
    });

    void test("fails when trying to remove same contact twice", async () => {
      await removeContact(contactId, user1Token);
      const responseBody = await removeContact(contactId, user1Token);

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });
  });

  void describe("Toggle block contact", () => {
    let contactId: string;

    beforeEach(async () => {
      const responseBody = await addContacts([user2Details.id], user1Token);

      const contact = responseBody.data?.addContacts[0];
      assert.ok(contact?.id, "Contact ID should be defined");
      contactId = contact.id;
    });

    void test("fails without authentication", async () => {
      const responseBody = await toggleBlockContact(contactId, "");

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent contact", async () => {
      const responseBody = await toggleBlockContact("999", user1Token);

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("succeeds blocking contact", async () => {
      const responseBody = await toggleBlockContact(contactId, user1Token);

      const contact = responseBody.data?.toggleBlockContact;

      assertContactEquality(contact, {
        ...expectedContact1,
        isBlocked: true,
      });
    });

    void test("succeeds unblocking contact", async () => {
      await toggleBlockContact(contactId, user1Token);
      const responseBody = await toggleBlockContact(contactId, user1Token);

      const contact = responseBody.data?.toggleBlockContact;

      assertContactEquality(contact, expectedContact1);
    });
  });

  void describe("Is blocked by user", () => {
    let contactId: string;
    beforeEach(async () => {
      const responseBody = await addContacts([user2Details.id], user1Token);

      const contact = responseBody.data?.addContacts[0];
      assert.ok(contact?.id, "Contact ID should be defined");
      contactId = contact.id;
      await addContacts([user1Details.id], user2Token);
    });

    void test("fails without authentication", async () => {
      const responseBody = await isBlockedByUser(user1Details.id, "");

      const isBlocked = responseBody.data;

      assert.strictEqual(isBlocked, null, "IsBlocked should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("returns false with non-existent contact", async () => {
      const responseBody = await isBlockedByUser("999", user2Token);

      const isBlocked = responseBody.data?.isBlockedByUser;

      assert.strictEqual(isBlocked, false, "IsBlocked should be false");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
      );
    });

    void test("returns false when not blocked", async () => {
      const responseBody = await isBlockedByUser(user1Details.id, user2Token);

      const isBlocked = responseBody.data?.isBlockedByUser;

      assert.strictEqual(isBlocked, false, "Should not be blocked");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
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
        "Should have no errors",
      );
    });
  });

  void describe("All contacts by user", () => {
    void test("fails without authentication", async () => {
      const responseBody = await allContactsByUser("", "");

      const contacts = responseBody.data?.allContactsByUser;

      assert.strictEqual(contacts, undefined, "Contacts should be undefined");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("returns empty array when no contacts exist", async () => {
      const responseBody = await allContactsByUser("", user1Token);

      const contacts = responseBody.data?.allContactsByUser;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 0, "Should have no contacts");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
      );
    });

    void test("returns all contacts when user has contacts", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await allContactsByUser("", user1Token);

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
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await allContactsByUser(
        user2Details.username,
        user1Token,
      );

      const contacts = responseBody.data?.allContactsByUser;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact1);
    });

    void test("filters contacts by name search", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await allContactsByUser(
        user2Details.name,
        user1Token,
      );

      const contacts = responseBody.data?.allContactsByUser;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, {
        ...expectedContact1,
        contactDetails: {
          ...expectedContact1.contactDetails,
          name: user2Details.name,
        },
      });
    });

    void test("returns empty array when search has no matches", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await allContactsByUser("nonexistent", user1Token);

      const contacts = responseBody.data?.allContactsByUser;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 0, "Should have no contacts");
    });

    void test("search is case insensitive", async () => {
      await addContacts([user2Details.id], user1Token);

      const responseBody = await allContactsByUser("USER2", user1Token);

      const contacts = responseBody.data?.allContactsByUser;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact1);
    });
  });

  void describe("Contacts without private chat", () => {
    void test("fails without authentication", async () => {
      const responseBody = await contactsWithoutPrivateChat("", "");

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.strictEqual(contacts, undefined, "Contacts should be undefined");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("returns empty array when no contacts exist", async () => {
      const responseBody = await contactsWithoutPrivateChat("", user1Token);

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 0, "Should have no contacts");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
      );
    });

    void test("returns all contacts without private chat when user has contacts", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);
      await createChat(privateChatDetails, user1Token);

      const responseBody = await contactsWithoutPrivateChat("", user1Token);

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact2);
    });

    void test("filters contacts by username search", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await contactsWithoutPrivateChat(
        user2Details.username,
        user1Token,
      );

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact1);
    });

    void test("filters contacts by name search", async () => {
      await addContacts([user2Details.id, user3Details.id], user1Token);

      const responseBody = await contactsWithoutPrivateChat(
        user2Details.name,
        user1Token,
      );

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, {
        ...expectedContact1,
        contactDetails: {
          ...expectedContact1.contactDetails,
          name: user2Details.name,
        },
      });
    });

    void test("returns empty array when search has no matches", async () => {
      await addContacts([user2Details.id], user1Token);
      await addContacts([user3Details.id], user1Token);

      const responseBody = await contactsWithoutPrivateChat(
        "nonexistent",
        user1Token,
      );

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 0, "Should have no contacts");
    });

    void test("search is case insensitive", async () => {
      await addContacts([user2Details.id], user1Token);

      const responseBody = await contactsWithoutPrivateChat(
        "USER2",
        user1Token,
      );

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact1);
    });
  });

  void describe("Find contact", () => {
    let token: string;
    let contactId: string;
    let userId: string;

    beforeEach(async () => {
      const loginBody = await login({
        username: user1Details.username,
        password: user1Details.password,
      });

      assert.ok(loginBody.data, "Login token value should be defined");
      token = loginBody.data.login.value;

      const responseBody = await addContacts([user2Details.id], user1Token);

      const contact = responseBody.data?.addContacts[0];
      assert.ok(contact?.id, "Contact ID should be defined");
      contactId = contact.id;
      userId = contact.contactDetails.id;
    });

    void test("fails without authentication", async () => {
      const responseBody = await findContact(
        {
          id: contactId,
          lookupBy: ContactLookupBy.Id,
        },
        "",
      );

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent contact ID", async () => {
      const responseBody = await findContact(
        {
          id: "999",
          lookupBy: ContactLookupBy.Id,
        },
        token,
      );

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("fails with non-existent user ID", async () => {
      const responseBody = await findContact(
        {
          id: "999",
          lookupBy: ContactLookupBy.UserId,
        },
        token,
      );

      const contact = responseBody.data;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("succeeds with valid contact ID", async () => {
      const responseBody = await findContact(
        {
          id: contactId,
          lookupBy: ContactLookupBy.Id,
        },
        token,
      );

      const contact = responseBody.data?.findContact;

      assertContactEquality(contact, expectedContact1);
    });

    void test("succeeds with valid user ID", async () => {
      const responseBody = await findContact(
        {
          id: userId,
          lookupBy: ContactLookupBy.UserId,
        },
        token,
      );

      const contact = responseBody.data?.findContact;

      assertContactEquality(contact, expectedContact1);
    });
  });

  void describe("Non-contact users", () => {
    void test("fails without authentication", async () => {
      const responseBody = await nonContactUsers("", "");

      const users = responseBody.data?.nonContactUsers;

      assert.strictEqual(users, undefined, "Users should be undefined");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("returns all non-contact users", async () => {
      const responseBody = await nonContactUsers("", user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 2, "Should have 2 non-contact users");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
      );
    });

    void test("excludes existing contacts", async () => {
      await addContacts([user2Details.id], user1Token);

      const responseBody = await nonContactUsers("", user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 1, "Should have 1 non-contact user");
      assertUserEquality(users[0], expectedUser3);
    });

    void test("filters users by username search", async () => {
      const responseBody = await nonContactUsers(
        user2Details.username,
        user1Token,
      );

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 1, "Should have 1 user");
      assertUserEquality(users[0], expectedUser2);
    });

    void test("filters users by name search", async () => {
      const responseBody = await nonContactUsers(user2Details.name, user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 1, "Should have 1 user");
      assertUserEquality(users[0], {
        ...expectedUser2,
        name: user2Details.name,
      });
    });

    void test("returns empty array when search has no matches", async () => {
      const responseBody = await nonContactUsers("nonexistent", user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 0, "Should have no users");
    });

    void test("search is case insensitive", async () => {
      const responseBody = await nonContactUsers("USER2", user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 1, "Should have 1 user");
      assertUserEquality(users[0], expectedUser2);
    });
  });
});
