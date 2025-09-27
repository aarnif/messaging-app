import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db";

class Contact extends Model<
  InferAttributes<Contact>,
  InferCreationAttributes<Contact>
> {
  declare id?: number;
  declare userId: number;
  declare contactId: number;
  declare status: "added" | "blocked";
}
Contact.init(
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
    contactId: {
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
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "contact",
  }
);

export { Contact };
