import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_SERVER_URL || "/graphql",
});

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem("messaging-app-token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_WS_URL || "/subscriptions",
    connectionParams: () => {
      const token = localStorage.getItem("messaging-app-token");

      return {
        Authorization: token ? `Bearer ${token}` : "",
      };
    },
    retryAttempts: Infinity,
    shouldRetry: () => true,
    retryWait: (retries) =>
      new Promise<void>((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** retries, 10000)),
      ),
    on: {
      connected: (_socket, _payload, wasRetry) => {
        if (wasRetry) {
          void client.refetchQueries({ include: "active" });
        }
      },
    },
  }),
);

const splitLink = ApolloLink.split(
  ({ operationType }) => {
    return operationType === OperationTypeNode.SUBSCRIPTION;
  },
  wsLink,
  authLink.concat(httpLink),
);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        allChatsByUser: {
          merge(_, incoming = []) {
            return [...incoming];
          },
        },
      },
    },
    Chat: {
      fields: {
        members: {
          merge(_, incoming = []) {
            return [...incoming];
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: splitLink,
  cache: cache,
  defaultOptions: { watchQuery: { notifyOnNetworkStatusChange: false } },
});

export default client;
