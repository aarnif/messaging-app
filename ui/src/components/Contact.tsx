import { useMatch, useNavigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { IoChevronBack } from "react-icons/io5";
import { FIND_CONTACT_BY_ID } from "../graphql/queries";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";
import type { Contact } from "../__generated__/graphql";

const ContactContent = ({ contact }: { contact: Contact }) => {
  const navigate = useNavigate();
  const { name, username, about } = contact.contactDetails;
  return (
    <div className="flex w-full flex-grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
      <div className="flex w-full justify-center">
        <button
          data-testid="go-back-button"
          className="absolute left-2 cursor-pointer sm:hidden"
          onClick={() => navigate("/contacts")}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Contact
        </h2>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <img
          className="h-20 w-20 rounded-full"
          src="https://i.ibb.co/cNxwtNN/profile-placeholder.png"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <h4 className="font-oswald font-semibold text-slate-900 dark:text-slate-50">
              {name}
            </h4>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
              @{username}
            </p>
          </div>
          <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
            {about}
          </p>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const match = useMatch("/contacts/:id")?.params;
  const { data, loading } = useQuery(FIND_CONTACT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  const contact = data?.findContactById;

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-white dark:bg-slate-800">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : !contact ? (
        <NotFound entity="Contact" />
      ) : (
        <ContactContent contact={contact} />
      )}
    </div>
  );
};

export default Contact;
