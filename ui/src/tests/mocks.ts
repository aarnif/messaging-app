import {
  ME,
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  FIND_CHAT_BY_ID,
} from "../graphql/queries";
import { CREATE_USER, LOGIN } from "../graphql/mutations";
import type { MockLink } from "@apollo/client/testing";
import type {
  MeQuery,
  MeQueryVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  LoginMutation,
  LoginMutationVariables,
  AllChatsByUserQuery,
  AllChatsByUserQueryVariables,
  AllContactsByUserQuery,
  AllContactsByUserQueryVariables,
  FindChatByIdQuery,
  FindChatByIdQueryVariables,
} from "../__generated__/graphql";
import { vi } from "vitest";

export const LOGIN_TOKEN = "fake-token-12345";

export const USER_ONE_DETAILS = {
  id: "1",
  name: "User1",
  username: "user1",
  password: "password",
  confirmPassword: "password",
};

export const USER_TWO_DETAILS = {
  ...USER_ONE_DETAILS,
  id: "2",
  name: "User2",
  username: "user2",
};

export const USER_THREE_DETAILS = {
  ...USER_TWO_DETAILS,
  id: "3",
  name: "User3",
  username: "user3",
};

export const CHAT_DETAILS = {
  id: "1",
  type: "group",
  name: "Test Chat 1",
  description: "This is a group chat.",
  avatar: null,
  members: [
    {
      id: USER_ONE_DETAILS.id,
      username: USER_ONE_DETAILS.username,
      name: USER_ONE_DETAILS.name,
      avatar: null,
      role: "admin",
    },
    {
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      avatar: null,
      role: "member",
    },
    {
      id: USER_THREE_DETAILS.id,
      username: USER_THREE_DETAILS.username,
      name: USER_THREE_DETAILS.name,
      avatar: null,
      role: "member",
    },
  ],
  messages: [
    {
      id: "1",
      sender: {
        id: USER_ONE_DETAILS.id,
        username: USER_ONE_DETAILS.username,
        name: USER_ONE_DETAILS.name,
        about: null,
        avatar: null,
      },
      content: "This is a chat message.",
      createdAt: "1759094100000",
    },
  ],
};

export const invalidUsername = {
  ...USER_ONE_DETAILS,
  username: "us",
};

export const invalidPassword = {
  ...USER_ONE_DETAILS,
  password: "pass",
  confirmPassword: "pass",
};

export const mismatchedPasswords = {
  ...USER_ONE_DETAILS,
  confirmPassword: "passwor",
};

const currentUserMock = {
  id: USER_ONE_DETAILS.id,
  username: USER_ONE_DETAILS.username,
  name: USER_ONE_DETAILS.name,
  about: null,
  avatar: null,
};

export const meMock: MockLink.MockedResponse<MeQuery, MeQueryVariables> = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: currentUserMock,
    },
  },
};

export const meNullMock: MockLink.MockedResponse<MeQuery, MeQueryVariables> = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: null,
    },
  },
};

export const createUserInput = {
  username: USER_ONE_DETAILS.username,
  password: USER_ONE_DETAILS.password,
  confirmPassword: USER_ONE_DETAILS.password,
};

export const createUserMock: MockLink.MockedResponse<
  CreateUserMutation,
  CreateUserMutationVariables
> = {
  request: {
    query: CREATE_USER,
    variables: {
      input: createUserInput,
    },
  },
  result: {
    data: {
      createUser: currentUserMock,
    },
  },
};

export const createUserErrorMock: MockLink.MockedResponse<
  CreateUserMutation,
  CreateUserMutationVariables
> = {
  request: {
    query: CREATE_USER,
    variables: {
      input: createUserInput,
    },
  },
  result: {
    errors: [
      {
        message: "Username already exists",
      },
    ],
    data: {
      createUser: null,
    },
  },
};

export const loginInput = {
  username: USER_ONE_DETAILS.username,
  password: USER_ONE_DETAILS.password,
};

export const invalidLoginPassword = loginInput.password.slice(0, -1);

export const loginMock: MockLink.MockedResponse<
  LoginMutation,
  LoginMutationVariables
> = {
  request: {
    query: LOGIN,
    variables: {
      input: loginInput,
    },
  },
  result: {
    data: {
      login: {
        value: LOGIN_TOKEN,
      },
    },
  },
};

export const loginErrorMock: MockLink.MockedResponse<
  LoginMutation,
  LoginMutationVariables
> = {
  request: {
    query: LOGIN,
    variables: {
      input: { ...loginInput, password: invalidLoginPassword },
    },
  },
  result: {
    errors: [
      {
        message: "Invalid username or password",
      },
    ],
    data: {
      login: null,
    },
  },
};

export const allChatsByUserEmpty: MockLink.MockedResponse<
  AllChatsByUserQuery,
  AllChatsByUserQueryVariables
> = {
  request: {
    query: ALL_CHATS_BY_USER,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      allChatsByUser: [],
    },
  },
};

export const userChatsMock = [
  {
    id: CHAT_DETAILS.id,
    name: CHAT_DETAILS.name,
    avatar: null,
    messages: CHAT_DETAILS.messages,
  },
];

export const allChatsByUser: MockLink.MockedResponse<
  AllChatsByUserQuery,
  AllChatsByUserQueryVariables
> = {
  request: {
    query: ALL_CHATS_BY_USER,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      allChatsByUser: userChatsMock,
    },
  },
};

export const allContactsByUserEmpty: MockLink.MockedResponse<
  AllContactsByUserQuery,
  AllContactsByUserQueryVariables
> = {
  request: {
    query: ALL_CONTACTS_BY_USER,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      allContactsByUser: [],
    },
  },
};

export const userContactsMock = [
  {
    id: "1",
    isBlocked: false,
    contactDetails: {
      id: "2",
      username: "user2",
      name: "User 2",
      about: "Hi! My name is User 2!",
      avatar: null,
    },
  },
];

export const allContactsByUser: MockLink.MockedResponse<
  AllContactsByUserQuery,
  AllContactsByUserQueryVariables
> = {
  request: {
    query: ALL_CONTACTS_BY_USER,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      allContactsByUser: userContactsMock,
    },
  },
};

export const findChatById: MockLink.MockedResponse<
  FindChatByIdQuery,
  FindChatByIdQueryVariables
> = {
  request: {
    query: FIND_CHAT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      findChatById: CHAT_DETAILS,
    },
  },
};

export const findChatByIdNull: MockLink.MockedResponse<
  FindChatByIdQuery,
  FindChatByIdQueryVariables
> = {
  request: {
    query: FIND_CHAT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      findChatById: null,
    },
  },
};

export const mockClient = {
  resetStore: vi.fn(),
  refetchQueries: vi.fn(),
  query: vi.fn(),
  cache: {
    updateQuery: vi.fn(),
    readQuery: vi.fn(),
    evict: vi.fn(),
    identify: vi.fn(),
  },
};

export const mockNavigate = vi.fn();
