import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gql } from "graphql-tag";
import { resolvers } from "./resolvers";
import { connectToDatabase } from "./db";
import config from "config";

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
  });
  console.log(`Server is now running at ${url}`);
};

export { start };
