import { useMutation } from "@apollo/client/react";
import { motion, AnimatePresence } from "motion/react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import type { User } from "../../../__generated__/graphql";
import { EDIT_PROFILE } from "../../../graphql/mutations";
import useNotifyMessage from "../../../hooks/useNotifyMessage";
import useField from "../../../hooks/useField";
import Notify from "../../../components/ui/Notify";
import FormField from "../../../components/ui/FormField";

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

export default EditProfileModal;
