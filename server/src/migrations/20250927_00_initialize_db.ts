import type { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

export default {
  up: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });
    await queryInterface.createTable("contacts", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      contact_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("added", "blocked"),
        defaultValue: "added",
        allowNull: false,
      },
    });
    await queryInterface.createTable("chats", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM("private", "group"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    });
    await queryInterface.createTable("chatmembers", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "chats",
          key: "id",
        },
      },
      role: {
        type: DataTypes.ENUM("member", "admin"),
        defaultValue: "member",
        allowNull: false,
      },
    });
    await queryInterface.createTable("messages", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "chats",
          key: "id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });
  },
  down: async ({ context: queryInterface }: { context: QueryInterface }) => {
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("contacts");
    await queryInterface.dropTable("chats");
    await queryInterface.dropTable("chatmembers");
    await queryInterface.dropTable("messages");
  },
};
