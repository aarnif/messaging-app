import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gql } from "graphql-tag";
import { resolvers } from "./resolvers";
import { connectToDatabase } from "./db";
import config from "config";
import jwt from "jsonwebtoken";
import { User } from "./models";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

const start = async () => {
  await connectToDatabase();
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: config.PORT },
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      let currentUser = null;
      if (auth && auth.startsWith("Bearer ")) {
        const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET);
        if (
          typeof decodedToken === "object" &&
          typeof decodedToken.id === "number"
        ) {
          currentUser = await User.findByPk(decodedToken.id);
        }
      }
      return { currentUser };
    },
  });
  console.log(`Server is now running at ${url}`);
};

export { start };
