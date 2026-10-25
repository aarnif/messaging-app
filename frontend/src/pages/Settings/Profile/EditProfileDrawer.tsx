import { useMutation } from "@apollo/client/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import type { User } from "../../../__generated__/graphql";
import Avatar from "../../../components/ui/Avatar";
import Error from "../../../components/ui/Error";
import FormField from "../../../components/ui/FormField";
import Spinner from "../../../components/ui/Spinner";
import { EDIT_PROFILE } from "../../../graphql/mutations";
import useErrorMessage from "../../../hooks/useErrorMessage";
import useField from "../../../hooks/useField";

const EditProfileDrawer = ({
  currentUser,
  setIsEditProfileOpen,
}: {
  currentUser: User;
  setIsEditProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { name, about } = currentUser;
  const { message, showMessage, closeMessage } = useErrorMessage();
  const nameInput = useField("name", "text", "Enter your name here...", name);
  const aboutInput = useField(
    "about",
    "text",
    "Tell something about yourself...",
    about ?? "",
  );
  const [image, setImage] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mutate, { loading }] = useMutation(EDIT_PROFILE, {
    onError: (error) => {
      console.log(error);
      showMessage(error.message);
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
          isDarkMode: currentUser.isDarkMode,
          image,
        },
      },
    });

    setIsEditProfileOpen(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image must be smaller than 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isUploadingImage = loading && image !== undefined;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="absolute inset-0 flex grow flex-col items-center gap-4 overflow-y-auto bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
    >
      <div className="flex w-full items-center justify-between">
        <button
          data-testid="close-edit-profile-button"
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={() => setIsEditProfileOpen(false)}
        >
          <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Edit Profile
        </h2>

        <button
          data-testid="submit-edit-profile-button"
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={handleEditProfile}
        >
          <IoChevronForward className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <div className="flex w-full flex-col gap-4">
        <AnimatePresence>
          {message && <Error message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <div className="mb-5 flex justify-center items-center bg-slate-100 border-slate-100 dark:bg-slate-900 dark:border-slate-900 rounded-lg">
          <button
            type="button"
            className="p-4 flex flex-col gap-2 justify-center items-center rounded-lg cursor-pointer disabled:cursor-not-allowed"
            disabled={loading}
            onClick={handleClick}
          >
            <div className="relative w-fit">
              <Avatar
                name={currentUser.name}
                avatar={image ?? currentUser.avatar}
                size="large"
              />
              {isUploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/60">
                  <Spinner />
                </div>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {isUploadingImage ? "Saving..." : "Change profile image"}
            </div>
            <input
              data-testid="profile-image-input"
              ref={fileInputRef}
              hidden={true}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </button>
        </div>
        <FormField field={nameInput} disabled={loading} />
        <FormField field={aboutInput} disabled={loading} />
      </div>
    </motion.div>
  );
};

export default EditProfileDrawer;
