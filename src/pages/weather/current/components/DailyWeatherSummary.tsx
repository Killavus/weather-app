import { DailyWeatherPayload } from "api/OpenWeatherMap";
import { dtToDate } from "utilities/date";
import { formattedWeatherData } from "utilities/weather";

type DailyWeatherSummaryProps = {
  data: DailyWeatherPayload;
};

const DailyWeatherSummary: React.FC<DailyWeatherSummaryProps> = ({ data }) => {
  const {
    weather: [{ description }],
    main: {
      temp: temperature,
      feels_like: feelsLikeTemperature,
      humidity,
      pressure,
    },
    wind: { speed, deg },
    dt,
  } = data;

  return (
    <>
      <h2 className="font-semibold">
        Feels like {formattedWeatherData(feelsLikeTemperature)} °C,{" "}
        {description}.
      </h2>
      <dl className="py-3 grid grid-cols-2 gap-x-2">
        <dt className="font-semibold">Temperature</dt>
        <dd>{formattedWeatherData(temperature)} °C</dd>
        <dt className="font-semibold">Humidity</dt>
        <dd>{humidity}%</dd>
        <dt className="font-semibold">Pressure</dt>
        <dd>{pressure} hPa</dd>
        <dt className="font-semibold">Wind</dt>
        <dd>
          {speed} m/s{" "}
          <div
            className="inline-block align-middle"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <i className="fas fa-long-arrow-alt-down" />
          </div>
        </dd>
      </dl>
      <p>Updated at {dtToDate(dt).toLocaleString()}.</p>
    </>
  );
};

export default DailyWeatherSummary;
