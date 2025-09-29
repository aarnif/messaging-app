import type { Resolvers } from "./types/graphql";
import { User, Contact, Chat, ChatMember, Message } from "./models";
import { GraphQLError } from "graphql";
import { z } from "zod";
import bcrypt from "bcrypt";

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
        throw new GraphQLError("Username already exists!", {
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
  },
};
