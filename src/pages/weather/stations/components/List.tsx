import { StationsListPayload } from "api/OpenWeatherMap";
import { useCallback } from "react";
import { useQueryClient, useMutation } from "react-query";
import * as WeatherAPI from "api/WeatherAPI";

type WeatherStationsListProps = {
  data: StationsListPayload;
};

const WeatherStationsList: React.FC<WeatherStationsListProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const deleteStation = useMutation(
    (id: string) => WeatherAPI.deleteStation(id),
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

export default WeatherStationsList;
