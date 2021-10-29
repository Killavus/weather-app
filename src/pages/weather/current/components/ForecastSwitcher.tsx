import { NavigationRibbon, RibbonItem } from "components/navigation";
import { useRouteMatch, Link } from "react-router-dom";

const ForecastSwitcher: React.FC = () => {
  const routeMatch = useRouteMatch<{ type: string; data: string }>();
  const { type, data } = routeMatch.params;

  return (
    <div className="text-center pb-6">
      <NavigationRibbon>
        <RibbonItem isActive={type === "daily"}>
          <Link to={`/weather/current/daily/${data}`}>Today</Link>
        </RibbonItem>
        <RibbonItem isActive={type === "five-days"}>
          <Link to={`/weather/current/five-days/${data}`}>5 days forecast</Link>
        </RibbonItem>
      </NavigationRibbon>
    </div>
  );
};

export default ForecastSwitcher;
