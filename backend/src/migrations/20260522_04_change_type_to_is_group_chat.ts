import type { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.addColumn("chats", "is_group_chat", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.removeColumn("chats", "type");
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.removeColumn("chats", "is_group_chat");
    await queryInterface.addColumn("chats", "type", {
      type: DataTypes.ENUM("private", "group"),
      allowNull: false,
    });
  },
};
