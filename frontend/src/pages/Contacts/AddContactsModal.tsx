import { useMutation, useQuery } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { useDebounce } from "use-debounce";
import Notify from "../../components/ui/Notify";
import Overlay from "../../components/ui/Overlay";
import SearchBox from "../../components/ui/SearchBox";
import Spinner from "../../components/ui/Spinner";
import { DEBOUNCE_DELAY } from "../../constants";
import { ADD_CONTACTS } from "../../graphql/mutations";
import { ALL_CONTACTS_BY_USER, NON_CONTACT_USERS } from "../../graphql/queries";
import useField from "../../hooks/useField";
import useNotifyMessage from "../../hooks/useNotifyMessage";
import useResponsiveWidth from "../../hooks/useResponsiveWidth";
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
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const width = useResponsiveWidth();

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

  const isMobileScreen = width <= 640;

  return (
    <Overlay
      key={"Overlay"}
      onClick={() => setIsAddContactsModalOpen(false)}
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
            onClick={() => setIsAddContactsModalOpen(false)}
          >
            <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Add Contacts
          </h2>
          <button
            data-testid="add-contacts-button"
            className="cursor-pointer"
            onClick={handleAddContacts}
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
          <SelectUserList users={users} setSelectedIds={setSelectedIds} />
        )}
      </motion.div>
    </Overlay>
  );
};

export default AddContactsModal;
