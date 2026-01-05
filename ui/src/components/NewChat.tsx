import { useNavigate, useOutletContext } from "react-router";
import type { User } from "../__generated__/graphql";
import type { NewChatDetails, NewChatMember } from "../types";
import useField from "../hooks/useField";
import NotFound from "../ui/NotFound";
import { ALL_CHATS_BY_USER } from "../graphql/queries";
import { CREATE_CHAT } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import ChatHeader from "../ui/ChatHeader";
import MessageBox from "../ui/MessageBox";

const NewMessageBox = ({
  chatName,
  chatDescription,
  chatMembers,
}: {
  chatName: string | null;
  chatDescription: string | null;
  chatMembers: NewChatMember[];
}) => {
  const navigate = useNavigate();
  const message = useField("New Message", "text", "New Message...");
  const [createChat] = useMutation(CREATE_CHAT, {
    onError: (error) => {
      console.log(error);
    },
    refetchQueries: [ALL_CHATS_BY_USER],
  });

  const handleCreateChat = async () => {
    if (!message.value) {
      console.log("Do not send empty message!");
      return;
    }

    const newChat = await createChat({
      variables: {
        input: {
          name: chatName,
          members: chatMembers?.map((member) => member?.id) ?? [],
          description: chatDescription,
          initialMessage: message.value,
        },
      },
    });

    if (newChat.data?.createChat) {
      message.onReset();
      navigate(`/chats/${newChat?.data?.createChat?.id}`);
    }
  };

  return <MessageBox message={message} callback={handleCreateChat} />;
};

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
