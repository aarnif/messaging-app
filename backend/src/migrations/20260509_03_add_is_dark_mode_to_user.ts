import type { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.addColumn("users", "is_dark_mode", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.removeColumn("users", "is_dark_mode");
  },
};
