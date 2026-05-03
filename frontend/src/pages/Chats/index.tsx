import { useQuery } from "@apollo/client/react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { Outlet } from "react-router";
import NewChatDropDownBox from "../../components/NewChatDropDown";
import NewGroupChatModal from "../../components/NewGroupChatModal";
import NewPrivateChatModal from "../../components/NewPrivateChatModal";
import Spinner from "../../components/ui/Spinner";
import { ME } from "../../graphql/queries";
import type { InputField } from "../../types";
import ListMenu from "./ListMenu";

const Chats = ({ searchWord }: { searchWord: InputField }) => {
  const { data, loading: meLoading } = useQuery(ME);
  const currentUser = data?.me;

  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState(false);
  const [isNewPrivateChatModalOpen, setIsNewPrivateChatModalOpen] =
    useState(false);
  const [isNewGroupChatModalOpen, setIsNewGroupChatModalOpen] = useState(false);

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
            setIsNewPrivateChatModalOpen={setIsNewPrivateChatModalOpen}
            setIsNewGroupChatModalOpen={setIsNewGroupChatModalOpen}
          />
        )}
        {isNewPrivateChatModalOpen && currentUser && (
          <NewPrivateChatModal
            currentUser={currentUser}
            setIsNewPrivateChatModalOpen={setIsNewPrivateChatModalOpen}
          />
        )}
        {isNewGroupChatModalOpen && currentUser && (
          <NewGroupChatModal
            currentUser={currentUser}
            setIsNewGroupChatModalOpen={setIsNewGroupChatModalOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chats;
