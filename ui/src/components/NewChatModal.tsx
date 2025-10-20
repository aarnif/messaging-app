import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import useField from "../hooks/useField";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import useNotifyMessage from "../hooks/useNotifyMessage";
import SearchBox from "../ui/SearchBox";
import type { InputField } from "../types";
import { ALL_CONTACTS_BY_USER } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import type { Maybe, User, Contact } from "../__generated__/graphql";
import { MdCheck } from "react-icons/md";
import Spinner from "../ui/Spinner";
import Notify from "../ui/Notify";
import { useNavigate } from "react-router";

const SelectContactItem = ({
  contact,
  selectedContact,
  setSelectedContact,
}: {
  contact: Maybe<Contact> | undefined;
  selectedContact: string | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  if (!contact || !contact?.contactDetails) {
    return null;
  }

  const { username, name, about } = contact.contactDetails;

  const isSelected = contact.id === selectedContact;

  return (
    <button
      data-testid={isSelected && "selected"}
      onClick={() => {
        setSelectedContact(contact.id);
      }}
      className="flex w-full cursor-pointer items-center"
    >
      <div className="flex flex-grow gap-4 p-2">
        <img
          className="h-12 w-12 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div className="flex w-full flex-col gap-1 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {name}
            </h2>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              @{username}
            </p>
          </div>
          <p className="text-left text-xs font-medium text-slate-700 dark:text-slate-200">
            {about}
          </p>
        </div>
      </div>

      {isSelected ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-green-600 bg-green-600">
          <MdCheck size={20} className="text-white" />
        </div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300"></div>
      )}
    </button>
  );
};

export const SelectContactList = ({
  contacts,
  selectedContact,
  setSelectedContact,
}: {
  contacts: Maybe<Array<Maybe<Contact>>> | undefined;
  selectedContact: string | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  if (!contacts?.length) {
    return (
      <p className="mt-8 w-full text-center text-xl font-semibold text-slate-600 dark:text-slate-300">
        No contacts found
      </p>
    );
  }

  return (
    <div className="flex h-0 w-full flex-grow flex-col overflow-y-scroll bg-white pr-4 dark:bg-slate-800">
      {contacts.map((contact) => (
        <SelectContactItem
          key={contact?.id}
          contact={contact}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      ))}
    </div>
  );
};

const PrivateChatContent = ({
  currentUser,
  searchWord,
  loading,
  contacts,
  setIsNewChatModalOpen,
}: {
  currentUser: User;
  searchWord: InputField;
  loading: boolean;
  contacts: Maybe<Array<Maybe<Contact>>> | undefined;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const { message, showMessage } = useNotifyMessage();

  const handleCreatePrivateChat = async () => {
    if (!selectedContact) {
      showMessage("Please select a contact to create a chat with");
      return;
    }

    const chosenContact = contacts?.find(
      (contact) => contact?.id === selectedContact
    );

    const newPrivateChatInfo = {
      name: chosenContact?.contactDetails?.name,
      description: null,
      members: [currentUser, chosenContact?.contactDetails],
      avatar: null,
    };

    localStorage.setItem("new-chat-info", JSON.stringify(newPrivateChatInfo));
    navigate("/chats/new");
    setIsNewChatModalOpen(false);
  };

  return (
    <>
      <div className="flex w-full justify-between">
        <button
          data-testid="close-modal-button"
          className="cursor-pointer"
          onClick={() => setIsNewChatModalOpen(false)}
        >
          <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          New Private Chat
        </h2>
        <button
          data-testid="create-chat-button"
          className="cursor-pointer"
          onClick={handleCreatePrivateChat}
        >
          <IoChevronForward className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <AnimatePresence>
        {message && <Notify message={message} />}
      </AnimatePresence>
      <SearchBox searchWord={searchWord} />
      {loading ? (
        <Spinner />
      ) : (
        <SelectContactList
          contacts={contacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      )}
    </>
  );
};

const NewChatModal = ({
  currentUser,
  setIsNewChatModalOpen,
}: {
  currentUser: User;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username..."
  );
  const width = useResponsiveWidth();

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: searchWord.value,
    },
  });

  const isMobileScreen = width <= 640;

  return (
    <motion.div
      data-testid="overlay"
      key={"Overlay"}
      className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => setIsNewChatModalOpen(false)}
      exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
      transition={{ type: "tween" }}
    >
      <motion.div
        className="flex h-[90vh] flex-grow flex-col items-center gap-4 rounded-t-xl rounded-b-none bg-white px-2 py-4 sm:h-full sm:max-h-[500px] sm:max-w-[500px] sm:rounded-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        initial={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        animate={{ y: 0, opacity: 1 }}
        exit={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        transition={{ type: "tween" }}
      >
        <PrivateChatContent
          currentUser={currentUser}
          searchWord={searchWord}
          loading={loading}
          contacts={data?.allContactsByUser}
          setIsNewChatModalOpen={setIsNewChatModalOpen}
        />
      </motion.div>
    </motion.div>
  );
};

export default NewChatModal;
