import { Chat } from "./chat.js";
import { ChatMember } from "./chatMember.js";
import { Contact } from "./contact.js";
import { Message } from "./message.js";
import { User } from "./user.js";

User.hasMany(Contact, { foreignKey: "userId", as: "contacts" });
Contact.belongsTo(User, { foreignKey: "userId", as: "owner" });
Contact.belongsTo(User, { foreignKey: "contactId", as: "contactDetails" });

User.hasMany(Chat, { foreignKey: "createdBy", as: "createdChats" });
Chat.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.belongsToMany(Chat, { through: ChatMember, as: "chats" });
Chat.belongsToMany(User, { through: ChatMember, as: "members" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Chat.hasMany(Message, { foreignKey: "chatId", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });

export { Chat, ChatMember, Contact, Message, User };
