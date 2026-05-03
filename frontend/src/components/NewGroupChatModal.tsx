import { useQuery } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import type { User } from "../__generated__/graphql";
import { DEBOUNCE_DELAY } from "../constants";
import { ALL_CONTACTS_BY_USER } from "../graphql/queries";
import useField from "../hooks/useField";
import useNotifyMessage from "../hooks/useNotifyMessage";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import type { UserContact } from "../types";
import FormField from "./ui/FormField";
import Notify from "./ui/Notify";
import Overlay from "./ui/Overlay";
import SearchBox from "./ui/SearchBox";
import SelectContactsList from "./ui/SelectContactsList";
import Spinner from "./ui/Spinner";

const NewGroupChatModal = ({
  currentUser,
  setIsNewGroupChatModalOpen,
}: {
  currentUser: User;
  setIsNewGroupChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username...",
  );
  const width = useResponsiveWidth();
  const navigate = useNavigate();
  const name = useField("name", "text", "Enter name here...");
  const description = useField(
    "description",
    "text",
    "Enter description here...",
  );
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const isMobileScreen = width <= 640;

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: debouncedSearch,
    },
  });

  useEffect(() => {
    if (data) {
      setContacts(
        data?.allContactsByUser?.map((contact) => ({
          ...contact,
          isSelected: selectedIds.has(contact.contactDetails.id),
        })),
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
    setIsNewGroupChatModalOpen(false);
  };

  return (
    <Overlay
      key={"Overlay"}
      onClick={() => setIsNewGroupChatModalOpen(false)}
      animation="slideRight"
      additionalClassName="flex items-end justify-center sm:items-center"
    >
      <motion.div
        className="flex h-[90vh] grow flex-col items-center gap-4 rounded-t-lg rounded-b-none bg-white px-2 py-4 sm:h-full sm:max-h-125 sm:max-w-125 sm:rounded-lg dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        initial={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
        exit={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        transition={{ type: "tween" }}
      >
        <div className="flex w-full justify-between">
          <button
            data-testid="close-modal-button"
            className="cursor-pointer"
            onClick={() => setIsNewGroupChatModalOpen(false)}
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
          {message && <Notify message={message} closeMessage={closeMessage} />}
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
      </motion.div>
    </Overlay>
  );
};

export default NewGroupChatModal;
