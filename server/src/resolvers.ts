import type { Resolvers } from "./types/graphql";
import { User, Contact, Chat, ChatMember, Message } from "./models";
import config from "config";
import { GraphQLError } from "graphql";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export const resolvers: Resolvers = {
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
    me: async (_, __, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return User.findByPk(context.currentUser.id);
    },
    findUserById: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await User.findByPk(Number(id));
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "NOT_FOUND",
            invalidArgs: id,
          },
        });
      }
      return user;
    },
    allChatsByUser: async (
      _,
      { search },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const whereClause = search
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const user = await User.findByPk(context.currentUser.id, {
        include: [
          {
            model: Chat,
            as: "chats",
            where: whereClause,
            through: {
              attributes: [],
            },
            include: [
              {
                model: Message,
                as: "messages",
                include: [{ model: User, as: "sender" }],
              },
            ],
          },
        ],
        order: [
          [
            { model: Chat, as: "chats" },
            { model: Message, as: "messages" },
            "createdAt",
            "DESC",
          ],
        ],
      });

      return user?.chats || [];
    },
    findChatById: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const chat = await Chat.findByPk(Number(id), {
        include: [
          {
            model: Message,
            as: "messages",
            include: [{ model: User, as: "sender" }],
          },
          {
            model: User,
            as: "members",
            through: {
              attributes: ["role"],
            },
          },
        ],
      });

      if (!chat) {
        throw new GraphQLError("Chat not found", {
          extensions: {
            code: "NOT_FOUND",
            invalidArgs: id,
          },
        });
      }
      return chat;
    },
    allContactsByUser: async (
      _,
      { search },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const whereClause = search
        ? {
            [Op.or]: [
              { username: { [Op.iLike]: `%${search}%` } },
              { name: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const user = await User.findByPk(context.currentUser.id, {
        include: [
          {
            model: Contact,
            as: "contacts",
            include: [
              {
                model: User,
                as: "contactDetails",
                where: whereClause,
              },
            ],
          },
        ],
      });

      return user?.contacts || [];
    },
    nonContactUsers: async (
      _,
      { search },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const whereClause = search
        ? {
            [Op.or]: [
              { username: { [Op.iLike]: `%${search}%` } },
              { name: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const existingContacts = await Contact.findAll({
        where: { userId: context.currentUser.id },
        attributes: ["contactId"],
      });

      const existingContactIds = existingContacts.map(
        (contact) => contact.contactId
      );

      const availableUsers = await User.findAll({
        where: {
          id: {
            [Op.notIn]: [...existingContactIds, Number(context.currentUser.id)],
          },
          ...whereClause,
        },
      });

      return availableUsers;
    },
    isBlockedByUser: async (
      _,
      { id },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const contact = await Contact.findOne({
        where: {
          contactId: context.currentUser.id,
          userId: Number(id),
        },
        include: [{ model: User, as: "contactDetails" }],
      });

      if (!contact) {
        throw new GraphQLError("Contact not found", {
          extensions: {
            code: "NOT_FOUND",
            invalidArgs: id,
          },
        });
      }

      return contact.isBlocked;
    },
  },
  ChatMember: {
    role: (parent: ChatMember & { chat_member?: { role: string } }) =>
      parent.chat_member?.role || null,
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const { username, password, confirmPassword } = input;

      const newUserInputSchema = z
        .object({
          username: z
            .string()
            .min(3, "Username must be at least 3 characters long"),
          password: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });

      try {
        newUserInputSchema.parse({ username, password, confirmPassword });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError("Input validation failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              validationErrors: error.issues,
            },
          });
        }
      }

      const userExists = await User.findOne({
        where: {
          username,
        },
      });

      if (userExists) {
        throw new GraphQLError("Username already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: username,
          },
        });
      }

      try {
        const passwordHash = await bcrypt.hash(password, 10);

        return await User.create({
          username,
          passwordHash,
          name: username[0].toUpperCase() + username.slice(1),
        });
      } catch (error) {
        throw new GraphQLError("Failed to create user", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    login: async (_, { input }) => {
      const { username, password } = input;
      const userExists = await User.findOne({ where: { username } });

      if (
        !userExists ||
        !(await bcrypt.compare(password, userExists.passwordHash))
      ) {
        throw new GraphQLError("Invalid username or password", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      try {
        const userForToken = {
          username: userExists.username,
          id: userExists.id,
        };

        return { value: jwt.sign(userForToken, config.JWT_SECRET) };
      } catch (error) {
        throw new GraphQLError("Failed to login", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    addContact: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const contactId = Number(id);

      if (contactId === context.currentUser.id) {
        throw new GraphQLError("Cannot add yourself as a contact", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: id,
          },
        });
      }

      const contactExists = await Contact.findOne({
        where: {
          userId: Number(context.currentUser.id),
          contactId: contactId,
        },
      });

      if (contactExists) {
        throw new GraphQLError("Contact already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: id,
          },
        });
      }

      try {
        const newContact = await Contact.create({
          userId: Number(context.currentUser.id),
          contactId: contactId,
          isBlocked: false,
        });

        return await Contact.findByPk(newContact.id, {
          include: [
            {
              model: User,
              as: "contactDetails",
            },
          ],
        });
      } catch (error) {
        throw new GraphQLError("Failed to create contact", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    removeContact: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const contactToBeRemoved = await Contact.findOne({
        where: {
          id: Number(id),
          userId: context.currentUser.id,
        },
        include: [{ model: User, as: "contactDetails" }],
      });

      if (!contactToBeRemoved) {
        throw new GraphQLError("Contact not found", {
          extensions: {
            code: "NOT_FOUND",
            invalidArgs: id,
          },
        });
      }

      try {
        await contactToBeRemoved.destroy();

        return contactToBeRemoved;
      } catch (error) {
        throw new GraphQLError("Failed to remove contact", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    toggleBlockContact: async (
      _,
      { id },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const targetContact = await Contact.findOne({
          where: {
            id: Number(id),
            userId: context.currentUser.id,
          },
          include: [{ model: User, as: "contactDetails" }],
        });

        if (!targetContact) {
          throw new GraphQLError("Contact not found", {
            extensions: {
              code: "NOT_FOUND",
              invalidArgs: id,
            },
          });
        }

        targetContact.isBlocked = !targetContact.isBlocked;
        await targetContact.save();

        return targetContact;
      } catch (error) {
        throw new GraphQLError("Failed to remove contact", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    editProfile: async (
      _,
      { input },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { name, about } = input;

      const editProfileInputSchema = z.object({
        name: z.string().min(3, "Name must be at least 3 characters long"),
        about: z.string().nullable(),
      });

      try {
        editProfileInputSchema.parse({ name, about });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError("Input validation failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              validationErrors: error.issues,
            },
          });
        }
      }

      try {
        const user = await User.findByPk(context.currentUser.id);

        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: {
              code: "NOT_FOUND",
              invalidArgs: context.currentUser.id,
            },
          });
        }

        user.name = name;
        user.about = about || null;

        await user.save();
        return user;
      } catch (error) {
        throw new GraphQLError("Failed to edit profile", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    createChat: async (_, { input }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { name, description, members, initialMessage } = input;

      const newChatSchema = z
        .object({
          name: z.string().nullable(),
          description: z.string().nullable(),
          members: z.string().array(),
          initialMessage: z.string().min(1, "Message content cannot be empty"),
        })
        .refine(
          (data) => {
            if (data.members.length > 1) {
              return data.name && data.name.trim().length >= 3;
            }
            return true;
          },
          {
            message: "Group chat name must be at least 3 characters long",
            path: ["name"],
          }
        );

      try {
        newChatSchema.parse({ name, description, members, initialMessage });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError("Input validation failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              validationErrors: error.issues,
            },
          });
        }
      }

      try {
        const newChat = await Chat.create({
          name: name || null,
          description: description || null,
          type: members.length > 1 ? "group" : "private",
          createdBy: Number(context.currentUser.id),
        });

        await ChatMember.bulkCreate(
          [context.currentUser.id, ...members].map((member) => {
            return {
              userId: Number(member),
              chatId: Number(newChat.id),
              role:
                Number(member) === Number(context.currentUser?.id)
                  ? "admin"
                  : "member",
            };
          })
        );

        await Message.create({
          senderId: Number(context.currentUser.id),
          chatId: Number(newChat.id),
          content: initialMessage,
        });

        return await Chat.findByPk(newChat.id, {
          include: [
            {
              model: Message,
              as: "messages",
              include: [{ model: User, as: "sender" }],
            },
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });
      } catch (error) {
        throw new GraphQLError("Failed to create chat", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    deleteChat: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const chatToBeDeleted = await Chat.findByPk(Number(id), {
          include: [
            {
              model: Message,
              as: "messages",
              include: [{ model: User, as: "sender" }],
            },
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });

        if (!chatToBeDeleted) {
          throw new GraphQLError("Chat not found", {
            extensions: {
              code: "NOT_FOUND",
              invalidArgs: id,
            },
          });
        }

        await chatToBeDeleted.destroy();
        await ChatMember.destroy({
          where: {
            chatId: Number(id),
          },
        });
        await Message.destroy({
          where: {
            chatId: Number(id),
          },
        });

        return chatToBeDeleted;
      } catch (error) {
        throw new GraphQLError("Failed to delete chat", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    editChat: async (_, { input }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { id, name, description, members } = input;

      const editChatSchema = z.object({
        id: z.string(),
        name: z
          .string()
          .min(3, "Group chat name must be at least 3 characters long"),
        description: z.string().nullable(),
        members: z.string().array(),
      });

      try {
        editChatSchema.parse({ id, name, description, members });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError("Input validation failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              validationErrors: error.issues,
            },
          });
        }
      }

      try {
        const chatToBeUpdated = await Chat.findByPk(Number(id), {
          include: [
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });

        if (!chatToBeUpdated) {
          throw new GraphQLError("Chat not found", {
            extensions: {
              code: "NOT_FOUND",
              invalidArgs: id,
            },
          });
        }

        const currentMemberIds =
          chatToBeUpdated.members?.map((member) => member.id) || [];

        const newMemberIds = members.map((member) => Number(member));

        const membersToAdd = newMemberIds.filter(
          (memberId) => !currentMemberIds.includes(memberId)
        );

        const membersToRemove = currentMemberIds.filter(
          (memberId) =>
            !newMemberIds.includes(Number(memberId)) &&
            Number(memberId) !== Number(context?.currentUser?.id)
        );

        if (membersToAdd.length > 0) {
          await ChatMember.bulkCreate(
            membersToAdd.map((memberId) => ({
              userId: memberId,
              chatId: Number(chatToBeUpdated.id),
              role: "member",
            }))
          );
        }

        if (membersToRemove.length > 0) {
          await ChatMember.destroy({
            where: {
              userId: {
                [Op.in]: membersToRemove.map((member) => Number(member)),
              },
              chatId: Number(chatToBeUpdated.id),
            },
          });
        }

        chatToBeUpdated.name = name;
        chatToBeUpdated.description = description || null;

        await chatToBeUpdated.save();

        return await Chat.findByPk(Number(id), {
          include: [
            {
              model: Message,
              as: "messages",
              include: [{ model: User, as: "sender" }],
            },
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });
      } catch (error) {
        throw new GraphQLError("Failed to edit chat", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    leaveChat: async (_, { id }, context: { currentUser: User | null }) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        await ChatMember.destroy({
          where: {
            userId: context?.currentUser?.id,
            chatId: Number(id),
          },
        });

        return await Chat.findByPk(Number(id), {
          include: [
            {
              model: Message,
              as: "messages",
              include: [{ model: User, as: "sender" }],
            },
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });
      } catch (error) {
        throw new GraphQLError("Failed to leave chat", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
    sendMessage: async (
      _,
      { input },
      context: { currentUser: User | null }
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { id, content } = input;

      const newMessageInputSchema = z.object({
        id: z.string(),
        content: z.string().min(1, "Message content cannot be empty"),
      });

      try {
        newMessageInputSchema.parse({ id, content });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError("Input validation failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              validationErrors: error.issues,
            },
          });
        }
      }

      try {
        await Message.create({
          senderId: Number(context.currentUser.id),
          chatId: Number(id),
          content: content,
        });

        return await Chat.findByPk(Number(id), {
          include: [
            {
              model: Message,
              as: "messages",
              include: [{ model: User, as: "sender" }],
            },
            {
              model: User,
              as: "members",
              through: {
                attributes: ["role"],
              },
            },
          ],
        });
      } catch (error) {
        throw new GraphQLError("Failed to add message to chat", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            error,
          },
        });
      }
    },
  },
};
