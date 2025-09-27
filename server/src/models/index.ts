import { User } from "./user";
import { Contact } from "./contact";
import { Chat } from "./chat";
import { ChatMember } from "./chatMember";
import { Message } from "./message";

User.hasMany(Contact, { foreignKey: "userId", as: "contacts" });
Contact.belongsTo(User, { foreignKey: "userId", as: "owner" });
Contact.belongsTo(User, { foreignKey: "contactId", as: "contact" });

User.hasMany(Chat, { foreignKey: "createdBy", as: "createdChats" });
Chat.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.belongsToMany(Chat, { through: ChatMember, as: "chats" });
Chat.belongsToMany(User, { through: ChatMember, as: "members" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Chat.hasMany(Message, { foreignKey: "chatId", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });

export { User, Contact, Chat, ChatMember, Message };
