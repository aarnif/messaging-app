import { useState } from "react";

const useNotifyMessage = () => {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
  };

  const closeMessage = () => {
    setMessage(null);
  };

  return { message, showMessage, closeMessage };
};

export default useNotifyMessage;
