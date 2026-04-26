import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import type { Chat, SendMessageInput } from "~/types/graphql";
import {
  expectedGroupChat,
  expectedPrivateChat,
  expectedUser2,
  groupChatDetails,
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
  allChatsByUser,
  assertChatEquality,
  assertError,
  assertValidationError,
  createChat,
  createUser,
  deleteChat,
  deleteMessage,
  editChat,
  editMessage,
  findChatById,
  login,
  query,
} from "./helpers/funcs.js";
import {
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  LEAVE_CHAT,
  MARK_CHAT_AS_READ,
  SEND_MESSAGE,
} from "./helpers/queries.js";
import { describeGraphQLSuite } from "./helpers/setup.js";

describeGraphQLSuite("Chats", () => {
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
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with empty initial message", async () => {
      const responseBody = await createChat(
        {
          ...privateChatDetails,
          initialMessage: "",
        },
        token,
      );

      const chat = responseBody.data?.createChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(responseBody, "Message content cannot be empty");
    });

    void test("fails with group chat without name", async () => {
      const responseBody = await createChat(
        {
          ...groupChatDetails,
          name: "",
        },
        token,
      );

      const chat = responseBody.data?.createChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(
        responseBody,
        "Group chat name must be at least 3 characters long",
      );
    });

    void test("fails with group chat name shorter than 3 characters", async () => {
      const responseBody = await createChat(
        {
          ...groupChatDetails,
          name: "te",
        },
        token,
      );

      const chat = responseBody.data?.createChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(
        responseBody,
        "Group chat name must be at least 3 characters long",
      );
    });

    void test("succeeds creating private chat", async () => {
      const responseBody = await createChat(privateChatDetails, token);

      const chat = responseBody.data?.createChat;

      assertChatEquality(chat, expectedPrivateChat);
    });

    void test("succeeds creating group chat", async () => {
      const responseBody = await createChat(groupChatDetails, token);

      const chat = responseBody.data?.createChat;

      assertChatEquality(chat, expectedGroupChat);
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
        "",
      );

      const chat = responseBody.data?.editChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with empty chat name", async () => {
      const responseBody = await editChat(
        {
          id: chatId,
          name: "",
          description: "Updated description",
          members: [user2Details.id, user3Details.id],
        },
        token,
      );

      const chat = responseBody.data?.editChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(
        responseBody,
        "Group chat name must be at least 3 characters long",
      );
    });

    void test("fails with chat name shorter than 3 characters", async () => {
      const responseBody = await editChat(
        {
          id: chatId,
          name: "AB",
          description: "Updated description",
          members: [user2Details.id, user3Details.id],
        },
        token,
      );

      const chat = responseBody.data?.editChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(
        responseBody,
        "Group chat name must be at least 3 characters long",
      );
    });

    void test("fails with non-existent chat ID", async () => {
      const responseBody = await editChat(
        {
          id: "999",
          name: "Updated Chat",
          description: "Updated description",
          members: [user2Details.id],
        },
        token,
      );

      const chat = responseBody.data?.editChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Chat not found", "NOT_FOUND");
    });

    void test("succeeds updating chat name and description", async () => {
      const responseBody = await editChat(
        {
          id: chatId,
          name: "Updated Group Chat",
          description: "Updated test description",
          members: [user2Details.id, user3Details.id],
        },
        token,
      );

      const chat = responseBody.data?.editChat;

      assertChatEquality(chat, {
        ...expectedGroupChat,
        name: "Updated Group Chat",
        description: "Updated test description",
      });
    });

    void test("succeeds removing member from chat", async () => {
      const responseBody = await editChat(
        {
          id: chatId,
          name: "Updated Group Chat",
          description: "Updated description",
          members: [user2Details.id],
        },
        token,
      );

      const chat = responseBody.data?.editChat;

      assertChatEquality(chat, {
        ...expectedGroupChat,
        name: "Updated Group Chat",
        description: "Updated test description",
        members: expectedGroupChat.members.filter(
          (member) => member.id !== user3Details.id,
        ),
        messages: expectedGroupChat.messages.concat({
          id: "2",
          chatId: "1",
          isNotification: true,
          isDeleted: false,
          sender: expectedUser2,
          content: "User2 was removed from the chat",
          createdAt: 1759094100000,
          updatedAt: 1759094100000,
        }),
      });
    });

    void test("succeeds with null description", async () => {
      const responseBody = await editChat(
        {
          id: chatId,
          name: "Chat with No Description",
          description: null,
          members: [user2Details.id, user3Details.id],
        },
        token,
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
      const chatBody = await createChat(groupChatDetails, token);
      assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
      chatId = chatBody.data.createChat.id;
    });

    void test("fails without authentication", async () => {
      const responseBody = await deleteChat(chatId, "");

      const chat = responseBody.data?.deleteChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent chat ID", async () => {
      const responseBody = await deleteChat("999", token);

      const chat = responseBody.data?.deleteChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Chat not found", "NOT_FOUND");
    });

    void test("succeeds deleting chat with valid ID", async () => {
      const responseBody = await deleteChat(chatId, token);

      const chat = responseBody.data?.deleteChat;

      assertChatEquality(chat, expectedGroupChat);
    });

    void test("fails when trying to delete same chat twice", async () => {
      await deleteChat(chatId, token);
      const responseBody = await deleteChat(chatId, token);

      const chat = responseBody.data?.deleteChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Chat not found", "NOT_FOUND");
    });
  });

  void describe("Find chat by ID", () => {
    let chatId: string;

    beforeEach(async () => {
      const responseBody = await createChat(groupChatDetails, token);
      assert.ok(responseBody.data?.createChat.id, "Chat ID should be defined");
      chatId = responseBody.data.createChat.id;
    });

    void test("fails without authentication", async () => {
      const responseBody = await findChatById(chatId, "");

      const chat = responseBody.data?.findChatById;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent chat ID", async () => {
      const responseBody = await findChatById("999", token);

      const chat = responseBody.data?.findChatById;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Chat not found", "NOT_FOUND");
    });

    void test("succeeds finding chat", async () => {
      const responseBody = await findChatById(chatId, token);

      const chat = responseBody.data?.findChatById;

      assertChatEquality(chat, expectedGroupChat);
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
      const responseBody = await query<
        { sendMessage: Chat },
        { input: SendMessageInput }
      >(
        SEND_MESSAGE,
        {
          input: {
            id: chatId,
            content: "Hello from unauthenticated user",
            isNotification: false,
          },
        },
        "",
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
            isNotification: false,
          },
        },
        token,
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
            isNotification: false,
          },
        },
        token,
      );

      const chat = responseBody.data?.sendMessage;

      assertChatEquality(chat, {
        ...expectedPrivateChat,
        members: [
          expectedPrivateChat.members[0],
          { ...expectedPrivateChat.members[1], unreadCount: 2 },
        ],
        messages: expectedPrivateChat.messages.concat({
          id: "2",
          chatId: "1",
          isNotification: false,
          isDeleted: false,
          sender: expectedUser2,
          content: "Hello from chat!",
          createdAt: 1759094100000 + 86400000,
          updatedAt: 1759094100000 + 86400000,
        }),
      });
    });
  });

  void describe("Edit message", () => {
    let messageId: string;
    let token2: string;

    beforeEach(async () => {
      const chatBody = await createChat(privateChatDetails, token);
      assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
      messageId = chatBody.data.createChat.messages[0].id;

      const loginResponseBody = await login({
        username: user2Details.username,
        password: user2Details.password,
      });

      assert.ok(
        loginResponseBody.data,
        "User2 login token value should be defined",
      );
      token2 = loginResponseBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await editMessage(
        {
          id: messageId,
          content: "Updated message",
        },
        "",
      );

      const chat = responseBody.data?.editMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with empty message content", async () => {
      const responseBody = await editMessage(
        {
          id: messageId,
          content: "",
        },
        token,
      );

      const chat = responseBody.data?.editMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertValidationError(responseBody, "Message content cannot be empty");
    });

    void test("fails with non-existent message ID", async () => {
      const responseBody = await editMessage(
        {
          id: "999",
          content: "Updated message",
        },
        token,
      );

      const chat = responseBody.data?.editMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Message not found", "NOT_FOUND");
    });

    void test("fails when trying to edit another user's message", async () => {
      const responseBody = await editMessage(
        {
          id: messageId,
          content: "Updated message",
        },
        token2,
      );

      const chat = responseBody.data?.editMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Message not found", "NOT_FOUND");
    });

    void test("succeeds editing own message", async () => {
      const updatedContent = "Updated message content";
      const responseBody = await editMessage(
        {
          id: messageId,
          content: updatedContent,
        },
        token,
      );

      const chat = responseBody.data?.editMessage;

      assertChatEquality(chat, {
        ...expectedPrivateChat,
        members: [
          expectedPrivateChat.members[0],
          { ...expectedPrivateChat.members[1], unreadCount: 1 },
        ],
        messages: [
          {
            ...expectedPrivateChat.messages[0],
            content: updatedContent,
          },
        ],
      });
    });
  });

  void describe("Delete message", () => {
    let messageId: string;
    let token2: string;

    beforeEach(async () => {
      const chatBody = await createChat(privateChatDetails, token);
      assert.ok(chatBody.data?.createChat.id, "Chat ID should be defined");
      messageId = chatBody.data.createChat.messages[0].id;

      const loginResponseBody = await login({
        username: user2Details.username,
        password: user2Details.password,
      });

      assert.ok(
        loginResponseBody.data,
        "User2 login token value should be defined",
      );
      token2 = loginResponseBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await deleteMessage(messageId, "");

      const chat = responseBody.data?.deleteMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("fails with non-existent message ID", async () => {
      const responseBody = await deleteMessage("999", token);

      const chat = responseBody.data?.deleteMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Message not found", "NOT_FOUND");
    });

    void test("fails when trying to delete another user's message", async () => {
      const responseBody = await deleteMessage(messageId, token2);

      const chat = responseBody.data?.deleteMessage;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Message not found", "NOT_FOUND");
    });

    void test("succeeds deleting own message", async () => {
      const responseBody = await deleteMessage(messageId, token);

      const chat = responseBody.data?.deleteMessage;

      assertChatEquality(chat, {
        ...expectedPrivateChat,
        members: [
          expectedPrivateChat.members[0],
          { ...expectedPrivateChat.members[1], unreadCount: 1 },
        ],
        messages: [
          {
            ...expectedPrivateChat.messages[0],
            content: "This message has been deleted",
            isDeleted: true,
          },
        ],
      });
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
        "User2 login token value should be defined",
      );
      token2 = loginResponseBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<{ leaveChat: Chat }, { id: string }>(
        LEAVE_CHAT,
        { id: chatId },
        "",
      );

      const chat = responseBody.data?.leaveChat;

      assert.strictEqual(chat, null, "Chat should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("succeeds when member leaves group chat", async () => {
      const responseBody = await query<{ leaveChat: Chat }, { id: string }>(
        LEAVE_CHAT,
        { id: chatId },
        token2,
      );

      const chat = responseBody.data?.leaveChat;

      assertChatEquality(chat, {
        ...expectedGroupChat,
        members: expectedGroupChat.members.filter(
          (member) => member.id !== user2Details.id,
        ),
        messages: expectedGroupChat.messages.concat({
          id: "2",
          chatId: "1",
          isNotification: true,
          isDeleted: false,
          sender: expectedUser2,
          content: "User2 left the chat",
          createdAt: 1759094100000,
          updatedAt: 1759094100000,
        }),
      });
    });
  });

  void describe("All chats by user", () => {
    void test("fails without authentication", async () => {
      const responseBody = await allChatsByUser("", "");

      const chats = responseBody.data?.allChatsByUser;

      assert.strictEqual(chats, undefined, "Chats should be undefined");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("returns empty array when no chats exist", async () => {
      const responseBody = await allChatsByUser("", token);

      const chats = responseBody.data?.allChatsByUser;

      assert.ok(Array.isArray(chats), "Chats should be an array");
      assert.strictEqual(chats.length, 0, "Should have no chats");
      assert.strictEqual(
        responseBody.errors,
        undefined,
        "Should have no errors",
      );
    });

    void test("returns all chats when user has chats", async () => {
      await createChat(privateChatDetails, token);
      await createChat(groupChatDetails, token);

      const responseBody = await allChatsByUser("", token);

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
        token,
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
        "Contact ID should be defined",
      );
      userId = contactResponseBody.data.addContact.contactDetails.id;

      const chatResponseBody = await createChat(privateChatDetails, token);
      assert.ok(
        chatResponseBody.data?.createChat.id,
        "Chat ID should be defined",
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

  void describe("Mark chat as read", () => {
    let chatId: string;
    let token2: string;

    beforeEach(async () => {
      const contactResponseBody = await addContact(user2Details.id, token);

      assert.ok(
        contactResponseBody.data?.addContact.id,
        "Contact ID should be defined",
      );

      const chatResponseBody = await createChat(privateChatDetails, token);
      assert.ok(
        chatResponseBody.data?.createChat.id,
        "Chat ID should be defined",
      );
      chatId = chatResponseBody.data.createChat.id;

      await query<{ sendMessage: Chat }, { input: SendMessageInput }>(
        SEND_MESSAGE,
        {
          input: {
            id: chatId,
            content: "Test message",
            isNotification: false,
          },
        },
        token,
      );

      const loginResponseBody = await login({
        username: user2Details.username,
        password: user2Details.password,
      });

      assert.ok(
        loginResponseBody.data,
        "User2 login token value should be defined",
      );
      token2 = loginResponseBody.data.login.value;
    });

    void test("fails without authentication", async () => {
      const responseBody = await query<
        { markChatAsRead: boolean },
        { id: string }
      >(MARK_CHAT_AS_READ, { id: chatId }, "");

      const result = responseBody.data?.markChatAsRead;

      assert.strictEqual(result, null, "Result should be null");
      assertError(responseBody, "Not authenticated", "UNAUTHENTICATED");
    });

    void test("succeeds marking chat as read", async () => {
      const getUnreadCount = async () => {
        const response = await allChatsByUser("", token2);

        const userChats = response.data?.allChatsByUser;
        assert.ok(userChats, "User chats should be defined");

        return userChats[0].unreadCount;
      };

      const unreadCountBefore = await getUnreadCount();
      assert.strictEqual(unreadCountBefore, 2);

      const responseBody = await query<
        { markChatAsRead: boolean },
        { id: string }
      >(MARK_CHAT_AS_READ, { id: chatId }, token2);

      const result = responseBody.data?.markChatAsRead;
      assert.strictEqual(result, true, "Result should be true");

      const unreadCountAfter = await getUnreadCount();
      assert.strictEqual(unreadCountAfter, 0);
    });
  });
});
