import EmojiPicker from "emoji-picker-react";
import { FaRegSmile } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { useState } from "react";
import type { InputField } from "../types";

const MessageBox = ({
  message,
  callback,
}: {
  message: InputField;
  callback: () => void;
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { name, type, value, placeholder, onChange, onReset, setValue } =
    message;

  return (
    <>
      <div data-testid="emoji-picker" className="absolute bottom-11.5 -left-px">
        <EmojiPicker
          open={isEmojiPickerOpen}
          onEmojiClick={(emoji) => setValue((prev) => prev + emoji.emoji)}
        />
      </div>
      <div className="flex gap-2 bg-white p-2 dark:bg-slate-800">
        <button
          data-testid="add-emoji-button"
          className="cursor-pointer"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
        >
          <FaRegSmile className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
        </button>
        <label
          htmlFor={name}
          className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-1 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
        >
          <input
            id={name}
            name={name}
            data-testid="message-input"
            className="peer focus:bg-opacity-0 inset-0 w-full px-3 text-sm font-normal text-slate-900 placeholder:text-sm placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onReset={onReset}
          />
        </label>
        <button
          data-testid="send-message-button"
          className="cursor-pointer"
          onClick={callback}
        >
          <MdSend className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
        </button>
      </div>
    </>
  );
};

export default MessageBox;
