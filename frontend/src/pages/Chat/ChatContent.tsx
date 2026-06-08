import { useLazyQuery } from "@apollo/client/react";
import { useNavigate } from "react-router";
import type { Chat as ChatType, User } from "../../__generated__/graphql";
import { ContactLookupBy } from "../../__generated__/graphql";
import ChatHeader from "../../components/ui/ChatHeader";
import { FIND_CONTACT, IS_BLOCKED_BY_USER } from "../../graphql/queries";
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
  const [findContact] = useLazyQuery(FIND_CONTACT, {
    fetchPolicy: "network-only",
  });

  const { id, isGroupChat, name, members, messages } = chat;

  const otherChatMember = !isGroupChat
    ? members.find((member) => member.id !== currentUser.id)
    : null;

  const handleCallBack = async () => {
    if (isGroupChat) {
      setIsChatInfoOpen(true);
      return;
    }

    const data = await findContact({
      variables: {
        input: {
          id: otherChatMember?.userId ?? "",
          lookupBy: ContactLookupBy.UserId,
        },
      },
    });

    const contact = data.data?.findContact;

    if (contact) {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <>
      <ChatHeader
        isGroupChat={isGroupChat}
        name={name ?? ""}
        members={members}
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
