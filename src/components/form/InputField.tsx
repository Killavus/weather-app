import { useState, useCallback } from "react";
import Input from "./Input";

type InputFieldProps = {
  error?: string;
  label: React.ReactNode;
} & JSX.IntrinsicElements["input"];

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  onChange,
  onBlur,
  ...inputProps
}) => {
  const [isDirty, toggleDirty] = useState(false);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      toggleDirty(true);

      if (onBlur) {
        onBlur(event);
      }
    },
    [onBlur]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      toggleDirty(false);

      if (onChange) {
        onChange(event);
      }
    },
    [onChange]
  );

  return (
    <label>
      <div className="block text-sm px-1 py-1">{label}</div>
      <Input
        {...inputProps}
        onChange={handleChange}
        onBlur={handleBlur}
        isError={isDirty && error !== undefined}
      />
      <div className="px-1 block text-red-500 text-sm">
        {isDirty ? error : ""}
        {"\u200b" /* Force rendering of an empty div. */}
      </div>
    </label>
  );
};

export default InputField;
