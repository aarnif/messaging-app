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

const createUser = (userDetails: {
  id: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}): User => ({
  __typename: "User",
  id: userDetails.id,
  username: userDetails.username,
  name: userDetails.name,
  about: `Hi! My name is User ${userDetails.id}`,
  avatar: null,
  is24HourClock: true,
  isDarkMode: false,
});

export const USER_ONE = createUser(USER_ONE_DETAILS);
export const USER_TWO = createUser(USER_TWO_DETAILS);
export const USER_THREE = createUser(USER_THREE_DETAILS);
export const USER_FOUR = createUser(USER_FOUR_DETAILS);
export const USER_FIVE = createUser(USER_FIVE_DETAILS);

const createChatMember = (user: User, isAdmin: boolean): ChatMember => ({
  ...user,
  __typename: "ChatMember",
  userId: user.id,
  isAdmin: isAdmin,
  unreadCount: 0,
});

const CHAT_MEMBERS = [
  createChatMember(USER_ONE, true),
  createChatMember(USER_TWO, false),
  createChatMember(USER_THREE, false),
];

const createMessage = (
  id: string,
  sender: User,
  content: string,
  createdAtOffset: number = 0,
): Message => ({
  __typename: "Message",
  id,
  chatId: "1",
  isNotification: false,
  isDeleted: false,
  sender,
  content,
  createdAt: 1759094100000 + createdAtOffset,
  updatedAt: 1759094100000 + createdAtOffset,
});

const CHAT_MESSAGES = [
  createMessage(
    "1",
    USER_ONE,
    `This is a chat message from ${USER_ONE_DETAILS.name}`,
  ),
  createMessage(
    "2",
    USER_TWO,
    `This is a chat message from ${USER_TWO_DETAILS.name}`,
    86400000,
  ),
  createMessage(
    "3",
    USER_THREE,
    `This is a chat message from ${USER_THREE_DETAILS.name}`,
    2 * 86400000,
  ),
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

export const MESSAGE_DETAILS = createMessage(
  "4",
  USER_ONE,
  "This is a new message.",
  3 * 86400000,
);

const createContact = (
  id: string,
  user: User,
  isBlocked: boolean = false,
): Contact => ({
  __typename: "Contact",
  id,
  isBlocked,
  contactDetails: user,
});

export const CONTACT_DETAILS = createContact("1", USER_TWO);

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

export const currentChatItemAdminMock = USER_ONE;

export const currentChatItemMemberMock = USER_TWO;

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

export const userContactsMock = [
  createContact("1", USER_TWO),
  createContact("2", USER_THREE),
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

export const nonContactUsersMock: User[] = [USER_FOUR, USER_FIVE];

export const ADDED_CONTACTS = [
  createContact("2", USER_FOUR),
  createContact("3", USER_FIVE),
];
