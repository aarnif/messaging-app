import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import type { BaseContext } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { expressMiddleware } from "@as-integrations/express5";
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
  }),
);

const authenticateUser = async (auth: string | null | undefined) => {
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
  return currentUser;
};

const start = async (): Promise<ApolloServer<BaseContext>> => {
  await connectToDatabase();

  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const auth = ctx.connectionParams?.Authorization as string;

        const currentUser = await authenticateUser(auth);
        return { currentUser };
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        // eslint-disable-next-line @typescript-eslint/require-await
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        const currentUser = await authenticateUser(auth);
        return { currentUser };
      },
    }),
  );

  const PORT = config.PORT;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on ${PORT}`),
  );

  return server;
};

export { start };
