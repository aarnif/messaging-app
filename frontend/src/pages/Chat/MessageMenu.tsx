import useModal from "../../hooks/useModal";

const MessageMenu = ({
  handleOpenEditModal,
  handleDeleteMessage,
  setIsMessageMenuOpen,
}: {
  handleOpenEditModal: () => void;
  handleDeleteMessage: () => void;
  setIsMessageMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const modal = useModal();

  return (
    <div className="absolute right-0 z-100 w-32 rounded-lg bg-slate-200 shadow-lg dark:bg-slate-700">
      <button
        onClick={() => {
          handleOpenEditModal();
          setIsMessageMenuOpen(false);
        }}
        className="w-full cursor-pointer rounded-lg px-4 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-slate-300 dark:text-slate-50 dark:hover:bg-slate-600"
      >
        Edit
      </button>
      <button
        onClick={() => {
          modal({
            type: "danger",
            title: "Delete Message?",
            message: "Are you sure you want to delete the message?",
            close: "Cancel",
            confirm: "Delete",
            callback: handleDeleteMessage,
          });
          setIsMessageMenuOpen(false);
        }}
        className="w-full cursor-pointer rounded-lg px-4 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-slate-300 dark:text-slate-50 dark:hover:bg-slate-600"
      >
        Delete
      </button>
    </div>
  );
};

export default MessageMenu;
