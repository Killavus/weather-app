type InputProps = JSX.IntrinsicElements["input"] & { isError?: boolean };

const Input: React.FC<InputProps> = ({ isError, ...props }) => (
  <input
    {...props}
    className={`rounded-md py-1 px-3 border-2 ${
      isError ? "border-red-300" : "border-gray-400"
    } transition ${
      isError
        ? "active:border-red-500 focus:border-red-500"
        : "active:border-gray-600 focus:border-gray-600"
    } focus:outline-none ${props.className}`}
  />
);

export default Input;
