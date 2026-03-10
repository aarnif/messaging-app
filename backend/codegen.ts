import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schema.graphql",
  generates: {
    "src/types/graphql.ts": {
      config: {
        mappers: {
          User: "src/models/user#User as SequelizeUser",
          Contact: "src/models/contact#Contact as SequelizeContact",
          Chat: "src/models/chat#Chat as SequelizeChat",
          ChatMember: "src/models/chatMember#ChatMember as SequelizeChatMember",
          Message: "src/models/message#Message as SequelizeMessage",
        },
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};
export default config;
