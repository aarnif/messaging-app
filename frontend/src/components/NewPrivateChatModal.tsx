import { useLazyQuery, useQuery } from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import type { Contact, User } from "../__generated__/graphql";
import Overlay from "../components/ui/Overlay";
import { DEBOUNCE_DELAY } from "../constants";
import {
  CONTACTS_WITHOUT_PRIVATE_CHAT,
  IS_BLOCKED_BY_USER,
} from "../graphql/queries";
import useField from "../hooks/useField";
import useNotifyMessage from "../hooks/useNotifyMessage";
import ModalLayout from "./ui/ModalLayout";
import Notify from "./ui/Notify";
import SearchBox from "./ui/SearchBox";
import SelectUserButton from "./ui/SelectUserButton";
import Spinner from "./ui/Spinner";

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
    <div className="flex h-0 w-full grow flex-col overflow-y-scroll bg-white pr-4 dark:bg-slate-800">
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

const NewPrivateChatModal = ({
  currentUser,
  setIsNewPrivateChatModalOpen,
}: {
  currentUser: User;
  setIsNewPrivateChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username...",
  );
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const { data, loading } = useQuery(CONTACTS_WITHOUT_PRIVATE_CHAT, {
    variables: {
      search: debouncedSearch,
    },
    fetchPolicy: "network-only",
  });

  const [isBlockedByUser] = useLazyQuery(IS_BLOCKED_BY_USER);

  const contacts = data?.contactsWithoutPrivateChat;

  const handleCreatePrivateChat = async () => {
    if (!selectedContact) {
      showMessage("Please select a contact to create a chat with");
      return;
    }

    const chosenContact = contacts?.find(
      (contact) => contact.id === selectedContact,
    );

    const isBlockedByContact = await isBlockedByUser({
      variables: {
        id: chosenContact?.contactDetails.id ?? "",
      },
    });

    if (isBlockedByContact.data?.isBlockedByUser) {
      showMessage("Contact has blocked you.");
      return;
    }

    const newPrivateChatInfo = {
      name: chosenContact?.contactDetails.name,
      description: null,
      members: [currentUser, chosenContact?.contactDetails],
      avatar: null,
    };

    localStorage.setItem("new-chat-info", JSON.stringify(newPrivateChatInfo));
    navigate("/chats/new");
    setIsNewPrivateChatModalOpen(false);
  };

  return (
    <Overlay
      key={"Overlay"}
      onClick={() => setIsNewPrivateChatModalOpen(false)}
      animation="slideRight"
      additionalClassName="flex items-end justify-center sm:items-center"
    >
      <ModalLayout
        title="New Private Chat"
        onCancel={() => setIsNewPrivateChatModalOpen(false)}
        onConfirm={handleCreatePrivateChat}
      >
        <AnimatePresence>
          {message && <Notify message={message} closeMessage={closeMessage} />}
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
      </ModalLayout>
    </Overlay>
  );
};

export default NewPrivateChatModal;
