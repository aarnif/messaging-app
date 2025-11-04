import request from "supertest";
import type { Response } from "supertest";
import type { HTTPGraphQLResponse } from "../../types/other";
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
} from "./queries";
import config from "config";
import assert from "node:assert";

const makeRequest = async <Variables>(
  query: string,
  variables: Variables,
  token: string = "",
  expectedStatusCode: number = 200
): Promise<Response> => {
  const response = request(config.SERVER_URL).post("/").send({
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

export const countDocuments = async (): Promise<Response> =>
  await makeRequest(COUNT_DOCUMENTS, {});

export const createUser = async (
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

export const login = async (
  input: LoginInput
): Promise<HTTPGraphQLResponse<{ login: { value: string } }>> => {
  const response = await makeRequest(LOGIN, { input });
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    login: { value: string };
  }>;
  return responseBody;
};

export const getMe = async (
  token?: string,
  expectedCode = 200
): Promise<Response> => await makeRequest(ME, {}, token, expectedCode);

export const addContact = async (
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

export const addContacts = async (
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

export const removeContact = async (
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

export const toggleBlockContact = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    toggleBlockContact: Contact;
  }>
> => {
  const response = await makeRequest(TOGGLE_BLOCK_CONTACT, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    toggleBlockContact: Contact;
  }>;

  return responseBody;
};

export const createChat = async (
  input: CreateChatInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    createChat: Chat;
  }>
> => {
  const response = await makeRequest(CREATE_CHAT, { input }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    createChat: Chat;
  }>;

  return responseBody;
};

export const editChat = async (
  input: EditChatInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    editChat: Chat;
  }>
> => {
  const response = await makeRequest(EDIT_CHAT, { input }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    editChat: Chat;
  }>;

  return responseBody;
};

export const deleteChat = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    deleteChat: Chat;
  }>
> => {
  const response = await makeRequest(DELETE_CHAT, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    deleteChat: Chat;
  }>;

  return responseBody;
};

export const sendMessage = async (
  input: SendMessageInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    sendMessage: Chat;
  }>
> => {
  const response = await makeRequest(SEND_MESSAGE, { input }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    sendMessage: Chat;
  }>;

  return responseBody;
};

export const leaveChat = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    leaveChat: Chat;
  }>
> => {
  const response = await makeRequest(LEAVE_CHAT, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    leaveChat: Chat;
  }>;

  return responseBody;
};

export const editProfile = async (
  input: EditProfileInput,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    editProfile: User;
  }>
> => {
  const response = await makeRequest(EDIT_PROFILE, { input }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    editProfile: User;
  }>;

  return responseBody;
};

export const findUserById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findUserById: User;
  }>
> => {
  const response = await makeRequest(FIND_USER_BY_ID, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findUserById: User;
  }>;

  return responseBody;
};

export const findChatById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findChatById: Chat;
  }>
> => {
  const response = await makeRequest(FIND_CHAT_BY_ID, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findChatById: Chat;
  }>;

  return responseBody;
};

export const isBlockedByUser = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    isBlockedByUser: boolean;
  }>
> => {
  const response = await makeRequest(IS_BLOCKED_BY_USER, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    isBlockedByUser: boolean;
  }>;

  return responseBody;
};

export const allContactsByUser = async (
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
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    allContactsByUser: Contact[];
  }>;

  return responseBody;
};

export const contactsWithoutPrivateChat = async (
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
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    contactsWithoutPrivateChat: Contact[];
  }>;

  return responseBody;
};

export const allChatsByUser = async (
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
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    allChatsByUser: Chat[];
  }>;

  return responseBody;
};

export const findContactById = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findContactById: Contact;
  }>
> => {
  const response = await makeRequest(FIND_CONTACT_BY_ID, { id }, token);
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findContactById: Contact;
  }>;

  return responseBody;
};

export const findPrivateChatWithContact = async (
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
  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findPrivateChatWithContact: Chat;
  }>;

  return responseBody;
};

export const changePassword = async (
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

export const findContactByUserId = async (
  id: string,
  token: string
): Promise<
  HTTPGraphQLResponse<{
    findContactByUserId: Contact;
  }>
> => {
  const response = await makeRequest(FIND_CONTACT_BY_USER_ID, { id }, token);

  assert.strictEqual(response.error, false);

  const responseBody = response.body as HTTPGraphQLResponse<{
    findContactByUserId: Contact;
  }>;

  return responseBody;
};
