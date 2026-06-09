import { NavLink } from "react-router";
import type { Contact } from "../../__generated__/graphql";
import UserCard from "../../components/ui/UserCard";

const ContactItem = ({ contact }: { contact: Contact }) => {
  const { id, contactDetails } = contact;

  return (
    <NavLink
      to={`/contacts/${id}`}
      className={({ isActive }) =>
        isActive
          ? "rounded-lg bg-slate-200 transition-colors dark:bg-slate-700 p-2"
          : "rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 p-2"
      }
    >
      <UserCard user={contactDetails} borderVariant="bottom" />
    </NavLink>
  );
};

export default ContactItem;
