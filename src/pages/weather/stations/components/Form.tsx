import { StationsListPayload } from "api/OpenWeatherMap";
import * as WeatherAPI from "api/WeatherAPI";
import { InputField } from "components/form";
import { useState, useCallback } from "react";
import { useQueryClient, useMutation } from "react-query";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { compact } from "utilities/object";
import { validate, required, maxLength } from "utilities/validation";

function validateWeatherStationForm(data: WeatherAPI.WeatherStationFormData) {
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

  const [form, setForm] = useState<WeatherAPI.WeatherStationFormData>({
    name: "",
    longitude: "0.0",
    latitude: "0.0",
    altitude: "0",
  });

  const validation = validateWeatherStationForm(form);

  const changeField = useCallback(
    (fieldName: keyof WeatherAPI.WeatherStationFormData, value: string) =>
      setForm({ ...form, [fieldName]: value }),
    [form]
  );

  const handleChange =
    (fieldName: keyof WeatherAPI.WeatherStationFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      changeField(fieldName, event.target.value);

  const addStation = useMutation(
    (form: WeatherAPI.WeatherStationFormData) => WeatherAPI.createStation(form),
    {
      async onSuccess(data) {
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

export default WeatherStationForm;
