import type { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.addColumn("chat_members", "is_admin", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.removeColumn("chat_members", "role");
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.removeColumn("chat_members", "is_admin");
    await queryInterface.addColumn("chat_members", "role", {
      type: DataTypes.ENUM("member", "admin"),
      defaultValue: "member",
      allowNull: false,
    });
  },
};
