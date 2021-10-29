import debounce from "debounce";
import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { useRouteMatch, useHistory, useLocation } from "react-router-dom";
import * as WeatherAPI from "api/WeatherAPI";
type CityEntry = {
  country: string;
  name: string;
  id: number;
  coords: {
    lon: number;
    lat: number;
  };
};

type CityEntryListItemProps = {
  entry: CityEntry;
  isActive?: boolean;
  index: number;
  onActivation(idx: { (idx: number): void } | number | null): void;
  onSubmit(idx: number): void;
};

const CityEntryListItem: React.FC<CityEntryListItemProps> = ({
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
        <CityEntryListItem
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

        const data = await WeatherAPI.searchCity(city);

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

export default CitySearch;
