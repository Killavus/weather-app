import { Link, useLocation } from "react-router-dom";
import { NavigationRibbon, RibbonItem } from "components/navigation";

const MainNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="text-center py-2">
      <NavigationRibbon>
        <RibbonItem isActive={location.pathname.startsWith("/weather/current")}>
          <Link to="/weather/current" className="block">
            Current weather
          </Link>
        </RibbonItem>
        <RibbonItem
          isActive={location.pathname.startsWith("/weather/stations")}
        >
          <Link to="/weather/stations" className="block">
            Weather stations
          </Link>
        </RibbonItem>
      </NavigationRibbon>
    </div>
  );
};

export default MainNavigation;
