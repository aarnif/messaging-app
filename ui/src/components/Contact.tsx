import { useMatch } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CONTACT_BY_ID } from "../graphql/queries";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";

const Contact = () => {
  const match = useMatch("/contacts/:id")?.params;
  const { data, loading } = useQuery(FIND_CONTACT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  const contact = data?.findContactById;

  return (
    <div className="relative flex flex-grow items-center justify-center">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : !contact ? (
        <NotFound entity="Contact" />
      ) : (
        <p>Contact with ID {contact?.id}</p>
      )}
    </div>
  );
};

export default Contact;
