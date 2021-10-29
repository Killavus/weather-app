import { useQuery } from "react-query";
import { useRouteMatch } from "react-router-dom";
import CityMap from "./CityMap";
import DailyWeatherSummary from "./DailyWeatherSummary";
import * as OpenWeatherMapAPI from "api/OpenWeatherMap";

const DailyWeatherCityView: React.FC = () => {
  const routeMatch = useRouteMatch<{
    name: string;
    id: string;
  }>();
  const { name, id: cityID } = routeMatch.params;

  const weatherData = useQuery<OpenWeatherMapAPI.DailyWeatherPayload>(
    `daily-${cityID}`,
    () => OpenWeatherMapAPI.getCurrentWeather(cityID)
  );

  return (
    <>
      {weatherData.isLoading && (
        <div className="py-6 text-center">
          <div className=" animate-spin">
            <span className=" text-blue-400 text-4xl">
              <i className="fas fa-spinner" />
            </span>
          </div>
          <p className="py-2 text-gray-500">Loading…</p>
        </div>
      )}
      {weatherData.isFetched && (
        <div className="flex flex-wrap justify-between">
          <div className="py-2">
            <h1 className="text-2xl font-semibold mb-4">Weather for {name}</h1>
            <DailyWeatherSummary data={weatherData.data!} />
          </div>
          <div className="py-2 w-[500px]">
            <CityMap
              latitude={weatherData.data!.coord.lat}
              longitude={weatherData.data!.coord.lon}
            />
          </div>
        </div>
      )}
      {weatherData.isError && (
        <p className="text-center py-2 text-red-500">
          Failed to fetch weather data for {name}.
        </p>
      )}
    </>
  );
};

export default DailyWeatherCityView;
