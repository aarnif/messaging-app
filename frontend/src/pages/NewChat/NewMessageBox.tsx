import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router";
import MessageBox from "../../components/ui/MessageBox";
import { CREATE_CHAT } from "../../graphql/mutations";
import useField from "../../hooks/useField";
import useModal from "../../hooks/useModal";
import type { NewChatMember } from "../../types";

const NewMessageBox = ({
  chatName,
  chatDescription,
  chatMembers,
}: {
  chatName: string | null;
  chatDescription: string | null;
  chatMembers: NewChatMember[];
}) => {
  const modal = useModal();
  const navigate = useNavigate();
  const message = useField("New Message", "text", "New Message...");
  const [createChat] = useMutation(CREATE_CHAT, {
    onError: (error) => {
      console.log(error);
      modal({
        type: "danger",
        title: "Failed to Create Chat",
        message: error.message,
        close: "Close",
      });
    },
  });

  const handleCreateChat = async () => {
    if (!message.value) {
      modal({
        type: "alert",
        title: "Empty Message",
        message: "Please enter a message before sending.",
        close: "Close",
      });
      return;
    }

    const newChat = await createChat({
      variables: {
        input: {
          name: chatName,
          members: chatMembers.map((member) => member.id) ?? [],
          description: chatDescription,
          initialMessage: message.value,
        },
      },
    });

    if (newChat.data?.createChat) {
      message.onReset();
      navigate(`/chats/${newChat.data.createChat.id}`);
    }
  };

  return <MessageBox message={message} callback={handleCreateChat} />;
};

export default NewMessageBox;
