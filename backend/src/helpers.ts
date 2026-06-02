import { GraphQLScalarType, Kind } from "graphql";
import { z } from "zod";
import { Chat, User } from "./models/index.js";

// Date scalar implementation from Apollo Server documentation
// https://www.apollographql.com/docs/apollo-server/schema/custom-scalars#example-the-date-scalar
export const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime();
    }
    throw Error("GraphQL Date Scalar serializer expected a `Date` object");
  },
  parseValue(value) {
    if (typeof value === "number") {
      return new Date(value);
    }
    throw new Error("GraphQL Date Scalar parser expected a `number`");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

export const getChatName = (
  parent: Chat,
  currentUser: User | null,
): string | null => {
  if (parent.isGroupChat) {
    return parent.name;
  }

  const otherMember = parent.members?.find(
    (member) => member.id.toString() !== currentUser?.id.toString(),
  );

  return otherMember?.name || null;
};

export const formatZodErrorMessage = (error: z.ZodError): string => {
  return error.issues.map((issue) => issue.message).join(", ");
};
