import { useMutation } from "@apollo/client/react";
import { AnimatePresence, motion } from "motion/react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import FormField from "../../../components/ui/FormField";
import Notify from "../../../components/ui/Notify";
import { CHANGE_PASSWORD } from "../../../graphql/mutations";
import useField from "../../../hooks/useField";
import useNotifyMessage from "../../../hooks/useNotifyMessage";
import useResponsiveWidth from "../../../hooks/useResponsiveWidth";

const ChangePasswordModal = ({
  setIsChangePasswordModalOpen,
}: {
  setIsChangePasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const currentPassword = useField(
    "Current Password",
    "password",
    "Enter your current password...",
  );
  const newPassword = useField(
    "New Password",
    "password",
    "Enter your new password...",
  );
  const confirmNewPassword = useField(
    "Confirm New Password",
    "password",
    "Confirm your new password...",
  );

  const [mutate] = useMutation(CHANGE_PASSWORD, {
    onError: (error) => {
      console.log(error);
      const cleanErrorMessage = String(error).replace(
        "CombinedGraphQLErrors: ",
        "",
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
        className="flex h-[90vh] grow flex-col items-center gap-4 rounded-t-lg rounded-b-none bg-white px-2 py-4 sm:h-auto sm:max-w-125 sm:rounded-lg dark:bg-slate-800"
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

export default ChangePasswordModal;
