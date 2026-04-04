import type { User } from "../../__generated__/graphql";
import ChatHeader from "../../components/ui/ChatHeader";
import NotFound from "../../components/ui/NotFound";
import type { NewChatDetails } from "../../types";
import NewMessageBox from "./NewMessageBox";

const NewChatContent = ({
  currentUser,
  chat,
}: {
  currentUser: User;
  chat: NewChatDetails;
}) => {
  if (!chat) {
    return <NotFound entity="Chat" />;
  }

  const { name, description, members } = chat;
  const type = members.length == 2 ? null : "group";

  return (
    <>
      <ChatHeader
        type={type}
        name={name}
        members={members}
        currentUser={currentUser}
      />
      <div className="grow"></div>
      <NewMessageBox
        chatName={name ?? null}
        chatDescription={description ?? null}
        chatMembers={
          members?.filter((member) => member?.id !== currentUser.id) ?? []
        }
      />
    </>
  );
};

export default NewChatContent;
