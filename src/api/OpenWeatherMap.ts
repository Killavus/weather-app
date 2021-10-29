const OWM_ROOT = import.meta.env.VITE_OPENWEATHER_API_URL;
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function apiUrl(path: string, queryFragment: string = ""): string {
  return `${OWM_ROOT}/${path}?appid=${OWM_KEY}${queryFragment}`;
}

type WeatherStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  external_id: string;
};

export type StationsListPayload = WeatherStation[];

export async function listWeatherStations(): Promise<StationsListPayload> {
  const response = await fetch(apiUrl("data/3.0/stations"), { method: "get" });

  return response.json();
}

export type FiveDaysForecastEntry = {
  dt: number;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: [
    {
      main: string;
    }
  ];
};

export type FiveDaysForecastPayload = {
  city: {
    coord: { lat: number; lon: number };
  };
  list: FiveDaysForecastEntry[];
};

export async function getFiveDaysForecast(
  id: string
): Promise<FiveDaysForecastPayload> {
  const response = await fetch(
    apiUrl("data/2.5/forecast", `&id=${id}&units=metric`),
    { method: "get" }
  );

  return response.json();
}

export type DailyWeatherPayload = {
  coord: {
    lat: number;
    lon: number;
  };
  weather: {
    description: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  dt: number;
};

export async function getCurrentWeather(
  id: string
): Promise<DailyWeatherPayload> {
  const response = await fetch(
    apiUrl("data/2.5/weather", `&id=${id}&units=metric`),
    { method: "get" }
  );

  return response.json();
}
