import { useMutation, useLazyQuery } from "@apollo/client/react";
import MessageBox from "../../components/ui/MessageBox";
import { SEND_MESSAGE } from "../../graphql/mutations";
import type { Exact, IsBlockedByUserQuery } from "../../__generated__/graphql";
import useField from "../../hooks/useField";
import useModal from "../../hooks/useModal";

const NewMessageBox = ({
  id,
  userId,
  checkIsBlocked,
}: {
  id: string;
  userId: string | null;
  checkIsBlocked: useLazyQuery.ExecFunction<
    IsBlockedByUserQuery,
    Exact<{ id: string }>
  >;
}) => {
  const modal = useModal();
  const message = useField("New Message", "text", "New Message...");
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.log(error);
    },
  });

  const handleSendMessage = async () => {
    if (!message.value) {
      console.log("Do not send empty message!");
      return;
    }

    if (userId) {
      const isBlockedByContact = await checkIsBlocked({
        variables: {
          id: userId,
        },
      });

      if (isBlockedByContact.data?.isBlockedByUser) {
        modal({
          type: "danger",
          title: "Blocked",
          message: "Contact has blocked you.",
          close: "Close",
        });
        return;
      }
    }

    await sendMessage({
      variables: {
        input: {
          id,
          content: message.value,
          isNotification: false,
        },
      },
    });

    message.onReset();
  };

  return <MessageBox message={message} callback={handleSendMessage} />;
};

export default NewMessageBox;
