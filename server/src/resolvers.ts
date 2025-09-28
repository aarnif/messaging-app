import { User, Contact, Chat, ChatMember, Message } from "./models";

export const resolvers = {
  Query: {
    countDocuments: async () => {
      const counts = await Promise.all([
        User.count(),
        Contact.count(),
        Chat.count(),
        ChatMember.count(),
        Message.count(),
      ]);

      return counts.reduce((total, count) => total + count, 0);
    },
  },
};
