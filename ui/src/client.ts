import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { OperationTypeNode } from "graphql";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: "http://localhost:4000",
});

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000",
    connectionParams: () => {
      const token = localStorage.getItem("token");

      return {
        Authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

const splitLink = ApolloLink.split(
  ({ operationType }) => {
    return operationType === OperationTypeNode.SUBSCRIPTION;
  },
  wsLink,
  authLink.concat(httpLink)
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
  },
});

const client = new ApolloClient({
  link: splitLink,
  cache: cache,
});

export default client;
