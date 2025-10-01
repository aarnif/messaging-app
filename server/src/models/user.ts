import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db";
import { Chat } from "./chat";
import { Contact } from "./contact";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id?: number;
  declare username: string;
  declare passwordHash: string;
  declare name: string;
  declare about: string | null;
  declare avatar: string | null;
  declare chats?: Chat[];
  declare contacts?: Contact[];
}
User.init(
  {
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
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "user",
  }
);

export { User };
