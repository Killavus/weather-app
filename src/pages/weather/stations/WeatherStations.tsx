import { PageContainer, ContentBox } from "components/layout";
import { useQuery } from "react-query";
import { useRouteMatch, Route } from "react-router";
import { Link } from "react-router-dom";
import * as OpenWeatherMapAPI from "api/OpenWeatherMap";
import List from "./components/List";
import ListEmptyState from "./components/ListEmptyState";
import Form from "./components/Form";

const WeatherStations: React.FC = () => {
  const routeMatch = useRouteMatch();

  const stationsList = useQuery<OpenWeatherMapAPI.StationsListPayload>(
    "stations-list",
    OpenWeatherMapAPI.listWeatherStations
  );

  return (
    <PageContainer>
      <ContentBox>
        <h1 className="text-2xl font-semibold">Weather stations</h1>
        {stationsList.isLoading && (
          <div className="py-6 text-center">
            <div className=" animate-spin">
              <span className=" text-blue-400 text-4xl">
                <i className="fas fa-spinner" />
              </span>
            </div>
            <p className="py-2 text-gray-500">Loading…</p>
          </div>
        )}
        {stationsList.isFetched && (
          <>
            {stationsList.data!.length === 0 && (
              <Route path={routeMatch.path} exact>
                <ListEmptyState />
              </Route>
            )}
            {stationsList.data!.length > 0 && (
              <List data={stationsList.data!} />
            )}
            <Route path={`${routeMatch.path}/add`}>
              <Form />
            </Route>
          </>
        )}

        <div className="lg:text-center mt-6 pb-4">
          <Route path={routeMatch.path} exact>
            <Link
              to={`${routeMatch.path}/add`}
              className="transition py-2 px-3 bg-blue-600 text-white font-semibold rounded-lg active:hover-bg-blue-400 hover:bg-blue-400"
            >
              Add new station
            </Link>
          </Route>
        </div>
      </ContentBox>
    </PageContainer>
  );
};

export default WeatherStations;
