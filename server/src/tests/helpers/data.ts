export const user1Details = {
  id: "1",
  name: "User1",
  username: "user1",
  password: "password",
  confirmPassword: "password",
};

export const user2Details = {
  ...user1Details,
  name: "User2",
  id: "2",
  username: "user2",
};

export const user3Details = {
  ...user1Details,
  name: "User3",
  id: "3",
  username: "user3",
};

export const expectedUser1 = {
  id: user1Details.id,
  username: user1Details.username,
  name: user1Details.name,
  about: null,
  avatar: null,
  is24HourClock: true,
};

export const expectedUser2 = {
  id: user2Details.id,
  username: user2Details.username,
  name: user2Details.name,
  about: null,
  avatar: null,
  is24HourClock: true,
};

export const expectedUser3 = {
  id: user3Details.id,
  username: user3Details.username,
  name: user3Details.name,
  about: null,
  avatar: null,
  is24HourClock: true,
};

export const privateChatDetails = {
  name: null,
  description: null,
  members: [user2Details.id],
  initialMessage: "Hello world",
};

export const groupChatDetails = {
  name: "Group Chat",
  description: "Test description",
  members: [user2Details.id, user3Details.id],
  initialMessage: "Hello world",
};
