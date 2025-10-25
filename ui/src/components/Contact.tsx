import { useMatch, useNavigate } from "react-router";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { IoChevronBack } from "react-icons/io5";
import {
  ALL_CONTACTS_BY_USER,
  FIND_CONTACT_BY_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
  IS_BLOCKED_BY_USER,
} from "../graphql/queries";
import { TOGGLE_BLOCK_CONTACT, REMOVE_CONTACT } from "../graphql/mutations";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";
import Button from "../ui/Button";
import type { User, Contact } from "../__generated__/graphql";
import { useState } from "react";

const ContactContent = ({
  currentUser,
  contact,
  isBlockedByUser,
}: {
  currentUser: User;
  contact: Contact;
  isBlockedByUser: boolean;
}) => {
  const navigate = useNavigate();
  const { id, name, username, about } = contact.contactDetails;

  const [findPrivateChatWithContact] = useLazyQuery(
    FIND_PRIVATE_CHAT_WITH_CONTACT,
    {
      fetchPolicy: "network-only",
    }
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
      navigate("/contacts/deleted");
    }
  };

  return (
    <div className="flex w-full flex-grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
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
      <div className="flex flex-grow flex-col items-center gap-2.5">
        <img
          className="h-20 w-20 rounded-full"
          src="https://i.ibb.co/cNxwtNN/profile-placeholder.png"
        />
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
          variant={!isBlocked ? "danger" : "tertiary"}
          text={!isBlocked ? "Block Contact" : "Unblock Contact"}
          onClick={handleToggleBlockContact}
        />
        <Button
          type="button"
          variant="danger"
          text="Remove Contact"
          onClick={handleRemoveContact}
        />
      </div>
    </div>
  );
};

const Contact = ({ currentUser }: { currentUser: User }) => {
  const match = useMatch("/contacts/:id")?.params;

  const { data: contactData, loading: contactLoading } = useQuery(
    FIND_CONTACT_BY_ID,
    {
      variables: {
        id: match?.id ?? "",
      },
    }
  );

  const { data: blockedData, loading: blockedLoading } = useQuery(
    IS_BLOCKED_BY_USER,
    {
      variables: {
        id: match?.id ?? "",
      },
    }
  );

  const contact = contactData?.findContactById;
  const isBlockedByUser = blockedData?.isBlockedByUser;

  const loading = contactLoading || blockedLoading;

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-white dark:bg-slate-800">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : !contact ? (
        <NotFound entity="Contact" />
      ) : (
        <ContactContent
          currentUser={currentUser}
          contact={contact}
          isBlockedByUser={isBlockedByUser ? true : false}
        />
      )}
    </div>
  );
};

export default Contact;
