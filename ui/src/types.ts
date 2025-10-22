import type { Contact } from "./__generated__/graphql";

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
