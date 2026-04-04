import { useMutation, useQuery } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { useDebounce } from "use-debounce";
import type { Chat as ChatType } from "../../__generated__/graphql";
import FormField from "../../components/ui/FormField";
import Notify from "../../components/ui/Notify";
import SearchBox from "../../components/ui/SearchBox";
import SelectContactsList from "../../components/ui/SelectContactsList";
import { DEBOUNCE_DELAY } from "../../constants";
import { EDIT_CHAT } from "../../graphql/mutations";
import { ALL_CONTACTS_BY_USER } from "../../graphql/queries";
import useField from "../../hooks/useField";
import useNotifyMessage from "../../hooks/useNotifyMessage";
import useResponsiveWidth from "../../hooks/useResponsiveWidth";
import type { UserContact } from "../../types";

const EditChatModal = ({
  chat,
  setIsEditChatOpen,
}: {
  chat: ChatType;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const width = useResponsiveWidth();
  const isMobileScreen = width <= 640;
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username...",
  );
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const name = useField("name", "text", "Enter name here...", chat?.name ?? "");
  const description = useField(
    "description",
    "text",
    "Enter description here...",
    chat?.description ?? "",
  );

  const { data } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: debouncedSearch,
    },
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set([...chat.members.map((member) => member.id)]),
  );
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const selectedContacts = contacts.filter((contact) => contact.isSelected);

  const [editChat] = useMutation(EDIT_CHAT, {
    onError: (error) => {
      console.log(error);
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

  const handleEditChat = async () => {
    if (name.value.length < 3) {
      showMessage("Chat name must be at least three characters long");
      return;
    }

    await editChat({
      variables: {
        input: {
          id: chat.id,
          name: name.value,
          description: description.value ?? null,
          members: selectedContacts.map((contact) => contact.contactDetails.id),
        },
      },
    });
    setIsEditChatOpen(false);
  };

  return (
    <motion.div
      data-testid="overlay"
      key={"Overlay"}
      className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => setIsEditChatOpen(false)}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
      transition={{ type: "tween" }}
    >
      <motion.div
        data-testid="edit-chat-modal"
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
            data-testid="close-button"
            className="cursor-pointer"
            onClick={() => setIsEditChatOpen(false)}
          >
            <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Edit Chat
          </h2>
          <button
            data-testid="submit-button"
            className="cursor-pointer"
            onClick={handleEditChat}
          >
            <IoChevronForward className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
        <AnimatePresence>
          {message && <Notify message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <SearchBox searchWord={searchWord} />
        <SelectContactsList
          contacts={contacts}
          setSelectedIds={setSelectedIds}
        />
        <div className="flex w-full flex-col gap-4">
          <FormField field={name} />
          <FormField field={description} />
        </div>
        <p className="-my-1.5 w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          {selectedContacts.length} contacts selected
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EditChatModal;
