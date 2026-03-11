import { useState } from "react";
import type { InputField } from "../types";

const useField = (
  name: string,
  type: string,
  placeholder: string,
  initialValue = ""
): InputField => {
  const [value, setValue] = useState(initialValue);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const onReset = () => {
    setValue("");
  };

  return {
    name,
    type,
    value,
    placeholder,
    setValue,
    onChange,
    onReset,
  };
};

export default useField;
