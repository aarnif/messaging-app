import { ChatMember } from "../types/other.js";

const chatMembers: ChatMember[] = [
  { userId: 1, chatId: 1, isAdmin: true, unreadCount: 0 },
  { userId: 2, chatId: 1, isAdmin: false, unreadCount: 0 },
  { userId: 3, chatId: 1, isAdmin: false, unreadCount: 0 },
  { userId: 4, chatId: 1, isAdmin: false, unreadCount: 0 },

  { userId: 1, chatId: 2, isAdmin: true, unreadCount: 0 },
  { userId: 5, chatId: 2, isAdmin: false, unreadCount: 0 },
  { userId: 6, chatId: 2, isAdmin: false, unreadCount: 0 },
  { userId: 7, chatId: 2, isAdmin: false, unreadCount: 0 },

  { userId: 1, chatId: 3, isAdmin: true, unreadCount: 0 },
  { userId: 8, chatId: 3, isAdmin: false, unreadCount: 0 },
  { userId: 9, chatId: 3, isAdmin: false, unreadCount: 0 },
  { userId: 10, chatId: 3, isAdmin: false, unreadCount: 0 },

  { userId: 2, chatId: 4, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 4, isAdmin: false, unreadCount: 0 },
  { userId: 3, chatId: 4, isAdmin: false, unreadCount: 0 },
  { userId: 5, chatId: 4, isAdmin: false, unreadCount: 0 },

  { userId: 5, chatId: 5, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 5, isAdmin: false, unreadCount: 0 },
  { userId: 2, chatId: 5, isAdmin: false, unreadCount: 0 },
  { userId: 4, chatId: 5, isAdmin: false, unreadCount: 0 },

  { userId: 11, chatId: 6, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 6, isAdmin: false, unreadCount: 0 },
  { userId: 8, chatId: 6, isAdmin: false, unreadCount: 0 },

  { userId: 10, chatId: 7, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 7, isAdmin: false, unreadCount: 0 },
  { userId: 7, chatId: 7, isAdmin: false, unreadCount: 0 },
  { userId: 9, chatId: 7, isAdmin: false, unreadCount: 0 },

  { userId: 6, chatId: 8, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 8, isAdmin: false, unreadCount: 0 },
  { userId: 7, chatId: 8, isAdmin: false, unreadCount: 0 },
  { userId: 9, chatId: 8, isAdmin: false, unreadCount: 0 },

  { userId: 4, chatId: 9, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 9, isAdmin: false, unreadCount: 0 },
  { userId: 5, chatId: 9, isAdmin: false, unreadCount: 0 },
  { userId: 7, chatId: 9, isAdmin: false, unreadCount: 0 },

  { userId: 7, chatId: 10, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 10, isAdmin: false, unreadCount: 0 },
  { userId: 4, chatId: 10, isAdmin: false, unreadCount: 0 },
  { userId: 6, chatId: 10, isAdmin: false, unreadCount: 0 },

  { userId: 8, chatId: 11, isAdmin: true, unreadCount: 0 },
  { userId: 1, chatId: 11, isAdmin: false, unreadCount: 0 },
  { userId: 5, chatId: 11, isAdmin: false, unreadCount: 0 },
  { userId: 11, chatId: 11, isAdmin: false, unreadCount: 0 },
];

export default chatMembers;
