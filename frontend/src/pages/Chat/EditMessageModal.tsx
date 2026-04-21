import { motion } from "framer-motion";
import { IoCheckmark } from "react-icons/io5";
import { MdClose } from "react-icons/md";

const EditMessageModal = ({
  layoutId,
  editedContent,
  onContentChange,
  onCancel,
  onSubmit,
}: {
  layoutId: string;
  editedContent: string;
  onContentChange: (content: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      className="z-40 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 overflow-hidden rounded-lg bg-green-300 p-4 shadow-2xl sm:w-96"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        <textarea
          id="edit-message"
          data-testid="edit-message-input"
          className="w-full resize-none rounded text-sm font-normal text-slate-800 outline-none"
          rows={3}
          value={editedContent}
          onChange={(e) => onContentChange(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            data-testid="cancel-edit-message-button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
            onClick={onCancel}
          >
            <MdClose className="h-4 w-4 text-slate-800" />
          </button>
          <button
            type="button"
            data-testid="submit-edit-message-button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
            onClick={onSubmit}
          >
            <IoCheckmark className="h-5 w-5 text-slate-800" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditMessageModal;
