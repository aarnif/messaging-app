import type { Contact, User } from "./__generated__/graphql";

export type InputField = {
  name: string;
  type: string;
  value: string;
  placeholder: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

export type NewChatMember = {
  id: string;
  username: string;
  name: string;
};

export type NewChatDetails = {
  name: string;
  description: string | null;
  members: NewChatMember[];
};

export interface UserContact extends Contact {
  isSelected: boolean;
}

export interface AddContactOption extends User {
  isSelected: boolean;
}

export interface ModalOptions {
  type: "alert";
  title: string;
  message: string;
  close: string;
  confirm?: string;
  callback?: () => void;
}
