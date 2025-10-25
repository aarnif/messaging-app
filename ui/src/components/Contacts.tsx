import useField from "../hooks/useField";
import { ALL_CONTACTS_BY_USER } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import { NavLink, Outlet, useLocation } from "react-router";
import Spinner from "../ui/Spinner";
import MenuHeader from "../ui/MenuHeader";
import type { Contact } from "../__generated__/graphql";

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

const ListMenu = () => {
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
      <MenuHeader title="Contacts" searchWord={searchWord} />
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

const Contacts = () => (
  <div className="flex flex-grow">
    <ListMenu />
    <Outlet />
  </div>
);

export default Contacts;
