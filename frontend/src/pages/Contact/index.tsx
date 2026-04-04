import { useMatch, useOutletContext } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { FIND_CONTACT_BY_ID, IS_BLOCKED_BY_USER } from "../../graphql/queries";
import Spinner from "../../components/ui/Spinner";
import NotFound from "../../components/ui/NotFound";
import type { User } from "../../__generated__/graphql";
import { useEffect } from "react";
import ContactContent from "./ContactContent";

const Contact = () => {
  const { currentUser } = useOutletContext<{
    currentUser: User;
  }>();

  const match = useMatch("/contacts/:id")?.params;

  const { data: contactData, loading: contactLoading } = useQuery(
    FIND_CONTACT_BY_ID,
    {
      variables: {
        id: match?.id ?? "",
      },
    }
  );

  const [checkIsBlocked, { data: blockedData, loading: blockedLoading }] =
    useLazyQuery(IS_BLOCKED_BY_USER, {
      fetchPolicy: "network-only",
    });

  const contact = contactData?.findContactById;
  const isBlockedByUser = blockedData?.isBlockedByUser;

  useEffect(() => {
    if (contact?.contactDetails?.id) {
      checkIsBlocked({
        variables: {
          id: contact.contactDetails.id,
        },
      });
    }
  }, [contact, checkIsBlocked]);

  const loading = contactLoading || blockedLoading;

  return (
    <div className="flex grow flex-col items-center justify-center bg-white dark:bg-slate-800">
      {loading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : !contact ? (
        <NotFound entity="Contact" />
      ) : (
        <ContactContent
          currentUser={currentUser}
          contact={contact}
          isBlockedByUser={isBlockedByUser ? true : false}
        />
      )}
    </div>
  );
};

export default Contact;
