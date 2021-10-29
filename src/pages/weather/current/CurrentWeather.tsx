import { PageContainer, ContentBox, CenterOnWrap } from "components/layout";
import { useRouteMatch, Route, Switch, Redirect } from "react-router-dom";
import CitySearch from "./components/CitySearch";
import ForecastSwitcher from "./components/ForecastSwitcher";
import DailyWeather from "./DailyWeather";
import FiveDaysWeather from "./FiveDaysWeather";

const CurrentWeather: React.FC = () => {
  const routeMatch = useRouteMatch();

  return (
    <PageContainer>
      <ContentBox>
        <div className="flex justify-between flex-wrap items-start gap-y-4 gap-x-6">
          <CenterOnWrap className="text-center flex-1 sm:text-left">
            <Route path={`${routeMatch.path}/:data*`}>
              <CitySearch />
            </Route>
          </CenterOnWrap>
          <Route path={`${routeMatch.path}/:type(daily|five-days)/:data+`}>
            <CenterOnWrap>
              <ForecastSwitcher />
            </CenterOnWrap>
          </Route>
        </div>
        <Switch>
          <Route path={`${routeMatch.path}/daily`}>
            <DailyWeather />
          </Route>
          <Route path={`${routeMatch.path}/five-days/:name/:id`}>
            <FiveDaysWeather />
          </Route>
          <Redirect to={`${routeMatch.path}/daily`} />
        </Switch>
      </ContentBox>
    </PageContainer>
  );
};

export default CurrentWeather;
