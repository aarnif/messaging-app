import { useNavigate, useLocation } from "react-router";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import type { User } from "../__generated__/graphql";
import { EDIT_PROFILE } from "../graphql/mutations";
import useNotifyMessage from "../hooks/useNotifyMessage";
import useField from "../hooks/useField";
import { motion, AnimatePresence } from "motion/react";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";

const EditProfileModal = ({
  currentUser,
  setIsEditProfileOpen,
}: {
  currentUser: User;
  setIsEditProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { name, about } = currentUser;
  const { message, showMessage } = useNotifyMessage();
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
      className="absolute inset-0 flex flex-grow flex-col items-center gap-4 overflow-y-auto bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
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
          {message && <Notify message={message} />}
        </AnimatePresence>
        <FormField field={nameInput} />
        <FormField field={aboutInput} />
      </div>
    </motion.div>
  );
};

const Profile = ({ currentUser }: { currentUser: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showListOnMobile = location.pathname === "/settings/profile";

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { name, username, about } = currentUser;

  return (
    <div
      className={`relative flex flex-grow flex-col items-center justify-center bg-white dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <div className="flex w-full flex-grow flex-col items-center gap-4 overflow-y-auto px-2 py-4 sm:gap-8">
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
        <div className="flex flex-grow flex-col items-center gap-2.5">
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
      <AnimatePresence>
        {isEditProfileOpen && (
          <EditProfileModal
            key={"edit-profile"}
            currentUser={currentUser}
            setIsEditProfileOpen={setIsEditProfileOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
