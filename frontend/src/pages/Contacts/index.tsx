import { useQuery } from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router";
import Spinner from "../../components/ui/Spinner";
import { ME } from "../../graphql/queries";
import AddContactsModal from "./AddContactsModal";
import ListMenu from "./ListMenu";

const Contacts = () => {
  const { data, loading } = useQuery(ME);
  const currentUser = data?.me;

  const [isAddContactsModalOpen, setIsAddContactsModalOpen] = useState(false);

  return (
    <div className="flex grow">
      <ListMenu setIsAddContactsModalOpen={setIsAddContactsModalOpen} />
      {loading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Outlet context={{ currentUser }} />
      )}
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
