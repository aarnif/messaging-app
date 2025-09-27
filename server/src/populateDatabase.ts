import { User, Contact, Chat, ChatMember, Message } from "./models/index";
import { sequelize, connectToDatabase } from "./db";
import { hash } from "bcrypt";
import users from "./seedData/users";
import contacts from "./seedData/contacts";
import chats from "./seedData/chats";
import chatMembers from "./seedData/chatMembers";
import messages from "./seedData/messages";

export const emptyDatabase = async () => {
  console.log("Dropping tables...");
  await User.drop({ cascade: true });
  await Contact.drop({ cascade: true });
  await Chat.drop({ cascade: true });
  await ChatMember.drop({ cascade: true });
  await Message.drop({ cascade: true });
  console.log("Tables dropped!");
};

const createUsers = async () => {
  const createdUsers = await User.bulkCreate(
    await Promise.all(
      users.map(async (user) => ({
        username: user.username,
        passwordHash: await hash(user.password, 10),
        name: user.name,
        avatar: user.avatar,
      }))
    )
  );
  console.log(`✅ Created ${createdUsers.length} users`);
};

const createContacts = async () => {
  const createdContacts = await Contact.bulkCreate(contacts);
  console.log(`✅ Created ${createdContacts.length} contacts`);
};

const createChats = async () => {
  const createdChats = await Chat.bulkCreate(chats);
  console.log(`✅ Created ${createdChats.length} chats`);
};

const createChatMembers = async () => {
  const createdChatMembers = await ChatMember.bulkCreate(chatMembers);
  console.log(`✅ Created ${createdChatMembers.length} chat members`);
};

const createMessages = async () => {
  const createdMessages = await Message.bulkCreate(messages);
  console.log(`✅ Created ${createdMessages.length} messages`);
};

export const populateDatabase = async () => {
  await sequelize.sync();
  await createUsers();
  await createContacts();
  await createChats();
  await createChatMembers();
  await createMessages();
};

const main = async () => {
  await connectToDatabase();
  await emptyDatabase();
  await populateDatabase();
  await sequelize.close();
  console.log("Connection closed!");
};

if (process.env.POPULATE_DB === "true") {
  main().catch((error) => {
    console.error("Error during database population:", error);
  });
}
