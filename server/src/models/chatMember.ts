import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db";

class ChatMember extends Model<
  InferAttributes<ChatMember>,
  InferCreationAttributes<ChatMember>
> {
  declare id?: number;
  declare userId: number;
  declare chatId: number;
  declare role: "member" | "admin";
  declare name?: string;
  declare unreadCount: number;
  declare chat_member?: {
    role: string;
    unreadCount: number;
  };
}
ChatMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    chatId: {
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
    unreadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "chat_member",
  }
);

export { ChatMember };
