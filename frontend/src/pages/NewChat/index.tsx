import { useOutletContext } from "react-router";
import type { User } from "../../__generated__/graphql";
import NewChatContent from "./NewChatContent";

const NewChat = () => {
  const { currentUser } = useOutletContext<{
    currentUser: User;
  }>();

  const storedChatInfo = localStorage.getItem("new-chat-info");
  const newChatInfo = storedChatInfo ? JSON.parse(storedChatInfo) : null;

  return (
    <div className="relative flex grow flex-col">
      <NewChatContent currentUser={currentUser} chat={newChatInfo} />
    </div>
  );
};

export default NewChat;
