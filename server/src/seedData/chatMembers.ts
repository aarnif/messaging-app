import { ChatMember } from "../types/other";

const chatMembers: ChatMember[] = [
  { userId: 1, chatId: 1, role: "admin" },
  { userId: 2, chatId: 1, role: "member" },
  { userId: 3, chatId: 1, role: "member" },
  { userId: 7, chatId: 1, role: "member" },

  { userId: 3, chatId: 2, role: "admin" },
  { userId: 1, chatId: 2, role: "member" },
  { userId: 9, chatId: 2, role: "member" },
  { userId: 10, chatId: 2, role: "member" },

  { userId: 4, chatId: 3, role: "admin" },
  { userId: 1, chatId: 3, role: "member" },
  { userId: 5, chatId: 3, role: "member" },
  { userId: 6, chatId: 3, role: "member" },

  { userId: 2, chatId: 4, role: "admin" },
  { userId: 1, chatId: 4, role: "member" },
  { userId: 7, chatId: 4, role: "member" },
  { userId: 8, chatId: 4, role: "member" },

  { userId: 5, chatId: 5, role: "admin" },
  { userId: 1, chatId: 5, role: "member" },
  { userId: 6, chatId: 5, role: "member" },
  { userId: 2, chatId: 5, role: "member" },

  { userId: 11, chatId: 6, role: "admin" },
  { userId: 1, chatId: 6, role: "member" },
  { userId: 8, chatId: 6, role: "member" },
  { userId: 10, chatId: 6, role: "member" },

  { userId: 10, chatId: 7, role: "admin" },
  { userId: 1, chatId: 7, role: "member" },
  { userId: 8, chatId: 7, role: "member" },
  { userId: 9, chatId: 7, role: "member" },

  { userId: 6, chatId: 8, role: "admin" },
  { userId: 1, chatId: 8, role: "member" },
  { userId: 4, chatId: 8, role: "member" },
  { userId: 5, chatId: 8, role: "member" },

  { userId: 4, chatId: 9, role: "admin" },
  { userId: 1, chatId: 9, role: "member" },
  { userId: 6, chatId: 9, role: "member" },
  { userId: 7, chatId: 9, role: "member" },

  { userId: 7, chatId: 10, role: "admin" },
  { userId: 1, chatId: 10, role: "member" },
  { userId: 2, chatId: 10, role: "member" },
  { userId: 8, chatId: 10, role: "member" },

  { userId: 8, chatId: 11, role: "admin" },
  { userId: 1, chatId: 11, role: "member" },
  { userId: 2, chatId: 11, role: "member" },
  { userId: 10, chatId: 11, role: "member" },
];

export default chatMembers;
