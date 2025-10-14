import { useState } from "react";

const useNotifyMessage = () => {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return { message, showMessage };
};

export default useNotifyMessage;
