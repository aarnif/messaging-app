import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router";
import type { Contact as ContactType, User } from "../../__generated__/graphql";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { REMOVE_CONTACT, TOGGLE_BLOCK_CONTACT } from "../../graphql/mutations";
import {
  ALL_CONTACTS_BY_USER,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
} from "../../graphql/queries";
import useModal from "../../hooks/useModal";

const ContactContent = ({
  currentUser,
  contact,
  isBlockedByUser,
}: {
  currentUser: User;
  contact: ContactType;
  isBlockedByUser: boolean;
}) => {
  const modal = useModal();
  const navigate = useNavigate();
  const { id, name, username, about, avatar } = contact.contactDetails;

  const [findPrivateChatWithContact] = useLazyQuery(
    FIND_PRIVATE_CHAT_WITH_CONTACT,
    {
      fetchPolicy: "network-only",
    },
  );

  const [toggleBlockContact] = useMutation(TOGGLE_BLOCK_CONTACT);
  const [removeContact] = useMutation(REMOVE_CONTACT, {
    refetchQueries: [ALL_CONTACTS_BY_USER],
  });

  const [isBlocked, setIsBlocked] = useState(contact.isBlocked);

  const handleChatWithContact = async () => {
    const hasChatWithContact = await findPrivateChatWithContact({
      variables: {
        id,
      },
    });

    const chat = hasChatWithContact.data?.findPrivateChatWithContact;

    if (chat) {
      navigate(`/chats/${chat.id}`);
      return;
    }

    const newPrivateChatInfo = {
      name: name,
      description: null,
      members: [currentUser, contact.contactDetails],
      avatar: null,
    };

    localStorage.setItem("new-chat-info", JSON.stringify(newPrivateChatInfo));
    navigate("/chats/new");
  };

  const handleToggleBlockContact = async () => {
    const data = await toggleBlockContact({
      variables: {
        id: contact.id,
      },
    });

    if (data) {
      setIsBlocked((prev) => !prev);
    }
  };

  const handleRemoveContact = async () => {
    const data = await removeContact({
      variables: {
        id: contact.id,
      },
    });

    if (data) {
      navigate("/contacts/removed");
    }
  };

  return (
    <div className="flex w-full grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
      <div className="flex w-full justify-center">
        <button
          data-testid="go-back-button"
          className="absolute left-2 cursor-pointer sm:hidden"
          onClick={() => navigate("/contacts")}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Contact
        </h2>
      </div>
      <div className="flex grow flex-col items-center gap-2.5">
        <Avatar name={name} size="large" avatar={avatar} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <h4 className="font-oswald font-semibold text-slate-900 dark:text-slate-50">
              {name}
            </h4>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
              @{username}
            </p>
          </div>
          <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
            {about}
          </p>
          {isBlocked && (
            <p className="font-semibold text-red-600 dark:text-red-500">
              You have blocked the contact.
            </p>
          )}
          {isBlockedByUser && (
            <p className="font-semibold text-red-600 dark:text-red-500">
              Contact has blocked you.
            </p>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Button
          type="button"
          variant="tertiary"
          text="Chat"
          disabled={isBlockedByUser}
          onClick={handleChatWithContact}
        />
        <Button
          type="button"
          variant={!isBlocked ? "delete" : "tertiary"}
          text={!isBlocked ? "Block Contact" : "Unblock Contact"}
          onClick={() =>
            modal({
              type: !isBlocked ? "danger" : "success",
              title: !isBlocked ? "Block Contact?" : "Unblock Contact",
              message: !isBlocked
                ? "Are you sure you want to block the contact?"
                : "Are you sure you want to unblock the contact?",
              close: "Cancel",
              confirm: !isBlocked ? "Block" : "Unblock",
              onConfirm: handleToggleBlockContact,
            })
          }
        />
        <Button
          type="button"
          variant="delete"
          text="Remove Contact"
          onClick={() =>
            modal({
              type: "danger",
              title: "Remove Contact?",
              message: "Are you sure you want to remove the contact?",
              close: "Cancel",
              confirm: "Remove",
              onConfirm: handleRemoveContact,
            })
          }
        />
      </div>
    </div>
  );
};

export default ContactContent;
