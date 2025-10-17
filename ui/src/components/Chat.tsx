import { useMatch } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CHAT_BY_ID } from "../graphql/queries";

const Chat = () => {
  const match = useMatch("/chats/:id")?.params;
  const { data, loading } = useQuery(FIND_CHAT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  if (loading) {
    return null;
  }

  const chat = data?.findChatById;

  console.log("Chat", chat);

  if (!chat) {
    return <p>Chat not found!</p>;
  }

  return <h1>{chat.name}</h1>;
};

export default Chat;
