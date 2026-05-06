import { useQuery } from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import type { User } from "../__generated__/graphql";
import { DEBOUNCE_DELAY } from "../constants";
import { ALL_CONTACTS_BY_USER } from "../graphql/queries";
import useErrorMessage from "../hooks/useErrorMessage";
import useField from "../hooks/useField";
import type { SelectableUser } from "../types";
import Error from "./ui/Error";
import FormField from "./ui/FormField";
import ModalLayout from "./ui/ModalLayout";
import Overlay from "./ui/Overlay";
import SearchBox from "./ui/SearchBox";
import SelectUsersList from "./ui/SelectUsersList";
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
  const navigate = useNavigate();
  const name = useField("name", "text", "Enter name here...");
  const description = useField(
    "description",
    "text",
    "Enter description here...",
  );
  const [users, setUsers] = useState<SelectableUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { message, showMessage, closeMessage } = useErrorMessage();
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: debouncedSearch,
    },
  });

  useEffect(() => {
    if (data) {
      setUsers(
        data?.allContactsByUser?.map((contact) => ({
          ...contact.contactDetails,
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

    const selectedChatMembers = users
      .filter((user) => user.isSelected)
      .map((user) => {
        return {
          id: user.id,
          username: user.username,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          is24HourClock: user.is24HourClock,
        };
      });

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
      <ModalLayout
        title="New Group Chat"
        onCancel={() => setIsNewGroupChatModalOpen(false)}
        onConfirm={handleCreateGroupChat}
      >
        <AnimatePresence>
          {message && <Error message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <SearchBox searchWord={searchWord} />
        {loading ? (
          <Spinner />
        ) : (
          <SelectUsersList
            users={users}
            setSelectedIds={setSelectedIds}
            notFoundMessage="No contacts found"
          />
        )}
        <FormField field={name} />
        <FormField field={description} />
        <p className="-my-1.5 w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          {selectedIds.size} contacts selected
        </p>
      </ModalLayout>
    </Overlay>
  );
};

export default NewGroupChatModal;
