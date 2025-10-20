import { motion } from "framer-motion";
import Button from "../ui/Button";

const NewChatDropDownBox = ({
  setIsNewChatDropdownOpen,
  setIsNewChatModalOpen,
}: {
  setIsNewChatDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <motion.div
    data-testid="overlay"
    key={"Overlay"}
    className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
    onClick={() => setIsNewChatDropdownOpen(false)}
    initial={{ x: "100vw", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
    transition={{ type: "tween" }}
  >
    <motion.div
      className="absolute top-17 right-12 flex flex-col items-center justify-center rounded-xl bg-slate-200 p-4 lg:right-auto lg:left-[440px] dark:bg-slate-900"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.4, type: "tween" }}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Button
          type="button"
          variant="tertiary"
          text="New Private Chat"
          onClick={() => setIsNewChatModalOpen(true)}
        />
        <Button type="button" variant="tertiary" text="New Group Chat" />
      </div>
    </motion.div>
  </motion.div>
);

export default NewChatDropDownBox;
