import { generatedExternalID } from "utilities/weather";

const WEATHER_API_URL = import.meta.env.VITE_API_URL;

function apiUrl(fragment: string): string {
  return `${WEATHER_API_URL}/${fragment}`;
}

export type CityEntry = {
  country: string;
  name: string;
  id: number;
  coords: {
    lon: number;
    lat: number;
  };
};

export async function searchCity(query: string): Promise<CityEntry[]> {
  const response = await fetch(apiUrl(`city?q=${encodeURIComponent(query)}`), {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}

export type CreateStationPayload = {
  ID: string;
  external_id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
};

export type WeatherStationFormData = {
  name: string;
  latitude: string;
  longitude: string;
  altitude: string;
};

export async function createStation(
  form: WeatherStationFormData
): Promise<CreateStationPayload> {
  const externalID = generatedExternalID(form.name);

  const response = await fetch(apiUrl("stations"), {
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

  return response.json();
}

export function deleteStation(id: string): Promise<Response> {
  return fetch(apiUrl(`stations/${id}`), {
    method: "delete",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  });
}
