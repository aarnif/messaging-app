import { useMutation } from "@apollo/client/react";
import { AnimatePresence } from "motion/react";
import FormField from "../../../components/ui/FormField";
import ModalLayout from "../../../components/ui/ModalLayout";
import Notify from "../../../components/ui/Notify";
import Overlay from "../../../components/ui/Overlay";
import { CHANGE_PASSWORD } from "../../../graphql/mutations";
import useErrorMessage from "../../../hooks/useErrorMessage";
import useField from "../../../hooks/useField";

const ChangePasswordModal = ({
  setIsChangePasswordModalOpen,
}: {
  setIsChangePasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { message, showMessage, closeMessage } = useErrorMessage();
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
    <Overlay
      key={"Overlay"}
      onClick={() => setIsChangePasswordModalOpen(false)}
      animation="slideRight"
      additionalClassName="flex items-end justify-center sm:items-center"
    >
      <ModalLayout
        title="Change Password"
        onCancel={() => setIsChangePasswordModalOpen(false)}
        onConfirm={handleChangePassword}
        autoHeight={true}
      >
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
      </ModalLayout>
    </Overlay>
  );
};

export default ChangePasswordModal;
