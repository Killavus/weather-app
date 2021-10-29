import CurrentWeather from "pages/weather/current/CurrentWeather";
import WeatherStations from "pages/weather/stations/WeatherStations";
import { Redirect, Route, Switch } from "react-router-dom";
import MainNavigation from "./components/MainNavigation";

const Router: React.FC = () => (
  <>
    <MainNavigation />
    <Switch>
      <Route path="/weather/current" component={CurrentWeather} />
      <Route path="/weather/stations" component={WeatherStations} />
      <Redirect to="/weather/current" />
    </Switch>
  </>
);

export default Router;
