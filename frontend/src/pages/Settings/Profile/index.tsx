import { useLocation, useOutletContext } from "react-router";
import { useState } from "react";
import type { User } from "../../../__generated__/graphql";
import { AnimatePresence } from "motion/react";
import ProfileContent from "./ProfileContent";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

const Profile = () => {
  const { currentUser } = useOutletContext<{
    currentUser: User;
  }>();
  const location = useLocation();
  const showListOnMobile = location.pathname === "/settings/profile";

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  return (
    <div
      className={`relative flex grow flex-col items-center justify-center bg-white dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <ProfileContent
        currentUser={currentUser}
        setIsEditProfileOpen={setIsEditProfileOpen}
        setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
      />
      <AnimatePresence>
        {isEditProfileOpen && (
          <EditProfileModal
            key={"edit-profile"}
            currentUser={currentUser}
            setIsEditProfileOpen={setIsEditProfileOpen}
          />
        )}
        {isChangePasswordModalOpen && (
          <ChangePasswordModal
            key={"change-password"}
            setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
