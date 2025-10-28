import {
  ME,
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  FIND_CHAT_BY_ID,
  CONTACTS_WITHOUT_PRIVATE_CHAT,
  FIND_CONTACT_BY_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  IS_BLOCKED_BY_USER,
  NON_CONTACT_USERS,
} from "../graphql/queries";
import {
  ADD_CONTACTS,
  CREATE_USER,
  LOGIN,
  REMOVE_CONTACT,
  SEND_MESSAGE,
  TOGGLE_BLOCK_CONTACT,
} from "../graphql/mutations";
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
  SendMessageMutation,
  SendMessageMutationVariables,
  ContactsWithoutPrivateChatQuery,
  ContactsWithoutPrivateChatQueryVariables,
  FindContactByIdQuery,
  FindContactByIdQueryVariables,
  FindPrivateChatWithContactQuery,
  FindPrivateChatWithContactQueryVariables,
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables,
  RemoveContactMutation,
  RemoveContactMutationVariables,
  IsBlockedByUserQuery,
  IsBlockedByUserQueryVariables,
  NonContactUsersQuery,
  NonContactUsersQueryVariables,
  AddContactsMutation,
  AddContactsMutationVariables,
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

export const USER_FOUR_DETAILS = {
  ...USER_THREE_DETAILS,
  id: "4",
  name: "User4",
  username: "user4",
};

export const USER_FIVE_DETAILS = {
  ...USER_FOUR_DETAILS,
  id: "5",
  name: "User5",
  username: "user5",
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
      about: null,
      avatar: null,
      role: "admin",
    },
    {
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      about: null,
      avatar: null,
      role: "member",
    },
    {
      id: USER_THREE_DETAILS.id,
      username: USER_THREE_DETAILS.username,
      name: USER_THREE_DETAILS.name,
      about: null,
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
      content: `This is a chat message from ${USER_ONE_DETAILS.name}`,
      createdAt: 1759094100000,
    },
    {
      id: "2",
      sender: {
        id: USER_TWO_DETAILS.id,
        username: USER_TWO_DETAILS.username,
        name: USER_TWO_DETAILS.name,
        about: null,
        avatar: null,
      },
      content: `This is a chat message from ${USER_TWO_DETAILS.name}`,
      createdAt: 1759094100000 + 86400000,
    },
    {
      id: "3",
      sender: {
        id: USER_THREE_DETAILS.id,
        username: USER_THREE_DETAILS.username,
        name: USER_THREE_DETAILS.name,
        about: null,
        avatar: null,
      },
      content: `This is a chat message from ${USER_THREE_DETAILS.name}`,
      createdAt: 1759094100000 + 2 * 86400000,
    },
  ],
};

export const FIND_PRIVATE_CHAT_DETAILS = {
  id: "1",
  type: "private",
  name: "User2",
  description: null,
  avatar: null,
  members: [
    {
      id: USER_ONE_DETAILS.id,
      username: USER_ONE_DETAILS.username,
      name: USER_ONE_DETAILS.name,
      about: null,
      avatar: null,
      role: "admin",
    },
    {
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      about: null,
      avatar: null,
      role: "member",
    },
  ],
};

export const MESSAGE_DETAILS = {
  id: "4",
  sender: {
    id: USER_ONE_DETAILS.id,
    username: USER_ONE_DETAILS.username,
    name: USER_ONE_DETAILS.name,
    about: null,
    avatar: null,
  },
  content: "This is a new message.",
  createdAt: 1759094100000 + 3 * 86400000,
};

export const CONTACT_DETAILS = {
  id: "1",
  isBlocked: false,
  contactDetails: {
    id: USER_TWO_DETAILS.id,
    username: USER_TWO_DETAILS.username,
    name: USER_TWO_DETAILS.name,
    about: "Hi! My name is User 2!",
    avatar: null,
  },
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

export const currentUserMock = {
  id: USER_ONE_DETAILS.id,
  username: USER_ONE_DETAILS.username,
  name: USER_ONE_DETAILS.name,
  about: null,
  avatar: null,
  is24HourClock: true,
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
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      about: "Hi! My name is User 2!",
      avatar: null,
    },
  },
  {
    id: "2",
    isBlocked: false,
    contactDetails: {
      id: USER_THREE_DETAILS.id,
      username: USER_THREE_DETAILS.username,
      name: USER_THREE_DETAILS.name,
      about: "Hi! My name is User 3!",
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
  maxUsageCount: 2,
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
      id: "",
    },
  },
  result: {
    data: {
      findChatById: null,
    },
  },
};

export const sendMessage: MockLink.MockedResponse<
  SendMessageMutation,
  SendMessageMutationVariables
> = {
  request: {
    query: SEND_MESSAGE,
    variables: {
      input: {
        id: "1",
        content: MESSAGE_DETAILS.content,
      },
    },
  },
  result: {
    data: {
      sendMessage: {
        ...CHAT_DETAILS,
        messages: [
          ...CHAT_DETAILS.messages,
          {
            ...MESSAGE_DETAILS,
          },
        ],
      },
    },
  },
  maxUsageCount: 2,
};

export const NewPrivateChatDetails = {
  name: userContactsMock[0].contactDetails.name,
  description: null,
  members: [currentUserMock, userContactsMock[0].contactDetails],
  avatar: null,
};

export const NewGroupChatDetails = {
  name: "Group Chat",
  description: null,
  members: [
    currentUserMock,
    userContactsMock[0].contactDetails,
    userContactsMock[1].contactDetails,
  ],
  avatar: null,
};

export const contactsWithoutPrivateChats: MockLink.MockedResponse<
  ContactsWithoutPrivateChatQuery,
  ContactsWithoutPrivateChatQueryVariables
> = {
  request: {
    query: CONTACTS_WITHOUT_PRIVATE_CHAT,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      contactsWithoutPrivateChat: userContactsMock,
    },
  },
};

export const contactsWithoutPrivateChatsEmpty: MockLink.MockedResponse<
  ContactsWithoutPrivateChatQuery,
  ContactsWithoutPrivateChatQueryVariables
> = {
  request: {
    query: CONTACTS_WITHOUT_PRIVATE_CHAT,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      contactsWithoutPrivateChat: [],
    },
  },
};

export const findContactById: MockLink.MockedResponse<
  FindContactByIdQuery,
  FindContactByIdQueryVariables
> = {
  request: {
    query: FIND_CONTACT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      findContactById: CONTACT_DETAILS,
    },
  },
};

export const findContactByIdNull: MockLink.MockedResponse<
  FindContactByIdQuery,
  FindContactByIdQueryVariables
> = {
  request: {
    query: FIND_CONTACT_BY_ID,
    variables: {
      id: "999",
    },
  },
  result: {
    data: {
      findContactById: null,
    },
  },
};

export const findContactByIdBlocked: MockLink.MockedResponse<
  FindContactByIdQuery,
  FindContactByIdQueryVariables
> = {
  request: {
    query: FIND_CONTACT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      findContactById: {
        ...CONTACT_DETAILS,
        isBlocked: true,
      },
    },
  },
};

export const findPrivateChatWithContact: MockLink.MockedResponse<
  FindPrivateChatWithContactQuery,
  FindPrivateChatWithContactQueryVariables
> = {
  request: {
    query: FIND_PRIVATE_CHAT_WITH_CONTACT,
    variables: {
      id: USER_TWO_DETAILS.id,
    },
  },
  result: {
    data: {
      findPrivateChatWithContact: FIND_PRIVATE_CHAT_DETAILS,
    },
  },
};

export const findPrivateChatWithContactNull: MockLink.MockedResponse<
  FindPrivateChatWithContactQuery,
  FindPrivateChatWithContactQueryVariables
> = {
  request: {
    query: FIND_PRIVATE_CHAT_WITH_CONTACT,
    variables: {
      id: USER_TWO_DETAILS.id,
    },
  },
  result: {
    data: {
      findPrivateChatWithContact: null,
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

export const toggleBlockContactTrue: MockLink.MockedResponse<
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables
> = {
  request: {
    query: TOGGLE_BLOCK_CONTACT,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      toggleBlockContact: {
        ...CONTACT_DETAILS,
        isBlocked: true,
      },
    },
  },
};

export const toggleBlockContactFalse: MockLink.MockedResponse<
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables
> = {
  request: {
    query: TOGGLE_BLOCK_CONTACT,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      toggleBlockContact: {
        ...CONTACT_DETAILS,
        isBlocked: false,
      },
    },
  },
};

export const removeContact: MockLink.MockedResponse<
  RemoveContactMutation,
  RemoveContactMutationVariables
> = {
  request: {
    query: REMOVE_CONTACT,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      removeContact: CONTACT_DETAILS,
    },
  },
};

export const isBlockedByUserTrue: MockLink.MockedResponse<
  IsBlockedByUserQuery,
  IsBlockedByUserQueryVariables
> = {
  request: {
    query: IS_BLOCKED_BY_USER,
    variables: {
      id: USER_TWO_DETAILS.id,
    },
  },
  result: {
    data: {
      isBlockedByUser: true,
    },
  },
};

export const isBlockedByUserFalse: MockLink.MockedResponse<
  IsBlockedByUserQuery,
  IsBlockedByUserQueryVariables
> = {
  request: {
    query: IS_BLOCKED_BY_USER,
    variables: {
      id: USER_TWO_DETAILS.id,
    },
  },
  result: {
    data: {
      isBlockedByUser: false,
    },
  },
};

export const isBlockedByUserNull: MockLink.MockedResponse<
  IsBlockedByUserQuery,
  IsBlockedByUserQueryVariables
> = {
  request: {
    query: IS_BLOCKED_BY_USER,
    variables: {
      id: "999",
    },
  },
  result: {
    data: {
      isBlockedByUser: null,
    },
  },
};

export const nonContactUsersMock = [
  {
    id: USER_FOUR_DETAILS.id,
    username: USER_FOUR_DETAILS.username,
    name: USER_FOUR_DETAILS.name,
    about: "Hi! My name is User 4!",
    avatar: null,
  },
  {
    id: USER_FIVE_DETAILS.id,
    username: USER_FIVE_DETAILS.username,
    name: USER_FIVE_DETAILS.name,
    about: "Hi! My name is User 5!",
    avatar: null,
  },
];

export const nonContactUsers: MockLink.MockedResponse<
  NonContactUsersQuery,
  NonContactUsersQueryVariables
> = {
  request: {
    query: NON_CONTACT_USERS,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      nonContactUsers: nonContactUsersMock,
    },
  },
};

export const nonContactUsersEmpty: MockLink.MockedResponse<
  NonContactUsersQuery,
  NonContactUsersQueryVariables
> = {
  request: {
    query: NON_CONTACT_USERS,
    variables: {
      search: "",
    },
  },
  result: {
    data: {
      nonContactUsers: [],
    },
  },
};

export const ADDED_CONTACTS = [
  {
    id: "2",
    isBlocked: false,
    contactDetails: {
      id: USER_FOUR_DETAILS.id,
      username: USER_FOUR_DETAILS.username,
      name: USER_FOUR_DETAILS.name,
      about: "Hi! My name is User 4!",
      avatar: null,
    },
  },
  {
    id: "3",
    isBlocked: false,
    contactDetails: {
      id: USER_FIVE_DETAILS.id,
      username: USER_FIVE_DETAILS.username,
      name: USER_FIVE_DETAILS.name,
      about: "Hi! My name is User 5!",
      avatar: null,
    },
  },
];

export const addContacts: MockLink.MockedResponse<
  AddContactsMutation,
  AddContactsMutationVariables
> = {
  request: {
    query: ADD_CONTACTS,
    variables: {
      ids: nonContactUsersMock.map((user) => user.id),
    },
  },
  result: {
    data: {
      addContacts: ADDED_CONTACTS,
    },
  },
};

export const addContactsEmpty: MockLink.MockedResponse<
  AddContactsMutation,
  AddContactsMutationVariables
> = {
  request: {
    query: ADD_CONTACTS,
    variables: {
      ids: [],
    },
  },
  result: {
    data: {
      addContacts: [],
    },
  },
};

export const mockNavigate = vi.fn();

export const windowMockContent = {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)" ? true : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
};
