import useField from "../hooks/useField";
import { ALL_CONTACTS_BY_USER } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import Spinner from "../ui/Spinner";
import MenuHeader from "../ui/MenuHeader";
import type { Contact } from "../__generated__/graphql";
import useResponsiveWidth from "../hooks/useResponsiveWidth";

const AddContactsModal = ({
  setIsAddContactsModalOpen,
}: {
  setIsAddContactsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const width = useResponsiveWidth();

  const isMobileScreen = width <= 640;

  return (
    <motion.div
      data-testid="overlay"
      key={"Overlay"}
      className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => setIsAddContactsModalOpen(false)}
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
            data-testid="create-chat-button"
            className="cursor-pointer"
            onClick={() => console.log("Add contacts")}
          >
            <IoChevronForward className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContactItem = ({ contact }: { contact: Contact }) => {
  const { id, contactDetails } = contact;

  const { name, username, about } = contactDetails;

  return (
    <NavLink
      to={`/contacts/${id}`}
      className={({ isActive }) =>
        isActive
          ? "rounded-xl bg-slate-200 transition-colors dark:bg-slate-700"
          : "rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      }
    >
      <div className="flex gap-4 p-2">
        <img
          className="h-12 w-12 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div className="flex w-full flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {name}
            </h2>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              @{username}
            </p>
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {about}
          </p>
        </div>
      </div>
    </NavLink>
  );
};

const ListMenu = ({
  setIsAddContactsModalOpen,
}: {
  setIsAddContactsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username..."
  );

  const { data, loading } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: searchWord.value,
    },
  });

  const location = useLocation();
  const showListOnMobile = location.pathname === "/contacts";

  const contacts = data?.allContactsByUser;
  const hasContacts = contacts && contacts.length > 0;

  return (
    <div
      className={`flex flex-grow flex-col border-r border-slate-200 bg-white sm:max-w-[360px] dark:border-slate-700 dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <MenuHeader
        title="Contacts"
        searchWord={searchWord}
        callback={() => setIsAddContactsModalOpen(true)}
      />
      {loading ? (
        <div className="mt-8">
          <Spinner />
        </div>
      ) : hasContacts ? (
        <div className="flex h-0 flex-grow flex-col gap-2 overflow-y-auto p-2">
          {contacts.map(
            (contact) =>
              contact && <ContactItem key={contact.id} contact={contact} />
          )}
        </div>
      ) : (
        <div className="px-4 py-2">
          <h2 className="font-bold text-slate-700 dark:text-slate-200">
            No contacts found.
          </h2>
        </div>
      )}
    </div>
  );
};

const Contacts = () => {
  const [isAddContactsModalOpen, setIsAddContactsModalOpen] = useState(false);
  return (
    <div className="flex flex-grow">
      <ListMenu setIsAddContactsModalOpen={setIsAddContactsModalOpen} />
      <Outlet />
      <AnimatePresence>
        {isAddContactsModalOpen && (
          <AddContactsModal
            setIsAddContactsModalOpen={setIsAddContactsModalOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contacts;
