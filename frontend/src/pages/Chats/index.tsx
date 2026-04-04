import { ME } from "../../graphql/queries";
import { useQuery } from "@apollo/client/react";
import { AnimatePresence } from "motion/react";
import { Outlet } from "react-router";
import Spinner from "../../components/ui/Spinner";
import type { InputField } from "../../types";
import NewChatDropDownBox from "../../components/NewChatDropDown";
import NewChatModal from "../../components/NewChatModal";
import { useState } from "react";
import ListMenu from "./ListMenu";

const Chats = ({ searchWord }: { searchWord: InputField }) => {
  const { data, loading: meLoading } = useQuery(ME);
  const currentUser = data?.me;

  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatModalType, setNewChatModalType] = useState<
    "private" | "group" | null
  >(null);

  const handleOpenNewChatModal = (event: React.BaseSyntheticEvent) => {
    const clickedButtonText = event.target.textContent;

    if (clickedButtonText === "New Private Chat") {
      setNewChatModalType("private");
    } else {
      setNewChatModalType("group");
    }
    setIsNewChatModalOpen(true);
  };

  return (
    <div className="flex grow">
      <ListMenu
        currentUser={currentUser}
        searchWord={searchWord}
        meLoading={meLoading}
        setIsNewChatDropdownOpen={setIsNewChatDropdownOpen}
      />
      {meLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Outlet context={{ currentUser, searchWord }} />
      )}
      <AnimatePresence>
        {isNewChatDropdownOpen && (
          <NewChatDropDownBox
            setIsNewChatDropdownOpen={setIsNewChatDropdownOpen}
            handleOpenNewChatModal={handleOpenNewChatModal}
          />
        )}
        {isNewChatModalOpen && currentUser && (
          <NewChatModal
            currentUser={currentUser}
            newChatModalType={newChatModalType}
            setIsNewChatModalOpen={setIsNewChatModalOpen}
            setNewChatModalType={setNewChatModalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chats;
