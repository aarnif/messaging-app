import type { Includeable, Order } from "sequelize";
import { Message, User } from "./models/index.js";

export const CHAT_INCLUDE_MEMBERS_AND_MESSAGES: Includeable[] = [
  {
    model: User,
    as: "members",
    through: {
      attributes: ["id", "userId", "isAdmin", "unreadCount"],
    },
  },
  {
    model: Message,
    as: "messages",
    include: [{ model: User, as: "sender" }],
  },
];

export const CHAT_ORDER_MEMBERS_AND_MESSAGES: Order = [
  [{ model: User, as: "members" }, "name", "ASC"],
  [{ model: User, as: "members" }, "username", "ASC"],
  [{ model: Message, as: "messages" }, "createdAt", "ASC"],
];

export const CHAT_WITH_MEMBERS_AND_MESSAGES = {
  include: CHAT_INCLUDE_MEMBERS_AND_MESSAGES,
  order: CHAT_ORDER_MEMBERS_AND_MESSAGES,
};
