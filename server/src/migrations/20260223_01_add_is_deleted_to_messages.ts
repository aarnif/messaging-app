import type { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.addColumn("messages", "is_deleted", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.removeColumn("messages", "is_deleted");
  },
};
