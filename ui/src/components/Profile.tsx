import { useNavigate, useLocation } from "react-router";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import type { User } from "../__generated__/graphql";
import { EDIT_PROFILE, CHANGE_PASSWORD } from "../graphql/mutations";
import useNotifyMessage from "../hooks/useNotifyMessage";
import useField from "../hooks/useField";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import { motion, AnimatePresence } from "motion/react";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";

const EditProfileModal = ({
  currentUser,
  setIsEditProfileOpen,
}: {
  currentUser: User;
  setIsEditProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { name, about } = currentUser;
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const nameInput = useField("name", "text", "Enter your name here...", name);
  const aboutInput = useField(
    "about",
    "text",
    "Tell something about yourself...",
    about ?? ""
  );

  const [mutate] = useMutation(EDIT_PROFILE, {
    onError: (error) => {
      console.log(error);
    },
  });

  const handleEditProfile = async () => {
    if (nameInput.value.length < 3) {
      showMessage("Profile name must be at least three characters long");
      return;
    }

    await mutate({
      variables: {
        input: {
          name: nameInput.value,
          about: aboutInput.value,
          is24HourClock: currentUser.is24HourClock,
        },
      },
    });

    setIsEditProfileOpen(false);
  };

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="absolute inset-0 flex grow flex-col items-center gap-4 overflow-y-auto bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
    >
      <div className="flex w-full items-center justify-between">
        <button
          data-testid="close-edit-profile-button"
          className="cursor-pointer"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Edit Profile
        </h2>

        <button
          data-testid="submit-edit-profile-button"
          className="cursor-pointer"
          onClick={handleEditProfile}
        >
          <IoChevronForward className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <div className="flex w-full flex-col gap-4">
        <AnimatePresence>
          {message && <Notify message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <FormField field={nameInput} />
        <FormField field={aboutInput} />
      </div>
    </motion.div>
  );
};

const ChangePasswordModal = ({
  setIsChangePasswordModalOpen,
}: {
  setIsChangePasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const currentPassword = useField(
    "Current Password",
    "password",
    "Enter your current password..."
  );
  const newPassword = useField(
    "New Password",
    "password",
    "Enter your new password..."
  );
  const confirmNewPassword = useField(
    "Confirm New Password",
    "password",
    "Confirm your new password..."
  );

  const [mutate] = useMutation(CHANGE_PASSWORD, {
    onError: (error) => {
      console.log(error);
      const cleanErrorMessage = String(error).replace(
        "CombinedGraphQLErrors: ",
        ""
      );
      showMessage(cleanErrorMessage);
    },
  });

  const width = useResponsiveWidth();

  const isMobileScreen = width <= 640;

  const handleChangePassword = async () => {
    if (
      !currentPassword.value ||
      !newPassword.value ||
      !confirmNewPassword.value
    ) {
      showMessage("Please fill all fields.");
      return;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      showMessage("Passwords do not match");
      return;
    }

    const data = await mutate({
      variables: {
        input: {
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
          confirmNewPassword: confirmNewPassword.value,
        },
      },
    });

    if (data) {
      setIsChangePasswordModalOpen(false);
      currentPassword.onReset();
      newPassword.onReset();
      confirmNewPassword.onReset();
    }
  };

  return (
    <motion.div
      data-testid="overlay"
      key={"Overlay"}
      className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => setIsChangePasswordModalOpen(false)}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
      transition={{ type: "tween" }}
    >
      <motion.div
        className="flex h-[90vh] grow flex-col items-center gap-4 rounded-t-xl rounded-b-none bg-white px-2 py-4 sm:h-auto sm:max-w-125 sm:rounded-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        initial={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
        exit={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        transition={{ type: "tween" }}
      >
        <div className="flex w-full justify-between">
          <button
            data-testid="close-modal-button"
            className="cursor-pointer"
            onClick={() => setIsChangePasswordModalOpen(false)}
          >
            <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Change Password
          </h2>
          <button
            data-testid="change-password-button"
            className="cursor-pointer"
            onClick={handleChangePassword}
          >
            <IoChevronForward className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
        <h3 className="mb-2 text-center text-base font-medium text-slate-900 dark:text-slate-50">
          Enter your current and the new password.
        </h3>
        <div className="flex w-full flex-col gap-6">
          <AnimatePresence>
            {message && (
              <Notify message={message} closeMessage={closeMessage} />
            )}
          </AnimatePresence>
          <FormField field={currentPassword} />
          <FormField field={newPassword} />
          <FormField field={confirmNewPassword} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Profile = ({ currentUser }: { currentUser: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showListOnMobile = location.pathname === "/settings/profile";

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const { name, username, about, avatar } = currentUser;

  return (
    <div
      className={`relative flex grow flex-col items-center justify-center bg-white dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <div className="flex w-full grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
        <div className="flex w-full items-center justify-center">
          <button
            data-testid="go-back-button"
            className="absolute left-2 cursor-pointer sm:hidden"
            onClick={() => navigate("/settings")}
          >
            <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Profile
          </h2>
          <button
            data-testid="edit-profile-button"
            className="absolute right-2 cursor-pointer"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <FiEdit className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
        <div className="flex grow flex-col items-center gap-2.5">
          {avatar ? (
            <img className="h-20 w-20 rounded-full" src={avatar} />
          ) : (
            <Avatar name={name} size="large" />
          )}
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
        <Button
          type="button"
          variant="tertiary"
          text="Change Password"
          onClick={() => setIsChangePasswordModalOpen(true)}
        />
      </div>

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
