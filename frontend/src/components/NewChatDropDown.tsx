import { motion } from "framer-motion";
import Button from "./ui/Button";
import Overlay from "./ui/Overlay";

const NewChatDropDownBox = ({
  setIsNewChatDropdownOpen,
  setIsNewPrivateChatModalOpen,
  setIsNewGroupChatModalOpen,
}: {
  setIsNewChatDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNewPrivateChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNewGroupChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <Overlay
    key={"Overlay"}
    onClick={() => setIsNewChatDropdownOpen(false)}
    animation="slideRight"
  >
    <motion.div
      className="absolute top-17 right-12 flex flex-col items-center justify-center rounded-lg bg-slate-200 p-4 lg:right-auto lg:left-110 dark:bg-slate-900"
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
          onClick={() => setIsNewPrivateChatModalOpen(true)}
        />
        <Button
          type="button"
          variant="tertiary"
          text="New Group Chat"
          onClick={() => setIsNewGroupChatModalOpen(true)}
        />
      </div>
    </motion.div>
  </Overlay>
);

export default NewChatDropDownBox;
