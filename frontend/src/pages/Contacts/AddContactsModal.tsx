import { useMutation, useQuery } from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import Error from "../../components/ui/Error";
import ModalLayout from "../../components/ui/ModalLayout";
import Overlay from "../../components/ui/Overlay";
import SearchBox from "../../components/ui/SearchBox";
import Spinner from "../../components/ui/Spinner";
import { DEBOUNCE_DELAY } from "../../constants";
import { ADD_CONTACTS } from "../../graphql/mutations";
import { ALL_CONTACTS_BY_USER, NON_CONTACT_USERS } from "../../graphql/queries";
import useErrorMessage from "../../hooks/useErrorMessage";
import useField from "../../hooks/useField";
import type { AddContactOption } from "../../types";
import SelectUserList from "./SelectUserList";

const AddContactsModal = ({
  setIsAddContactsModalOpen,
}: {
  setIsAddContactsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username...",
  );
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);
  const { message, showMessage, closeMessage } = useErrorMessage();

  const [users, setUsers] = useState<AddContactOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, loading } = useQuery(NON_CONTACT_USERS, {
    variables: {
      search: debouncedSearch,
    },
    fetchPolicy: "network-only",
  });

  const [mutate] = useMutation(ADD_CONTACTS, {
    onError: (error) => {
      console.log(error);
    },
    refetchQueries: [ALL_CONTACTS_BY_USER],
  });

  useEffect(() => {
    if (data) {
      setUsers(
        data?.nonContactUsers?.map((user) => ({
          ...user,
          isSelected: selectedIds.has(user.id),
        })),
      );
    }
  }, [data, selectedIds]);

  const handleAddContacts = async () => {
    if (selectedIds.size === 0) {
      showMessage("Select at least one contact.");
    }

    const data = await mutate({
      variables: {
        ids: Array.from(selectedIds),
      },
    });

    if (data) {
      setIsAddContactsModalOpen(false);
      setSelectedIds(new Set());
    }
  };

  return (
    <Overlay
      key={"Overlay"}
      onClick={() => setIsAddContactsModalOpen(false)}
      animation="slideRight"
      additionalClassName="flex items-end justify-center sm:items-center"
    >
      <ModalLayout
        title="Add Contacts"
        onCancel={() => setIsAddContactsModalOpen(false)}
        onConfirm={handleAddContacts}
      >
        <AnimatePresence>
          {message && <Error message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <SearchBox searchWord={searchWord} />
        {loading ? (
          <Spinner />
        ) : (
          <SelectUserList users={users} setSelectedIds={setSelectedIds} />
        )}
      </ModalLayout>
    </Overlay>
  );
};

export default AddContactsModal;
