import { useQuery } from "@apollo/client/react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router";
import { useDebounce } from "use-debounce";
import MenuHeader from "../../components/ui/MenuHeader";
import Skeleton from "../../components/ui/Skeleton";
import { DEBOUNCE_DELAY } from "../../constants";
import { ALL_CONTACTS_BY_USER } from "../../graphql/queries";
import useField from "../../hooks/useField";
import ContactItem from "./ContactItem";

const ListMenu = ({
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

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: debouncedSearch,
    },
  });

  const location = useLocation();
  const showListOnMobile = location.pathname === "/contacts";

  const contacts = data?.allContactsByUser;
  const hasContacts = contacts && contacts.length > 0;

  return (
    <div
      className={`flex grow flex-col border-r border-slate-200 bg-white sm:max-w-90 dark:border-slate-700 dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <MenuHeader
        title="Contacts"
        searchWord={searchWord}
        buttonTestId="add-new-contacts"
        callback={() => setIsAddContactsModalOpen(true)}
      />
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <Skeleton key="skeleton" />
        ) : hasContacts ? (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-0 grow flex-col gap-2 overflow-y-auto p-2"
          >
            {contacts.map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </motion.div>
        ) : (
          <div key="no-contacts" className="px-4 py-2">
            <h2 className="font-bold text-slate-700 dark:text-slate-200">
              No contacts found.
            </h2>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListMenu;
