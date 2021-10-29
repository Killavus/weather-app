const RibbonContainer: React.FC = ({ children }) => (
  <ul className="bg-white mx-auto inline-flex flex-nowrap rounded-md border-2 border-gray-500">
    {children}
  </ul>
);

const NavigationRibbon: React.FC = ({ children }) => (
  <RibbonContainer>{children}</RibbonContainer>
);

export default NavigationRibbon;
