export function formattedWeatherData(data: number): string {
  return (Math.round(data * 10) / 10).toString();
}

export function generatedExternalID(name: string): string {
  return name.toUpperCase().split(/\s+/).join("_");
}
