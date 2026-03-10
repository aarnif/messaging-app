import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db";
import { ChatMember } from "./chatMember";
import { Message } from "./message";

class Chat extends Model<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
  declare id?: number;
  declare type: "private" | "group";
  declare name: string | null;
  declare description: string | null;
  declare avatar: string | null;
  declare createdBy: number;
  declare members?: ChatMember[];
  declare messages?: Message[];
}
Chat.init(
  {
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
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "chat",
  },
);

export { Chat };
