import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import type { Contact } from "~/types/graphql";
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
  addContact,
  addContacts,
  allContactsByUser,
  assertContactEquality,
  assertError,
  assertUserEquality,
  contactsWithoutPrivateChat,
  createChat,
  createUser,
  editProfile,
  findContactById,
  findContactByUserId,
  isBlockedByUser,
  login,
  nonContactUsers,
  query,
} from "./helpers/funcs.js";
import { REMOVE_CONTACT, TOGGLE_BLOCK_CONTACT } from "./helpers/queries.js";
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

  void describe("Add contact", () => {
    void test("fails without authentication", async () => {
      const responseBody = await addContact(user1Details.id, "");

      const contact = responseBody.data?.addContact;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails when trying to add yourself as contact", async () => {
      const responseBody = await addContact(user1Details.id, user1Token);

      const contact = responseBody.data?.addContact;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(
        responseBody,
        "Cannot add yourself as a contact",
        "BAD_USER_INPUT",
      );
    });

    void test("succeeds with valid user ID", async () => {
      const responseBody = await addContact(user2Details.id, user1Token);

      const contact = responseBody.data?.addContact;

      assertContactEquality(contact, expectedContact1);
    });

    void test("fails when trying to add same contact twice", async () => {
      await addContact(user2Details.id, user1Token);
      const responseBody = await addContact(user2Details.id, user1Token);

      const contact = responseBody.data?.addContact;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact already exists", "BAD_USER_INPUT");
    });
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
      const responseBody = await addContact(user2Details.id, user1Token);

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
        user1Token,
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
      const responseBody = await addContact(user2Details.id, user1Token);

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
        user1Token,
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
      await query<{ toggleBlockContact: Contact }, { id: string }>(
        TOGGLE_BLOCK_CONTACT,
        { id: contactId },
        user1Token,
      );
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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

      const newName = "New Name";

      await editProfile(
        {
          name: newName,
          about: null,
          is24HourClock: true,
        },
        user2Token,
      );

      const responseBody = await allContactsByUser(newName, user1Token);

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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);
      await createChat(privateChatDetails, user1Token);

      const responseBody = await contactsWithoutPrivateChat("", user1Token);

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 1, "Should have 1 contact");

      const contact = contacts[0];

      assertContactEquality(contact, expectedContact2);
    });

    void test("filters contacts by username search", async () => {
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

      const newName = "New Name";

      await editProfile(
        {
          name: newName,
          about: null,
          is24HourClock: true,
        },
        user2Token,
      );

      const responseBody = await contactsWithoutPrivateChat(
        newName,
        user1Token,
      );

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
      await addContact(user2Details.id, user1Token);
      await addContact(user3Details.id, user1Token);

      const responseBody = await contactsWithoutPrivateChat(
        "nonexistent",
        user1Token,
      );

      const contacts = responseBody.data?.contactsWithoutPrivateChat;

      assert.ok(Array.isArray(contacts), "Contacts should be an array");
      assert.strictEqual(contacts.length, 0, "Should have no contacts");
    });

    void test("search is case insensitive", async () => {
      await addContact(user2Details.id, user1Token);

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
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent user ID", async () => {
      const responseBody = await findContactById("999", token);

      const contact = responseBody.data?.findContactById;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("succeeds with valid contact ID", async () => {
      const responseBody = await findContactById(contactId, token);

      const contact = responseBody.data?.findContactById;

      assertContactEquality(contact, expectedContact1);
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
      const responseBody = await findContactByUserId(user2Details.id, "");

      const contact = responseBody.data?.findContactByUserId;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent user ID", async () => {
      const responseBody = await findContactByUserId("999", token);

      const contact = responseBody.data?.findContactByUserId;

      assert.strictEqual(contact, null, "Contact should be null");
      assertError(responseBody, "Contact not found", "NOT_FOUND");
    });

    void test("succeeds with valid user ID", async () => {
      const responseBody = await findContactByUserId(user2Details.id, token);

      const contact = responseBody.data?.findContactByUserId;

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
      await addContact(user2Details.id, user1Token);

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
      const newName = "New Name";

      await editProfile(
        {
          name: newName,
          about: null,
          is24HourClock: true,
        },
        user2Token,
      );

      const responseBody = await nonContactUsers(newName, user1Token);

      const users = responseBody.data?.nonContactUsers;

      assert.ok(Array.isArray(users), "Users should be an array");
      assert.strictEqual(users.length, 1, "Should have 1 user");
      assertUserEquality(users[0], { ...expectedUser2, name: newName });
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
