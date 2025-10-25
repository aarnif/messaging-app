import { useMatch, useNavigate } from "react-router";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { IoChevronBack } from "react-icons/io5";
import {
  FIND_CONTACT_BY_ID,
  FIND_PRIVATE_CHAT_WITH_CONTACT,
} from "../graphql/queries";
import { TOGGLE_BLOCK_CONTACT } from "../graphql/mutations";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";
import Button from "../ui/Button";
import type { User, Contact } from "../__generated__/graphql";
import { useState } from "react";

const ContactContent = ({
  currentUser,
  contact,
}: {
  currentUser: User;
  contact: Contact;
}) => {
  const navigate = useNavigate();
  const { id, name, username, about } = contact.contactDetails;

  const [data] = useLazyQuery(FIND_PRIVATE_CHAT_WITH_CONTACT, {
    fetchPolicy: "network-only",
  });

  const [mutate] = useMutation(TOGGLE_BLOCK_CONTACT);

  const [isBlocked, setIsBlocked] = useState(contact.isBlocked);

  const handleChatWithContact = async () => {
    const hasChatWithContact = await data({
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
    const data = await mutate({
      variables: {
        id: contact.id,
      },
    });

    if (data) {
      setIsBlocked((prev) => !prev);
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
        </div>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Button
          type="button"
          variant="tertiary"
          text="Chat"
          onClick={handleChatWithContact}
        />
        <Button
          type="button"
          variant={!isBlocked ? "danger" : "tertiary"}
          text={!isBlocked ? "Block Contact" : "Unblock Contact"}
          onClick={handleToggleBlockContact}
        />
      </div>
    </div>
  );
};

const Contact = ({ currentUser }: { currentUser: User }) => {
  const match = useMatch("/contacts/:id")?.params;
  const { data, loading } = useQuery(FIND_CONTACT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  const contact = data?.findContactById;

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-white dark:bg-slate-800">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : !contact ? (
        <NotFound entity="Contact" />
      ) : (
        <ContactContent currentUser={currentUser} contact={contact} />
      )}
    </div>
  );
};

export default Contact;
