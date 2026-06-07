import type { QueryInterface } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.renameColumn("contacts", "user_id", "owner_id");
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.renameColumn("contacts", "owner_id", "user_id");
  },
};
