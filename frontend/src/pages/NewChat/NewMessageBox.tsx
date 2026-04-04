import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router";
import type { NewChatMember } from "../../types";
import useField from "../../hooks/useField";
import { CREATE_CHAT } from "../../graphql/mutations";
import MessageBox from "../../components/ui/MessageBox";

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

export default NewMessageBox;
