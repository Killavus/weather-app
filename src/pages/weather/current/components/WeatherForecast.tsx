import {
  FiveDaysForecastEntry,
  FiveDaysForecastPayload,
} from "api/OpenWeatherMap";
import { useMemo } from "react";
import { statisticalMode } from "utilities/stat";
import { formattedWeatherData } from "utilities/weather";

type WeatherForecastProps = {
  data: FiveDaysForecastPayload["list"];
};

const WeatherForecast: React.FC<WeatherForecastProps> = ({ data }) => {
  const forecastEntries = useMemo(() => {
    const entriesByDay = data.reduce(
      (groupedEntries: { [key: string]: FiveDaysForecastEntry[] }, entry) => {
        // This effectively groups entries by day, UTC-wise - we subtract all seconds passed from the beginning of day.
        // Subtracting by one is to fix edge case with last entry - it's dt is technically sixth day (midnight).
        const key = entry.dt - ((entry.dt - 1) % 86400);

        if (!groupedEntries[key]) {
          groupedEntries[key] = [];
        }

        groupedEntries[key].push(entry);
        return groupedEntries;
      },
      {}
    );

    const aggregatedResults = Object.entries(entriesByDay).map(
      ([dayTimestamp, dailyEntries]: [string, FiveDaysForecastEntry[]]) => {
        const weatherStateMode = statisticalMode(
          dailyEntries.map((entry) => entry.weather[0].main)
        );

        const minTemperature = Math.min(
          ...dailyEntries.map((entry) => entry.main.temp_min)
        );
        const maxTemperature = Math.max(
          ...dailyEntries.map((entry) => entry.main.temp_max)
        );

        return {
          dayTimestamp,
          weatherStateMode,
          minTemperature,
          maxTemperature,
        };
      }
    );

    aggregatedResults.sort((entry1, entry2) => {
      if (entry1.dayTimestamp === entry2.dayTimestamp) {
        return 0;
      }

      return entry1.dayTimestamp < entry2.dayTimestamp ? -1 : 1;
    });

    return aggregatedResults.map(({ dayTimestamp, ...rest }) => ({
      day: new Date(parseInt(dayTimestamp, 10) * 1000)
        .toISOString()
        .split("T")[0],
      ...rest,
    }));
  }, [data]);

  return (
    <table>
      <thead>
        <tr>
          <th className="pr-2">Date</th>
          <th className="pr-2">Summary</th>
          <th className="pr-2">Temperatures</th>
        </tr>
      </thead>
      <tbody>
        {forecastEntries.map((entry) => (
          <tr key={entry.day} className="py-2">
            <td className="font-semibold pr-2">{entry.day}</td>
            <td className="pr-2">Mostly {entry.weatherStateMode}</td>
            <td className="pr-2">
              From {formattedWeatherData(entry.minTemperature)} to{" "}
              {formattedWeatherData(entry.maxTemperature)} °C
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WeatherForecast;
