type CenterOnWrapProps = {
  className?: string;
};

const CenterOnWrap: React.FC<CenterOnWrapProps> = ({
  children,
  className = "",
}) => <div className={`${className} mx-auto sm:mx-0`}>{children}</div>;

export default CenterOnWrap;
