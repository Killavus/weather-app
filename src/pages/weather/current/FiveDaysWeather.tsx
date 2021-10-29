import { useQuery } from "react-query";
import { useRouteMatch } from "react-router-dom";
import CityMap from "./components/CityMap";
import WeatherForecast from "./components/WeatherForecast";
import * as OpenWeatherMapAPI from "api/OpenWeatherMap";

const FiveDaysWeather: React.FC = () => {
  const routeMatch = useRouteMatch<{ name: string; id: string }>();
  const { name, id } = routeMatch.params;

  const weatherData = useQuery<OpenWeatherMapAPI.FiveDaysForecastPayload>(
    `fiveDays-${id}`,
    () => OpenWeatherMapAPI.getFiveDaysForecast(id)
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
            <h1 className="text-2xl font-semibold mb-4">
              5-days forecast for {name}
            </h1>
            <WeatherForecast data={weatherData.data!.list} />
          </div>
          <div className="py-2 w-[500px]">
            <CityMap
              latitude={weatherData.data!.city.coord.lat}
              longitude={weatherData.data!.city.coord.lon}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FiveDaysWeather;
