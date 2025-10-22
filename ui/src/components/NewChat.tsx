import { useNavigate } from "react-router";
import type { User } from "../__generated__/graphql";
import type { NewChatDetails, NewChatMember } from "../types";
import useField from "../hooks/useField";
import ChatNotFound from "../ui/ChatNotFound";
import { FaRegSmile } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { ALL_CHATS_BY_USER } from "../graphql/queries";
import { CREATE_CHAT } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import ChatHeader from "../ui/ChatHeader";

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

  const { name, type, value, placeholder, onChange, onReset } = message;

  return (
    <div className="flex gap-2 bg-white p-2 dark:bg-slate-800">
      <button
        className="cursor-pointer"
        onClick={() => console.log("Clicked add emoji button")}
      >
        <FaRegSmile className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
      </button>
      <label
        htmlFor={name}
        className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-1 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
      >
        <input
          id={name}
          name={name}
          className="peer focus:bg-opacity-0 inset-0 w-full px-3 text-sm font-normal text-slate-900 placeholder:text-sm placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onReset={onReset}
        />
      </label>
      <button
        data-testid="send-message-button"
        className="cursor-pointer"
        onClick={handleCreateChat}
      >
        <MdSend className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
      </button>
    </div>
  );
};

const NewChatContent = ({
  currentUser,
  chat,
}: {
  currentUser: User;
  chat: NewChatDetails;
}) => {
  if (!chat) {
    return <ChatNotFound />;
  }

  const { name, description, members } = chat;

  return (
    <>
      <ChatHeader name={name} members={members} currentUser={currentUser} />
      <div className="flex-grow"></div>
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

const NewChat = ({ currentUser }: { currentUser: User }) => {
  const storedChatInfo = localStorage.getItem("new-chat-info");
  const newChatInfo = storedChatInfo ? JSON.parse(storedChatInfo) : null;

  return (
    <div className="relative flex flex-grow flex-col">
      <NewChatContent currentUser={currentUser} chat={newChatInfo} />
    </div>
  );
};

export default NewChat;
