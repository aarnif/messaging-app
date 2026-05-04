import { useMutation, useQuery } from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import type { Chat as ChatType } from "../../__generated__/graphql";
import Error from "../../components/ui/Error";
import FormField from "../../components/ui/FormField";
import ModalLayout from "../../components/ui/ModalLayout";
import Overlay from "../../components/ui/Overlay";
import SearchBox from "../../components/ui/SearchBox";
import SelectContactsList from "../../components/ui/SelectContactsList";
import { DEBOUNCE_DELAY } from "../../constants";
import { EDIT_CHAT } from "../../graphql/mutations";
import { ALL_CONTACTS_BY_USER } from "../../graphql/queries";
import useErrorMessage from "../../hooks/useErrorMessage";
import useField from "../../hooks/useField";
import type { UserContact } from "../../types";

const EditChatModal = ({
  chat,
  setIsEditChatOpen,
}: {
  chat: ChatType;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { message, showMessage, closeMessage } = useErrorMessage();
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
    <Overlay
      key={"Overlay"}
      onClick={() => setIsEditChatOpen(false)}
      animation="slideRight"
      additionalClassName="flex items-end justify-center sm:items-center"
    >
      <ModalLayout
        title="Edit Chat"
        onCancel={() => setIsEditChatOpen(false)}
        onConfirm={handleEditChat}
      >
        <AnimatePresence>
          {message && <Error message={message} closeMessage={closeMessage} />}
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
      </ModalLayout>
    </Overlay>
  );
};

export default EditChatModal;
