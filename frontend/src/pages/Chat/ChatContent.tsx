import { useLazyQuery } from "@apollo/client/react";
import { useNavigate } from "react-router";
import type { Chat as ChatType, User } from "../../__generated__/graphql";
import ChatHeader from "../../components/ui/ChatHeader";
import {
  FIND_CONTACT_BY_USER_ID,
  IS_BLOCKED_BY_USER,
} from "../../graphql/queries";
import ChatMessages from "./ChatMessages";
import NewMessageBox from "./NewMessageBox";

const ChatContent = ({
  currentUser,
  chat,
  setIsChatInfoOpen,
  latestAddedMessageId,
}: {
  currentUser: User;
  chat: ChatType;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  latestAddedMessageId: string | null;
}) => {
  const navigate = useNavigate();
  const [checkIsBlocked] = useLazyQuery(IS_BLOCKED_BY_USER, {
    fetchPolicy: "network-only",
  });
  const [findContactByUserId] = useLazyQuery(FIND_CONTACT_BY_USER_ID, {
    fetchPolicy: "network-only",
  });

  const { id, type, name, members, messages } = chat;

  const otherChatMember =
    type === "private"
      ? members.find((member) => member.id !== currentUser.id)
      : null;

  const handleCallBack = async () => {
    if (type === "group") {
      setIsChatInfoOpen(true);
      return;
    }

    const data = await findContactByUserId({
      variables: {
        id: otherChatMember?.id ?? "",
      },
    });

    const contact = data?.data?.findContactByUserId;

    if (contact) {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <>
      <ChatHeader
        type={type}
        name={name ?? ""}
        members={members ?? []}
        currentUser={currentUser}
        callBack={handleCallBack}
      />
      <ChatMessages
        currentUser={currentUser}
        messages={messages}
        latestAddedMessageId={latestAddedMessageId}
      />
      <NewMessageBox
        id={id}
        userId={otherChatMember ? otherChatMember.id : null}
        checkIsBlocked={checkIsBlocked}
      />
    </>
  );
};

export default ChatContent;
