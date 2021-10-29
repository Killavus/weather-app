type ItemProps = { isActive?: boolean };

const RibbonItem: React.FC<ItemProps> = ({ children, isActive = false }) => (
  <li
    className={`transition px-6 py-1 border-r-2 border-gray-500 ${
      !isActive && "hover:bg-gray-100"
    } last:border-r-0 font-semibold ${
      isActive ? "bg-blue-600 text-white" : ""
    }`}
  >
    {children}
  </li>
);

export default RibbonItem;
