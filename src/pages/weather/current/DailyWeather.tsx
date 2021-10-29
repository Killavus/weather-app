import { useRouteMatch, Switch, Route } from "react-router-dom";
import DailyWeatherCityView from "./components/DailyWeatherCityView";
import DailyWeatherEmptyState from "./components/DailyWeatherEmptyState";

const DailyWeather: React.FC = () => {
  const routeMatch = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${routeMatch.path}/:name/:id`}
        component={DailyWeatherCityView}
      />
      <Route path={routeMatch.path} component={DailyWeatherEmptyState} />
    </Switch>
  );
};

export default DailyWeather;
