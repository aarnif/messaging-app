import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import useField from "../hooks/useField";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import useNotifyMessage from "../hooks/useNotifyMessage";
import SearchBox from "../ui/SearchBox";
import type { InputField, UserContact } from "../types";
import {
  ALL_CONTACTS_BY_USER,
  CONTACTS_WITHOUT_PRIVATE_CHAT,
} from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import type { User, Contact } from "../__generated__/graphql";
import Spinner from "../ui/Spinner";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import { useNavigate } from "react-router";
import SelectContactsList from "../ui/SelectContactsList";
import SelectUserButton from "../ui/SelectUserButton";

export const SelectContactList = ({
  contacts,
  selectedContact,
  setSelectedContact,
}: {
  contacts: Contact[];
  selectedContact: string | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  if (contacts.length === 0) {
    return (
      <p className="mt-8 w-full text-center text-xl font-semibold text-slate-600 dark:text-slate-300">
        No contacts found
      </p>
    );
  }

  return (
    <div className="flex h-0 w-full flex-grow flex-col overflow-y-scroll bg-white pr-4 dark:bg-slate-800">
      {contacts.map((contact) => (
        <SelectUserButton
          key={contact.id}
          user={contact.contactDetails}
          isSelected={contact.id === selectedContact}
          callback={() => {
            setSelectedContact(contact.id);
          }}
        />
      ))}
    </div>
  );
};

const PrivateChatContent = ({
  currentUser,
  searchWord,
  setIsNewChatModalOpen,
  setNewChatModalType,
}: {
  currentUser: User;
  searchWord: InputField;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewChatModalType: React.Dispatch<
    React.SetStateAction<"private" | "group" | null>
  >;
}) => {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const { message, showMessage } = useNotifyMessage();

  const { data, loading } = useQuery(CONTACTS_WITHOUT_PRIVATE_CHAT, {
    variables: {
      search: searchWord.value,
    },
    fetchPolicy: "network-only",
  });

  const contacts = data?.contactsWithoutPrivateChat;

  const handleCreatePrivateChat = async () => {
    if (!selectedContact) {
      showMessage("Please select a contact to create a chat with");
      return;
    }

    const chosenContact = contacts?.find(
      (contact) => contact.id === selectedContact
    );

    const newPrivateChatInfo = {
      name: chosenContact?.contactDetails.name,
      description: null,
      members: [currentUser, chosenContact?.contactDetails],
      avatar: null,
    };

    localStorage.setItem("new-chat-info", JSON.stringify(newPrivateChatInfo));
    navigate("/chats/new");
    setIsNewChatModalOpen(false);
    setNewChatModalType(null);
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
          contacts={contacts ?? []}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
      )}
    </>
  );
};

const GroupChatContent = ({
  currentUser,
  searchWord,
  setIsNewChatModalOpen,
  setNewChatModalType,
}: {
  currentUser: User;
  searchWord: InputField;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewChatModalType: React.Dispatch<
    React.SetStateAction<"private" | "group" | null>
  >;
}) => {
  const navigate = useNavigate();
  const name = useField("name", "text", "Enter name here...");
  const description = useField(
    "description",
    "text",
    "Enter description here..."
  );
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { message, showMessage } = useNotifyMessage();

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: searchWord.value,
    },
  });

  useEffect(() => {
    if (data) {
      setContacts(
        data?.allContactsByUser?.map((contact) => ({
          ...contact,
          isSelected: selectedIds.has(contact.contactDetails.id),
        }))
      );
    }
  }, [data, selectedIds]);

  const handleCreateGroupChat = async () => {
    if (name.value.length < 3) {
      showMessage("Chat name must be at least three characters long");
      return;
    }

    if (selectedIds.size < 2) {
      showMessage("Chat must have at least two members");
      return;
    }

    const selectedChatMembers = contacts
      .filter((contact) => contact.isSelected)
      .map((contact) => contact.contactDetails);

    const newGroupChatInfo = {
      name: name.value || null,
      description: description.value || null,
      members: [currentUser, ...selectedChatMembers],
      avatar: null,
    };

    localStorage.setItem("new-chat-info", JSON.stringify(newGroupChatInfo));
    navigate("/chats/new");
    setIsNewChatModalOpen(false);
    setNewChatModalType(null);
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
          New Group Chat
        </h2>
        <button
          data-testid="create-chat-button"
          className="cursor-pointer"
          onClick={handleCreateGroupChat}
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
        <SelectContactsList
          contacts={contacts}
          setSelectedIds={setSelectedIds}
        />
      )}
      <FormField field={name} />
      <FormField field={description} />
      <p className="-my-1.5 w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        {selectedIds.size} contacts selected
      </p>
    </>
  );
};

const NewChatModal = ({
  currentUser,
  newChatModalType,
  setIsNewChatModalOpen,
  setNewChatModalType,
}: {
  currentUser: User;
  newChatModalType: "private" | "group" | null;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewChatModalType: React.Dispatch<
    React.SetStateAction<"private" | "group" | null>
  >;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username..."
  );
  const width = useResponsiveWidth();

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
        {newChatModalType === "private" ? (
          <PrivateChatContent
            currentUser={currentUser}
            searchWord={searchWord}
            setIsNewChatModalOpen={setIsNewChatModalOpen}
            setNewChatModalType={setNewChatModalType}
          />
        ) : (
          <GroupChatContent
            currentUser={currentUser}
            searchWord={searchWord}
            setIsNewChatModalOpen={setIsNewChatModalOpen}
            setNewChatModalType={setNewChatModalType}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default NewChatModal;
