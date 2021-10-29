import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  Link,
  useLocation,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import debounce from "debounce";

const RibbonContainer: React.FC = ({ children }) => (
  <ul className="bg-white mx-auto inline-flex flex-nowrap rounded-md border-2 border-gray-500">
    {children}
  </ul>
);

type ItemProps = { isActive?: boolean };

const RibbonItem: React.FC<ItemProps> = ({ children, isActive = false }) => (
  <li
    className={`transition px-6 py-1 border-r-2 border-gray-500 ${
      !isActive && "hover:bg-gray-100"
    } last:border-r-0 font-semibold ${
      isActive ? "bg-blue-600 text-white" : ""
    }`}
  >
    {children}
  </li>
);

const NavigationRibbon: React.FC = ({ children }) => (
  <RibbonContainer>{children}</RibbonContainer>
);

const MainNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="text-center py-2">
      <NavigationRibbon>
        <RibbonItem isActive={location.pathname.startsWith("/weather/current")}>
          <Link to="/weather/current" className="block">
            Current weather
          </Link>
        </RibbonItem>
        <RibbonItem
          isActive={location.pathname.startsWith("/weather/stations")}
        >
          <Link to="/weather/stations" className="block">
            Weather stations
          </Link>
        </RibbonItem>
      </NavigationRibbon>
    </div>
  );
};

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

const PageContainer: React.FC = ({ children }) => (
  <div className="max-w-6xl m-auto px-4 py-4">{children}</div>
);

const ViewContent: React.FC = ({ children }) => (
  <div className="bg-white border rounded-lg border-gray-400 px-4 py-4">
    {children}
  </div>
);

type InputProps = JSX.IntrinsicElements["input"] & { isError?: boolean };

const Input: React.FC<InputProps> = ({ isError, ...props }) => (
  <input
    {...props}
    className={`rounded-md py-1 px-3 border-2 ${
      isError ? "border-red-300" : "border-gray-400"
    } transition ${
      isError
        ? "active:border-red-500 focus:border-red-500"
        : "active:border-gray-600 focus:border-gray-600"
    } focus:outline-none ${props.className}`}
  />
);

type CityEntry = {
  country: string;
  name: string;
  id: number;
  coords: {
    lon: number;
    lat: number;
  };
};

type CityEntryProps = {
  entry: CityEntry;
  isActive?: boolean;
  index: number;
  onActivation(idx: { (idx: number): void } | number | null): void;
  onSubmit(idx: number): void;
};

const CityEntry: React.FC<CityEntryProps> = ({
  entry,
  isActive,
  onActivation,
  onSubmit,
  index,
}) => {
  const handleElementActivation = useCallback(() => {
    onActivation(index);
  }, [index, onActivation]);
  const handleElementDeactivation = useCallback(() => {
    onActivation(null);
  }, [onActivation]);
  const handleClick = useCallback(() => {
    onSubmit(index);
  }, [onSubmit, index]);

  return (
    <li
      className={`${isActive ? "text-white bg-blue-600" : ""}`}
      role="link"
      onMouseEnter={handleElementActivation}
      onMouseLeave={handleElementDeactivation}
    >
      <a className="block px-3 py-1" role="button" onClick={handleClick}>
        <p>{entry.name}</p>
        <p className="text-sm">
          {entry.country}, Lat: {entry.coords.lat} Lon: {entry.coords.lon}
        </p>
      </a>
    </li>
  );
};

type EntriesListProps = {
  entries: CityEntry[];
  onSubmit(idx: number): void;
  setActiveElementIdx(idx: { (idx: number): void } | number | null): void;
  activeElementIdx: number | null;
};

const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  onSubmit,
  setActiveElementIdx,
  activeElementIdx,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleKeyboardEvents = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveElementIdx((idx) =>
            Math.min((idx === null ? -1 : idx) + 1, entries.length - 1)
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveElementIdx((idx) => Math.max((idx || 0) - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          onSubmit(activeElementIdx === null ? NaN : activeElementIdx);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyboardEvents);

    return () => {
      document.removeEventListener("keydown", handleKeyboardEvents);
    };
  }, [activeElementIdx, entries]);

  useLayoutEffect(() => {
    if (activeElementIdx !== null && listRef.current) {
      const listHorizontalPaddings = 8;
      const listHeight = listRef.current.clientHeight - listHorizontalPaddings;
      const listScrollHeight = listRef.current.scrollTop;

      const element = listRef.current.childNodes[
        activeElementIdx
      ] as HTMLElement;

      const [viewWindowTop, viewWindowBottom] = [
        listScrollHeight,
        listScrollHeight + listHeight,
      ];

      if (
        (element && element.offsetTop > viewWindowBottom) ||
        element.offsetTop < viewWindowTop
      ) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeElementIdx]);

  return (
    <ul
      className={`absolute z-10 top-[32px] left-0 max-h-[33vh] overflow-auto bg-white py-1 pt-3 border-l-2 rounded-b-md border-r-2 border-b-2 border-gray-600 max-w-[400px] min-w-[260px] w-full`}
      ref={listRef}
    >
      {entries.length === 0 && (
        <li className="px-3 py-1 text-center italic">
          No cities found matching your entry.
        </li>
      )}
      {entries.map((entry, index) => (
        <CityEntry
          key={`${entry.id}`}
          entry={entry}
          index={index}
          onSubmit={onSubmit}
          isActive={activeElementIdx === index}
          onActivation={setActiveElementIdx}
        />
      ))}
    </ul>
  );
};

type CitySearchInputProps = {
  onChange: React.ChangeEventHandler;
  value: string;
  isLoading: boolean;
  onSubmit(idx: number): void;
  entries: CityEntry[] | null;
  setActiveElementIdx(idx: { (idx: number): void } | number | null): void;
  activeElementIdx: number | null;
};

const CitySearchInput = React.forwardRef<
  HTMLInputElement,
  CitySearchInputProps
>(
  (
    {
      onChange,
      value,
      isLoading,
      onSubmit,
      entries,
      setActiveElementIdx,
      activeElementIdx,
    },
    ref
  ) => {
    const [entriesVisible, toggleEntriesVisibility] = useState(false);

    const handleFocus = useCallback(() => {
      toggleEntriesVisibility(true);
    }, []);

    const handleBlur = useCallback(() => {
      // There is a need to postpone blur hiding of EntriesList to allow click event to go through.
      setTimeout(() => toggleEntriesVisibility(false), 150);
    }, []);

    return (
      <div className="relative text-left rounded-md py-1 px-3 border-2 border-gray-400 transition active:border-gray-600 focus-within:border-gray-600 focus-within:outline-none max-w-[400px] min-w-[260px] w-full mr-[-2px]">
        <span
          className={`${
            isLoading ? "animate-spin" : ""
          } text-gray-400 absolute left-[10px] top-[5px]`}
        >
          <i className={`fas ${isLoading ? "fa-spinner" : "fa-search"}`} />
        </span>
        <input
          ref={ref}
          type="text"
          name="city"
          onChange={onChange}
          value={value}
          placeholder="Search for city…"
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-6 outline-none"
        />
        {Array.isArray(entries) && entriesVisible && (
          <EntriesList
            entries={entries}
            onSubmit={onSubmit}
            setActiveElementIdx={setActiveElementIdx}
            activeElementIdx={activeElementIdx}
          />
        )}
      </div>
    );
  }
);

const CitySearch: React.FC = () => {
  const routeMatch = useRouteMatch<{ data?: string }>();
  const initialName = routeMatch.params.data?.split("/")[1] || "";

  const [city, setCity] = useState(initialName);
  const [entries, setEntries] = useState<CityEntry[] | null>(null);
  const [isLoading, toggleLoading] = useState(false);
  const [activeElementIdx, setActiveElementIdx] = useState<number | null>(null);

  const history = useHistory();
  const location = useLocation();
  const linkBase = location.pathname.includes("daily") ? "daily" : "five-days";
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (idx: number) => {
      const entry = (entries || [])[idx];

      if (entry) {
        setCity(entry.name);
        inputRef.current?.blur();
        history.push(
          `/weather/current/${linkBase}/${encodeURIComponent(entry.name)}/${
            entry.id
          }`
        );
      }
    },
    [history, entries, linkBase]
  );

  const fetchEntries = useRef(
    debounce(async (city: string) => {
      try {
        toggleLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/city?q=${encodeURIComponent(city)}`,
          { method: "get", headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();

        setEntries(data);
        setActiveElementIdx(null);
      } finally {
        toggleLoading(false);
      }
    }, 200)
  );

  useEffect(() => {
    if (city.trim().length > 1) {
      fetchEntries.current(city);
    } else {
      setEntries(null);
    }
  }, [city]);

  const handleChange = useCallback((event) => {
    setCity(event.target.value);
  }, []);

  return (
    <CitySearchInput
      ref={inputRef}
      onSubmit={handleSubmit}
      onChange={handleChange}
      setActiveElementIdx={setActiveElementIdx}
      activeElementIdx={activeElementIdx}
      value={city}
      entries={entries}
      isLoading={isLoading}
    />
  );
};

type FiveDaysForecastEntry = {
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

type FiveDaysForecastPayload = {
  city: {
    coord: { lat: number; lon: number };
  };
  list: FiveDaysForecastEntry[];
};

type WeatherForecastProps = {
  data: FiveDaysForecastPayload["list"];
};

function statisticalMode<T>(values: T[]): T | null {
  if (values.length === 0) {
    return null;
  }

  const histogram = new Map();

  values.forEach((value) => {
    const count = histogram.get(value) || 0;
    histogram.set(value, count + 1);
  });

  let currentMax: number = 0;
  let maxValue: T = values[0];

  for (const [value, count] of histogram.entries()) {
    if (count > currentMax) {
      currentMax = count;
      maxValue = value;
    }
  }

  return maxValue;
}

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

  console.log(forecastEntries);

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
              From {entry.minTemperature} to {entry.maxTemperature} °C
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function formattedWeatherData(data: number): string {
  return (Math.round(data * 10) / 10).toString();
}

const FiveDaysWeather: React.FC = () => {
  const routeMatch = useRouteMatch<{ name: string; id: string }>();
  const { name, id } = routeMatch.params;

  const weatherData = useQuery<FiveDaysForecastPayload>(
    `fiveDays-${id}`,
    async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_OPENWEATHER_API_URL
        }/data/2.5/forecast?id=${id}&units=metric&appid=${
          import.meta.env.VITE_OPENWEATHER_API_KEY
        }`,
        { method: "get" }
      );

      return response.json();
    }
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

type DailyWeatherPayload = {
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

  console.log(dt);

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
      <p>Updated at {new Date(dt * 1000).toLocaleString()}.</p>
    </>
  );
};

type CityMapProps = {
  latitude: number;
  longitude: number;
};

const CityMap: React.FC<CityMapProps> = ({ latitude, longitude }) => (
  <MapContainer
    center={[latitude, longitude]}
    minZoom={2}
    zoom={13}
    dragging={false}
    style={{ width: "100%", height: 500 }}
  >
    <TileLayer
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[latitude, longitude]}></Marker>
  </MapContainer>
);

const DailyWeatherCityView: React.FC = () => {
  const routeMatch = useRouteMatch<{
    name: string;
    id: string;
  }>();
  const { name, id: cityID } = routeMatch.params;

  const weatherData = useQuery<DailyWeatherPayload>(
    `daily-${cityID}`,
    async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_OPENWEATHER_API_URL
        }/data/2.5/weather?id=${cityID}&appid=${
          import.meta.env.VITE_OPENWEATHER_API_KEY
        }&units=metric`,
        { method: "get" }
      );

      return response.json();
    }
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
const DailyWeatherEmptyState: React.FC = () => (
  <div className="py-8 text-center text-gray-500">
    Please search for a city to display your weather information.
  </div>
);

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

const CenterOnWrap: React.FC<{ className?: string }> = ({
  children,
  className = "",
}) => <div className={`${className} mx-auto sm:mx-0`}>{children}</div>;

const CurrentWeather: React.FC = () => {
  const routeMatch = useRouteMatch();

  return (
    <PageContainer>
      <ViewContent>
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
      </ViewContent>
    </PageContainer>
  );
};

type AppProps = {
  queryClient: QueryClient;
};

type WeatherStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  external_id: string;
};

type WeatherStationFormData = {
  name: string;
  latitude: string;
  longitude: string;
  altitude: string;
};

type StationsListPayload = WeatherStation[];

const WeatherStationsListEmptyState: React.FC = () => (
  <div className="py-6 text-center text-gray-500">
    <p>
      There are no defined stations yet. Use the button below to create a
      station.
    </p>
  </div>
);

type WeatherStationsListProps = {
  data: StationsListPayload;
};

const WeatherStationsList: React.FC<WeatherStationsListProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const deleteStation = useMutation(
    async (id: string) => {
      return fetch(`${import.meta.env.VITE_API_URL}/stations/${id}`, {
        method: "delete",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      onSuccess(_d, id) {
        queryClient.setQueryData<StationsListPayload>(
          "stations-list",
          (listData) => {
            const list = listData || [];
            const index = list.findIndex((station) => station.id === id);

            if (index > -1) {
              return [...list.slice(0, index), ...list.slice(index + 1)];
            }

            return list;
          }
        );
      },
    }
  );

  const handleDelete = useCallback(
    (id: string) => () => {
      const confirmation = window.confirm(
        "Are you sure you want to delete this station?"
      );

      if (confirmation) {
        deleteStation.mutate(id);
      }
    },
    [deleteStation]
  );

  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full my-4">
          <thead>
            <tr className="text-left">
              <th className="pt-2 font-semibold">Name</th>
              <th className="pt-2 font-semibold">Latitude</th>
              <th className="pt-2 font-semibold">Longitude</th>
              <th className="pt-2 font-semibold">Altitude</th>
              <th className="pt-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((station) => (
              <tr
                key={station.id}
                className="border-t border-gray-400 border-b"
              >
                <td className="py-2">{station.name}</td>
                <td className="py-2">{station.latitude}</td>
                <td className="py-2">{station.longitude}</td>
                <td className="py-2">{station.altitude}</td>
                <td className="py-2">
                  <button
                    type="button"
                    className="transition py-1 text-red-600 hover:text-red-400 active:text-red-400 disabled:opacity-75"
                    disabled={deleteStation.isLoading}
                    onClick={handleDelete(station.id)}
                  >
                    <i className="fas fa-trash pr-2" />
                    {deleteStation.isLoading &&
                    deleteStation.variables === station.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block lg:hidden my-4 border-b border-gray-400">
        {data.map((station) => (
          <div key={station.id} className="border-t border-gray-400 py-2">
            <h2 className="text-lg font-semibold">{station.name}</h2>
            <dl className="py-3 grid grid-cols-2 gap-x-2 text-left">
              <dt className="font-semibold">Latitude</dt>
              <dd>{station.latitude}</dd>
              <dt className="font-semibold">Longitude</dt>
              <dd>{station.longitude}</dd>
              <dt className="font-semibold">Altitude</dt>
              <dd>{station.altitude}</dd>
            </dl>
            <p>
              {" "}
              <button
                type="button"
                className="transition py-1 text-red-600 hover:text-red-400 active:text-red-400 disabled:opacity-75"
                onClick={handleDelete(station.id)}
              >
                <i className="fas fa-trash pr-2" /> Delete
              </button>
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

type InputFieldProps = {
  error?: string;
  label: React.ReactNode;
} & JSX.IntrinsicElements["input"];

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  onChange,
  onBlur,
  ...inputProps
}) => {
  const [isDirty, toggleDirty] = useState(false);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      toggleDirty(true);

      if (onBlur) {
        onBlur(event);
      }
    },
    [onBlur]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      toggleDirty(false);

      if (onChange) {
        onChange(event);
      }
    },
    [onChange]
  );

  return (
    <label>
      <div className="block text-sm px-1 py-1">{label}</div>
      <Input
        {...inputProps}
        onChange={handleChange}
        onBlur={handleBlur}
        isError={isDirty && error !== undefined}
      />
      <div className="px-1 block text-red-500 text-sm">
        {isDirty ? error : ""}
        {"\u200b"}
      </div>
    </label>
  );
};

type Validator = { (value: any): string | undefined };

function required(message: string): Validator {
  return function (value) {
    if (value.toString().trim().length === 0) {
      return message;
    }

    return undefined;
  };
}

function maxLength(limit: number, message: string): Validator {
  return function (value) {
    if (value.length > limit) {
      return message;
    }

    return undefined;
  };
}

function validate(value: any, validators: Validator[]) {
  const validationResult = validators
    .map((validator) => validator(value))
    .filter(Boolean)
    .join(", ");

  if (validationResult === "") {
    return undefined;
  }

  return `${validationResult}.`;
}

function compact(object: { [k: string]: any }) {
  return Object.entries(object).reduce(
    (
      compacted: { [k: string]: any },
      [key, value]: [key: string, value: any]
    ) => {
      if (value !== undefined) {
        compacted[key] = value;
      }

      return compacted;
    },
    {}
  );
}

function validateWeatherStationForm(data: WeatherStationFormData) {
  return compact({
    name: validate(data.name, [
      required("Name is required"),
      maxLength(120, "Name can't be longer than 120 characters."),
    ]),
    latitude: validate(data.latitude, [required("Latitude is required")]),
    longitude: validate(data.longitude, [required("Longitude is required")]),
    altitude: validate(data.altitude, [required("Altitude is required")]),
  });
}

const WeatherStationForm: React.FC = () => {
  const queryClient = useQueryClient();
  const history = useHistory();

  const [form, setForm] = useState<WeatherStationFormData>({
    name: "",
    longitude: "0.0",
    latitude: "0.0",
    altitude: "0",
  });

  const validation = validateWeatherStationForm(form);

  const changeField = useCallback(
    (fieldName: keyof WeatherStationFormData, value: string) =>
      setForm({ ...form, [fieldName]: value }),
    [form]
  );

  const handleChange =
    (fieldName: keyof WeatherStationFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      changeField(fieldName, event.target.value);

  const addStation = useMutation(
    (form: WeatherStationFormData) => {
      const externalID = form.name.toUpperCase().split(/\s+/).join("_");

      return fetch(`${import.meta.env.VITE_API_URL}/stations`, {
        method: "post",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          longitude: parseFloat(form.longitude),
          latitude: parseFloat(form.latitude),
          altitude: parseFloat(form.altitude),
          external_id: externalID,
        }),
      });
    },
    {
      async onSuccess(response) {
        const data = await response.json();

        queryClient.setQueryData<StationsListPayload>(
          "stations-list",
          (list) => [
            ...(list || []),
            {
              id: data.ID,
              external_id: data.external_id,
              name: data.name,
              latitude: data.latitude,
              longitude: data.longitude,
              altitude: data.altitude,
            },
          ]
        );

        history.push("/weather/stations");
      },
    }
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      addStation.mutate(form);
    },
    [form]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-x-2 gap-y-2 flex-wrap mt-6 lg:items-center mb-12"
    >
      <InputField
        label="Name"
        id="name"
        type="text"
        name="name"
        error={validation.name}
        value={form.name}
        onChange={handleChange("name")}
      />
      <InputField
        label="Latitude"
        id="latitude"
        type="number"
        name="latitude"
        value={form.latitude}
        error={validation.latitude}
        min={-90.0}
        max={90.0}
        step={0.1}
        onChange={handleChange("latitude")}
      />
      <InputField
        label="Longitude"
        id="longitude"
        type="number"
        name="longitude"
        error={validation.longitude}
        min={-180.0}
        max={180.0}
        step={0.1}
        value={form.longitude}
        onChange={handleChange("longitude")}
      />
      <InputField
        label="Altitude"
        id="altitude"
        type="number"
        name="altitude"
        error={validation.altitude}
        step={0.1}
        value={form.altitude}
        onChange={handleChange("altitude")}
      />
      <div className="pt-[7px] flex flex-grow gap-x-2 lg:justify-end">
        <button
          type="submit"
          disabled={Object.keys(validation).length > 0 || addStation.isLoading}
          className="h-[36px] disabled:opacity-75 transition px-3 bg-blue-600 disabled:hover:bg-blue-600 text-white font-semibold rounded-lg active:hover-bg-blue-400 hover:bg-blue-400"
        >
          {addStation.isLoading ? "Saving…" : "Save"}
        </button>
        <Link
          to="/weather/stations"
          className="h-[36px] leading-[36px] transition px-3 bg-gray-600 text-white font-semibold rounded-lg active:hover-bg-gray-400 hover:bg-gray-400"
        >
          Back
        </Link>
      </div>
    </form>
  );
};

const WeatherStations: React.FC = () => {
  const routeMatch = useRouteMatch();

  const stationsList = useQuery<StationsListPayload>(
    "stations-list",
    async () => {
      const response = await fetch(
        `${import.meta.env.VITE_OPENWEATHER_API_URL}/data/3.0/stations?appid=${
          import.meta.env.VITE_OPENWEATHER_API_KEY
        }`,
        { method: "get" }
      );

      return response.json();
    }
  );

  return (
    <PageContainer>
      <ViewContent>
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
                <WeatherStationsListEmptyState />
              </Route>
            )}
            {stationsList.data!.length > 0 && (
              <WeatherStationsList data={stationsList.data!} />
            )}
            <Route path={`${routeMatch.path}/add`}>
              <WeatherStationForm />
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
      </ViewContent>
    </PageContainer>
  );
};

const App: React.FC<AppProps> = ({ queryClient }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <MainNavigation />
      <Switch>
        <Route path="/weather/current" component={CurrentWeather} />
        <Route path="/weather/stations" component={WeatherStations} />
        <Redirect to="/weather/current" />
      </Switch>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
