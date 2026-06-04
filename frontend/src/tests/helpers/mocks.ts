import type { MockLink } from "@apollo/client/testing";
import { vi } from "vitest";
import type {
  AddContactsMutation,
  AddContactsMutationVariables,
  AllChatsByUserQuery,
  AllChatsByUserQueryVariables,
  AllContactsByUserQuery,
  AllContactsByUserQueryVariables,
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
  ChatEditedSubscription,
  ChatEditedSubscriptionVariables,
  ChatItem,
  ChatItemCreatedSubscription,
  ChatItemCreatedSubscriptionVariables,
  ChatItemDeletedSubscription,
  ChatItemDeletedSubscriptionVariables,
  ChatItemLeftSubscription,
  ChatItemLeftSubscriptionVariables,
  ChatItemUpdatedSubscription,
  ChatItemUpdatedSubscriptionVariables,
  ChatMember,
  Contact,
  ContactsWithoutPrivateChatQuery,
  ContactsWithoutPrivateChatQueryVariables,
  CreateChatMutation,
  CreateChatMutationVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  DeleteChatMutation,
  DeleteChatMutationVariables,
  DeleteMessageMutation,
  DeleteMessageMutationVariables,
  EditChatMutation,
  EditChatMutationVariables,
  EditMessageMutation,
  EditMessageMutationVariables,
  EditProfileMutation,
  EditProfileMutationVariables,
  FindChatByIdQuery,
  FindChatByIdQueryVariables,
  FindContactByIdQuery,
  FindContactByIdQueryVariables,
  FindContactByUserIdQuery,
  FindContactByUserIdQueryVariables,
  FindPrivateChatWithContactQuery,
  FindPrivateChatWithContactQueryVariables,
  IsBlockedByUserQuery,
  IsBlockedByUserQueryVariables,
  LeaveChatMutation,
  LeaveChatMutationVariables,
  LoginMutation,
  LoginMutationVariables,
  MarkChatAsReadMutation,
  MarkChatAsReadMutationVariables,
  MeQuery,
  MeQueryVariables,
  Message,
  MessageDeletedSubscription,
  MessageDeletedSubscriptionVariables,
  MessageEditedSubscription,
  MessageEditedSubscriptionVariables,
  MessageSentSubscription,
  MessageSentSubscriptionVariables,
  NonContactUsersQuery,
  NonContactUsersQueryVariables,
  RemoveContactMutation,
  RemoveContactMutationVariables,
  SendMessageMutation,
  SendMessageMutationVariables,
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables,
  User,
} from "../../__generated__/graphql";
import {
  ADD_CONTACTS,
  CHANGE_PASSWORD,
  CREATE_CHAT,
  CREATE_USER,
  DELETE_CHAT,
  DELETE_MESSAGE,
  EDIT_CHAT,
  EDIT_MESSAGE,
  EDIT_PROFILE,
  LEAVE_CHAT,
  LOGIN,
  MARK_CHAT_AS_READ,
  REMOVE_CONTACT,
  SEND_MESSAGE,
  TOGGLE_BLOCK_CONTACT,
} from "../../graphql/mutations";
import {
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  CONTACTS_WITHOUT_PRIVATE_CHAT,
  FIND_CHAT_BY_ID,
  FIND_CONTACT_BY_ID,
  FIND_CONTACT_BY_USER_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  IS_BLOCKED_BY_USER,
  ME,
  NON_CONTACT_USERS,
} from "../../graphql/queries";
import {
  CHAT_EDITED,
  CHAT_ITEM_CREATED,
  CHAT_ITEM_DELETED,
  CHAT_ITEM_LEFT,
  CHAT_ITEM_UPDATED,
  MESSAGE_DELETED,
  MESSAGE_EDITED,
  MESSAGE_SENT,
} from "../../graphql/subscriptions";
import type { InputField } from "../../types";

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

const CHAT_MEMBERS: ChatMember[] = [
  {
    __typename: "ChatMember",
    id: USER_ONE_DETAILS.id,
    userId: USER_ONE_DETAILS.id,
    username: USER_ONE_DETAILS.username,
    name: USER_ONE_DETAILS.name,
    about: null,
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
    isAdmin: true,
    unreadCount: 0,
  },
  {
    __typename: "ChatMember",
    id: USER_TWO_DETAILS.id,
    userId: USER_TWO_DETAILS.id,
    username: USER_TWO_DETAILS.username,
    name: USER_TWO_DETAILS.name,
    about: null,
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
    isAdmin: false,
    unreadCount: 0,
  },
  {
    __typename: "ChatMember",
    id: USER_THREE_DETAILS.id,
    userId: USER_THREE_DETAILS.id,
    username: USER_THREE_DETAILS.username,
    name: USER_THREE_DETAILS.name,
    about: null,
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
    isAdmin: false,
    unreadCount: 0,
  },
];

const CHAT_MESSAGES: Message[] = [
  {
    __typename: "Message",
    id: "1",
    chatId: "1",
    isNotification: false,
    isDeleted: false,
    sender: {
      __typename: "User",
      id: USER_ONE_DETAILS.id,
      username: USER_ONE_DETAILS.username,
      name: USER_ONE_DETAILS.name,
      about: null,
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
    },
    content: `This is a chat message from ${USER_ONE_DETAILS.name}`,
    createdAt: 1759094100000,
    updatedAt: 1759094100000,
  },
  {
    __typename: "Message",
    id: "2",
    chatId: "1",
    isNotification: false,
    isDeleted: false,
    sender: {
      __typename: "User",
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      about: null,
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
    },
    content: `This is a chat message from ${USER_TWO_DETAILS.name}`,
    createdAt: 1759094100000 + 86400000,
    updatedAt: 1759094100000 + 86400000,
  },
  {
    __typename: "Message",
    id: "3",
    chatId: "1",
    isNotification: false,
    isDeleted: false,
    sender: {
      __typename: "User",
      id: USER_THREE_DETAILS.id,
      username: USER_THREE_DETAILS.username,
      name: USER_THREE_DETAILS.name,
      about: null,
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
    },
    content: `This is a chat message from ${USER_THREE_DETAILS.name}`,
    createdAt: 1759094100000 + 2 * 86400000,
    updatedAt: 1759094100000 + 2 * 86400000,
  },
];

export const GROUP_CHAT_DETAILS = {
  id: "1",
  isGroupChat: true,
  name: "Test Chat 1",
  description: "This is a group chat.",
  avatar: null,
  unreadCount: 0,
  userId: USER_ONE_DETAILS.id,
  members: CHAT_MEMBERS,
  messages: CHAT_MESSAGES,
};

export const PRIVATE_CHAT_DETAILS = {
  id: "1",
  isGroupChat: false,
  name: "User2",
  description: null,
  avatar: null,
  unreadCount: 0,
  userId: USER_ONE_DETAILS.id,
  members: CHAT_MEMBERS.slice(0, 2),
  messages: CHAT_MESSAGES.slice(0, 2),
};

export const MESSAGE_DETAILS: Message = {
  __typename: "Message",
  id: "4",
  chatId: GROUP_CHAT_DETAILS.id,
  isNotification: false,
  isDeleted: false,
  sender: {
    __typename: "User",
    id: USER_ONE_DETAILS.id,
    username: USER_ONE_DETAILS.username,
    name: USER_ONE_DETAILS.name,
    about: null,
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
  },
  content: "This is a new message.",
  createdAt: 1759094100000 + 3 * 86400000,
  updatedAt: 1759094100000 + 3 * 86400000,
};

export const CONTACT_DETAILS: Contact = {
  __typename: "Contact",
  id: "1",
  isBlocked: false,
  contactDetails: {
    __typename: "User",
    id: USER_TWO_DETAILS.id,
    username: USER_TWO_DETAILS.username,
    name: USER_TWO_DETAILS.name,
    about: "Hi! My name is User 2!",
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
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

export const currentChatItemAdminMock: User = {
  __typename: "User",
  id: USER_ONE_DETAILS.id,
  username: USER_ONE_DETAILS.username,
  name: USER_ONE_DETAILS.name,
  about: null,
  avatar: null,
  is24HourClock: true,
  isDarkMode: false,
};

export const currentChatItemMemberMock = {
  __typename: "User",
  id: USER_TWO_DETAILS.id,
  username: USER_TWO_DETAILS.username,
  name: USER_TWO_DETAILS.name,
  about: null,
  avatar: null,
  is24HourClock: true,
  isDarkMode: false,
};

export const meMock: MockLink.MockedResponse<MeQuery, MeQueryVariables> = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: currentChatItemAdminMock,
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
      createUser: currentChatItemAdminMock,
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
    data: null,
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
    data: null,
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

export const chatItemsMock: ChatItem[] = [
  {
    __typename: "ChatItem",
    id: GROUP_CHAT_DETAILS.id,
    isGroupChat: GROUP_CHAT_DETAILS.isGroupChat,
    name: GROUP_CHAT_DETAILS.name,
    avatar: null,
    unreadCount: GROUP_CHAT_DETAILS.unreadCount,
    members: GROUP_CHAT_DETAILS.members,
    latestMessage:
      GROUP_CHAT_DETAILS.messages[GROUP_CHAT_DETAILS.messages.length - 1],
  },
  {
    __typename: "ChatItem",
    id: "2",
    isGroupChat: GROUP_CHAT_DETAILS.isGroupChat,
    name: "Test Chat 2",
    avatar: null,
    unreadCount: 1,
    members: GROUP_CHAT_DETAILS.members,
    latestMessage:
      GROUP_CHAT_DETAILS.messages[GROUP_CHAT_DETAILS.messages.length - 1],
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
      allChatsByUser: chatItemsMock,
    },
  },
  maxUsageCount: 2,
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

export const userContactsMock: Contact[] = [
  {
    __typename: "Contact",
    id: "1",
    isBlocked: false,
    contactDetails: {
      __typename: "User",
      id: USER_TWO_DETAILS.id,
      username: USER_TWO_DETAILS.username,
      name: USER_TWO_DETAILS.name,
      about: "Hi! My name is User 2!",
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
    },
  },
  {
    __typename: "Contact",
    id: "2",
    isBlocked: false,
    contactDetails: {
      __typename: "User",
      id: USER_THREE_DETAILS.id,
      username: USER_THREE_DETAILS.username,
      name: USER_THREE_DETAILS.name,
      about: "Hi! My name is User 3!",
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
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

export const findChatByIdGroup: MockLink.MockedResponse<
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
      findChatById: GROUP_CHAT_DETAILS,
    },
  },
};

export const findChatByIdPrivate: MockLink.MockedResponse<
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
      findChatById: PRIVATE_CHAT_DETAILS,
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
    data: null,
  },
};

export const findChatByIdGroupWithNotification: MockLink.MockedResponse<
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
      findChatById: {
        ...GROUP_CHAT_DETAILS,
        messages: [
          ...GROUP_CHAT_DETAILS.messages,
          {
            __typename: "Message",
            id: "4",
            chatId: "1",
            isNotification: true,
            isDeleted: false,
            sender: {
              __typename: "User",
              id: USER_ONE_DETAILS.id,
              username: USER_ONE_DETAILS.username,
              name: USER_ONE_DETAILS.name,
              about: null,
              avatar: null,
              is24HourClock: true,
              isDarkMode: false,
            },
            content: `${USER_ONE_DETAILS.name} created the group`,
            createdAt: 1759094100000 + 3 * 86400000,
            updatedAt: 1759094100000 + 3 * 86400000,
          },
        ],
      },
    },
  },
};

export const findChatByIdGroupWithEditedMessage: MockLink.MockedResponse<
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
      findChatById: {
        ...GROUP_CHAT_DETAILS,
        messages: [
          {
            ...GROUP_CHAT_DETAILS.messages[0],
            createdAt: 1000000,
            updatedAt: 2000000,
            isDeleted: false,
          },
          ...GROUP_CHAT_DETAILS.messages.slice(1),
        ],
      },
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
        isNotification: false,
      },
    },
  },
  result: {
    data: {
      sendMessage: {
        ...GROUP_CHAT_DETAILS,
        messages: [
          ...GROUP_CHAT_DETAILS.messages,
          {
            ...MESSAGE_DETAILS,
          },
        ],
      },
    },
  },
  maxUsageCount: 2,
};

export const sendMessageError: MockLink.MockedResponse<
  SendMessageMutation,
  SendMessageMutationVariables
> = {
  request: {
    query: SEND_MESSAGE,
    variables: {
      input: {
        id: "1",
        content: MESSAGE_DETAILS.content,
        isNotification: false,
      },
    },
  },
  error: new Error("Failed to Send Message"),
};

export const NewPrivateChatDetails = {
  name: userContactsMock[0].contactDetails.name,
  description: null,
  members: [currentChatItemAdminMock, userContactsMock[0].contactDetails],
  avatar: null,
};

export const NewGroupChatDetails = {
  name: "Group Chat",
  description: null,
  members: [
    currentChatItemAdminMock,
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
    data: null,
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
      findPrivateChatWithContact: PRIVATE_CHAT_DETAILS,
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

export const toggleBlockContactTrueError: MockLink.MockedResponse<
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables
> = {
  request: {
    query: TOGGLE_BLOCK_CONTACT,
    variables: {
      id: "1",
    },
  },
  error: new Error("Failed to Block Contact"),
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

export const toggleBlockContactFalseError: MockLink.MockedResponse<
  ToggleBlockContactMutation,
  ToggleBlockContactMutationVariables
> = {
  request: {
    query: TOGGLE_BLOCK_CONTACT,
    variables: {
      id: "1",
    },
  },
  error: new Error("Failed to Unblock Contact"),
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

export const removeContactError: MockLink.MockedResponse<
  RemoveContactMutation,
  RemoveContactMutationVariables
> = {
  request: {
    query: REMOVE_CONTACT,
    variables: {
      id: "1",
    },
  },
  error: new Error("Failed to Remove Contact"),
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
    data: null,
  },
};

export const nonContactUsersMock: User[] = [
  {
    __typename: "User",
    id: USER_FOUR_DETAILS.id,
    username: USER_FOUR_DETAILS.username,
    name: USER_FOUR_DETAILS.name,
    about: "Hi! My name is User 4!",
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
  },
  {
    __typename: "User",
    id: USER_FIVE_DETAILS.id,
    username: USER_FIVE_DETAILS.username,
    name: USER_FIVE_DETAILS.name,
    about: "Hi! My name is User 5!",
    avatar: null,
    is24HourClock: true,
    isDarkMode: false,
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

export const ADDED_CONTACTS: Contact[] = [
  {
    __typename: "Contact",
    id: "2",
    isBlocked: false,
    contactDetails: {
      __typename: "User",
      id: USER_FOUR_DETAILS.id,
      username: USER_FOUR_DETAILS.username,
      name: USER_FOUR_DETAILS.name,
      about: "Hi! My name is User 4!",
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
    },
  },
  {
    __typename: "Contact",
    id: "3",
    isBlocked: false,
    contactDetails: {
      __typename: "User",
      id: USER_FIVE_DETAILS.id,
      username: USER_FIVE_DETAILS.username,
      name: USER_FIVE_DETAILS.name,
      about: "Hi! My name is User 5!",
      avatar: null,
      is24HourClock: true,
      isDarkMode: false,
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

export const addContactsError: MockLink.MockedResponse<
  AddContactsMutation,
  AddContactsMutationVariables
> = {
  request: {
    query: ADD_CONTACTS,
    variables: {
      ids: nonContactUsersMock.map((user) => user.id),
    },
  },
  error: new Error("Failed to Add Contacts"),
};

export const editProfileDarkModeOn: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: currentChatItemAdminMock.is24HourClock,
        isDarkMode: true,
      },
    },
  },
  result: {
    data: {
      editProfile: {
        ...currentChatItemAdminMock,
        isDarkMode: true,
      },
    },
  },
};

export const editProfileDarkModeOnError: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: currentChatItemAdminMock.is24HourClock,
        isDarkMode: true,
      },
    },
  },
  error: new Error("Failed to Save Settings"),
};

export const editProfileDarkModeOff: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: currentChatItemAdminMock.is24HourClock,
        isDarkMode: false,
      },
    },
  },
  result: {
    data: {
      editProfile: currentChatItemAdminMock,
    },
  },
};

export const editProfile24h: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: true,
        isDarkMode: false,
      },
    },
  },
  result: {
    data: {
      editProfile: currentChatItemAdminMock,
    },
  },
};

export const editProfile12h: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: false,
        isDarkMode: false,
      },
    },
  },
  result: {
    data: {
      editProfile: {
        ...currentChatItemAdminMock,
        is24HourClock: false,
        isDarkMode: false,
      },
    },
  },
};

export const editProfile12hError: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: currentChatItemAdminMock.name,
        about: currentChatItemAdminMock.about,
        is24HourClock: false,
        isDarkMode: false,
      },
    },
  },
  error: new Error("Failed to Save Settings"),
};

export const editProfileUpdate: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: "New Profile Name",
        about: "New About Text",
        is24HourClock: true,
        isDarkMode: false,
      },
    },
  },
  result: {
    data: {
      editProfile: currentChatItemAdminMock,
    },
  },
};

export const editProfileError: MockLink.MockedResponse<
  EditProfileMutation,
  EditProfileMutationVariables
> = {
  request: {
    query: EDIT_PROFILE,
    variables: {
      input: {
        name: "New Profile Name",
        about: "New About Text",
        is24HourClock: true,
        isDarkMode: false,
      },
    },
  },
  error: new Error("Failed to edit profile"),
};

export const changePassword: MockLink.MockedResponse<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
> = {
  request: {
    query: CHANGE_PASSWORD,
    variables: {
      input: {
        currentPassword: "password",
        newPassword: "newpassword",
        confirmNewPassword: "newpassword",
      },
    },
  },
  result: {
    data: {
      changePassword: currentChatItemAdminMock,
    },
  },
};

export const changePasswordError: MockLink.MockedResponse<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
> = {
  request: {
    query: CHANGE_PASSWORD,
    variables: {
      input: {
        currentPassword: "wrong",
        newPassword: "newpassword",
        confirmNewPassword: "newpassword",
      },
    },
  },
  error: new Error("Current password do not match"),
};

export const findContactByUserId: MockLink.MockedResponse<
  FindContactByUserIdQuery,
  FindContactByUserIdQueryVariables
> = {
  request: {
    query: FIND_CONTACT_BY_USER_ID,
    variables: {
      id: "2",
    },
  },
  result: {
    data: {
      findContactByUserId: CONTACT_DETAILS,
    },
  },
  maxUsageCount: 2,
};

export const editChat: MockLink.MockedResponse<
  EditChatMutation,
  EditChatMutationVariables
> = {
  request: {
    query: EDIT_CHAT,
    variables: {
      input: {
        id: "1",
        name: "New Name",
        description: "New Description",
        members: ["2", "3"],
      },
    },
  },
  result: {
    data: {
      editChat: {
        ...GROUP_CHAT_DETAILS,
        name: "New Name",
        description: "New Description",
      },
    },
  },
};

export const editChatError: MockLink.MockedResponse<
  EditChatMutation,
  EditChatMutationVariables
> = {
  request: {
    query: EDIT_CHAT,
    variables: {
      input: {
        id: "1",
        name: "New Name",
        description: "New Description",
        members: ["2", "3"],
      },
    },
  },
  error: new Error("Failed to Edit Chat"),
};

export const leaveChat: MockLink.MockedResponse<
  LeaveChatMutation,
  LeaveChatMutationVariables
> = {
  request: {
    query: LEAVE_CHAT,
    variables: {
      id: GROUP_CHAT_DETAILS.id,
    },
  },
  result: {
    data: {
      leaveChat: {
        ...GROUP_CHAT_DETAILS,
        members: GROUP_CHAT_DETAILS.members.filter(
          (member) => member.id !== "2",
        ),
      },
    },
  },
};

export const leaveChatError: MockLink.MockedResponse<
  LeaveChatMutation,
  LeaveChatMutationVariables
> = {
  request: {
    query: LEAVE_CHAT,
    variables: {
      id: GROUP_CHAT_DETAILS.id,
    },
  },
  error: new Error("Failed to Leave Chat"),
};

export const deleteChatError: MockLink.MockedResponse<
  DeleteChatMutation,
  DeleteChatMutationVariables
> = {
  request: {
    query: DELETE_CHAT,
    variables: {
      id: GROUP_CHAT_DETAILS.id,
    },
  },
  error: new Error("Failed to Delete Chat"),
};

export const deleteChat: MockLink.MockedResponse<
  DeleteChatMutation,
  DeleteChatMutationVariables
> = {
  request: {
    query: DELETE_CHAT,
    variables: {
      id: GROUP_CHAT_DETAILS.id,
    },
  },
  result: {
    data: {
      deleteChat: GROUP_CHAT_DETAILS,
    },
  },
};

export const createChat: MockLink.MockedResponse<
  CreateChatMutation,
  CreateChatMutationVariables
> = {
  request: {
    query: CREATE_CHAT,
    variables: {
      input: {
        name: "User2",
        members: ["2"],
        description: null,
        initialMessage: MESSAGE_DETAILS.content,
      },
    },
  },
  result: {
    data: {
      createChat: PRIVATE_CHAT_DETAILS,
    },
  },
};

export const createChatError: MockLink.MockedResponse<
  CreateChatMutation,
  CreateChatMutationVariables
> = {
  request: {
    query: CREATE_CHAT,
    variables: {
      input: {
        name: "User2",
        members: ["2"],
        description: null,
        initialMessage: MESSAGE_DETAILS.content,
      },
    },
  },
  error: new Error("Failed to Create Chat"),
};

export const markChatAsRead: MockLink.MockedResponse<
  MarkChatAsReadMutation,
  MarkChatAsReadMutationVariables
> = {
  request: {
    query: MARK_CHAT_AS_READ,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      markChatAsRead: true,
    },
  },
};

export const markChatAsReadError: MockLink.MockedResponse<
  MarkChatAsReadMutation,
  MarkChatAsReadMutationVariables
> = {
  request: {
    query: MARK_CHAT_AS_READ,
    variables: {
      id: "1",
    },
  },
  error: new Error("Failed to Mark Chat As Read"),
};

export const messageSentSubscription: MockLink.MockedResponse<
  MessageSentSubscription,
  MessageSentSubscriptionVariables
> = {
  request: {
    query: MESSAGE_SENT,
  },
  result: {
    data: {
      messageSent: MESSAGE_DETAILS,
    },
  },
};

export const messageEditedSubscription: MockLink.MockedResponse<
  MessageEditedSubscription,
  MessageEditedSubscriptionVariables
> = {
  request: {
    query: MESSAGE_EDITED,
  },
  result: {
    data: {
      messageEdited: MESSAGE_DETAILS,
    },
  },
};

export const messageDeletedSubscription: MockLink.MockedResponse<
  MessageDeletedSubscription,
  MessageDeletedSubscriptionVariables
> = {
  request: {
    query: MESSAGE_DELETED,
  },
  result: {
    data: {
      messageDeleted: { ...MESSAGE_DETAILS, isDeleted: true },
    },
  },
};

export const chatItemUpdatedSubscription: MockLink.MockedResponse<
  ChatItemUpdatedSubscription,
  ChatItemUpdatedSubscriptionVariables
> = {
  request: {
    query: CHAT_ITEM_UPDATED,
  },
  result: {
    data: {
      chatItemUpdated: {
        id: GROUP_CHAT_DETAILS.id,
        isGroupChat: GROUP_CHAT_DETAILS.isGroupChat,
        name: GROUP_CHAT_DETAILS.name,
        avatar: GROUP_CHAT_DETAILS.avatar,
        unreadCount: GROUP_CHAT_DETAILS.unreadCount,
        members: GROUP_CHAT_DETAILS.members,
        latestMessage: MESSAGE_DETAILS,
      },
    },
  },
};

export const chatItemCreatedSubscription: MockLink.MockedResponse<
  ChatItemCreatedSubscription,
  ChatItemCreatedSubscriptionVariables
> = {
  request: {
    query: CHAT_ITEM_CREATED,
  },
  result: {
    data: {
      chatItemCreated: {
        id: "2",
        userId: USER_TWO_DETAILS.id,
        isGroupChat: GROUP_CHAT_DETAILS.isGroupChat,
        name: GROUP_CHAT_DETAILS.name,
        avatar: GROUP_CHAT_DETAILS.avatar,
        unreadCount: GROUP_CHAT_DETAILS.unreadCount,
        members: GROUP_CHAT_DETAILS.members,
        latestMessage: MESSAGE_DETAILS,
      },
    },
  },
};

export const chatItemDeletedSubscription: MockLink.MockedResponse<
  ChatItemDeletedSubscription,
  ChatItemDeletedSubscriptionVariables
> = {
  request: {
    query: CHAT_ITEM_DELETED,
  },
  result: {
    data: { chatItemDeleted: GROUP_CHAT_DETAILS.id },
  },
};

export const chatItemLeftSubscription: MockLink.MockedResponse<
  ChatItemLeftSubscription,
  ChatItemLeftSubscriptionVariables
> = {
  request: {
    query: CHAT_ITEM_LEFT,
  },
  result: {
    data: {
      chatItemLeft: {
        chatId: GROUP_CHAT_DETAILS.id,
        memberId: USER_TWO_DETAILS.id,
      },
    },
  },
};

export const privateChatEditedSubscription: MockLink.MockedResponse<
  ChatEditedSubscription,
  ChatEditedSubscriptionVariables
> = {
  request: {
    query: CHAT_EDITED,
  },
  result: {
    data: {
      chatEdited: PRIVATE_CHAT_DETAILS,
    },
  },
};

export const groupChatEditedSubscription: MockLink.MockedResponse<
  ChatEditedSubscription,
  ChatEditedSubscriptionVariables
> = {
  request: {
    query: CHAT_EDITED,
  },
  result: {
    data: {
      chatEdited: GROUP_CHAT_DETAILS,
    },
  },
};

export const deleteMessage: MockLink.MockedResponse<
  DeleteMessageMutation,
  DeleteMessageMutationVariables
> = {
  request: {
    query: DELETE_MESSAGE,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      deleteMessage: {
        ...GROUP_CHAT_DETAILS,
        messages: GROUP_CHAT_DETAILS.messages.map((message) =>
          message.id === "1" ? { ...message, isDeleted: true } : message,
        ),
      },
    },
  },
};

export const deleteMessageError: MockLink.MockedResponse<
  DeleteMessageMutation,
  DeleteMessageMutationVariables
> = {
  request: {
    query: DELETE_MESSAGE,
    variables: {
      id: "1",
    },
  },
  error: new Error("Failed to Delete Message"),
};

export const editMessage: MockLink.MockedResponse<
  EditMessageMutation,
  EditMessageMutationVariables
> = {
  request: {
    query: EDIT_MESSAGE,
    variables: {
      input: {
        id: "1",
        content: "Edited message",
      },
    },
  },
  result: {
    data: {
      editMessage: {
        ...GROUP_CHAT_DETAILS,
        messages: GROUP_CHAT_DETAILS.messages.map((message) =>
          message.id === "1"
            ? { ...message, content: "Edited message" }
            : message,
        ),
      },
    },
  },
};

export const editMessageError: MockLink.MockedResponse<
  EditMessageMutation,
  EditMessageMutationVariables
> = {
  request: {
    query: EDIT_MESSAGE,
    variables: {
      input: {
        id: "1",
        content: "Edited message",
      },
    },
  },
  error: new Error("Failed to Edit Message"),
};

export const mockNavigate = vi.fn();

export const mockMatch = vi.fn();

export const mockUseOutletContext = vi.fn();

export const mockSetToken = vi.fn();

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

export const mockChatsSearchWord: InputField = {
  name: "search-chats",
  type: "text",
  value: "",
  placeholder: "Search by title or description...",
  setValue: vi.fn(),
  onChange: vi.fn(),
  onReset: vi.fn(),
};
