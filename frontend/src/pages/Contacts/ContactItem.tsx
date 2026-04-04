import { NavLink } from "react-router";
import type { Contact } from "../../__generated__/graphql";
import Avatar from "../../components/ui/Avatar";

const ContactItem = ({ contact }: { contact: Contact }) => {
  const { id, contactDetails } = contact;

  const { name, username, about, avatar } = contactDetails;

  return (
    <NavLink
      to={`/contacts/${id}`}
      className={({ isActive }) =>
        isActive
          ? "rounded-lg bg-slate-200 transition-colors dark:bg-slate-700"
          : "rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      }
    >
      <div className="flex gap-4 p-2">
        <Avatar name={name} size="medium" avatar={avatar} />
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

export default ContactItem;
