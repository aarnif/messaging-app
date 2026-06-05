import type {
  Chat,
  ChatItem,
  ChatMember,
  Contact,
  Message,
  User,
} from "../../__generated__/graphql";

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

export const GROUP_CHAT_DETAILS: Chat = {
  __typename: "Chat",
  id: "1",
  isGroupChat: true,
  name: "Test Chat 1",
  description: "This is a group chat.",
  avatar: null,
  members: CHAT_MEMBERS,
  messages: CHAT_MESSAGES,
};

export const PRIVATE_CHAT_DETAILS: Chat = {
  __typename: "Chat",
  id: "1",
  isGroupChat: false,
  name: "User2",
  description: null,
  avatar: null,
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

export const currentChatItemMemberMock: User = {
  __typename: "User",
  id: USER_TWO_DETAILS.id,
  username: USER_TWO_DETAILS.username,
  name: USER_TWO_DETAILS.name,
  about: null,
  avatar: null,
  is24HourClock: true,
  isDarkMode: false,
};

export const createUserInput = {
  username: USER_ONE_DETAILS.username,
  password: USER_ONE_DETAILS.password,
  confirmPassword: USER_ONE_DETAILS.password,
};

export const chatItemsMock: ChatItem[] = [
  {
    __typename: "ChatItem",
    id: GROUP_CHAT_DETAILS.id,
    isGroupChat: GROUP_CHAT_DETAILS.isGroupChat,
    name: GROUP_CHAT_DETAILS.name,
    avatar: null,
    unreadCount: 0,
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
