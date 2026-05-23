import { mapboxToken } from "@/lib/mapbox";
import type { MapLocationTarget } from "@/types";

type MapboxGeocodeResponse = {
  features?: Array<{
    center?: [number, number];
    place_name?: string;
  }>;
};

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

type PhotonResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      city?: string;
      country?: string;
      name?: string;
      state?: string;
      street?: string;
    };
  }>;
};

function parseCoordinate(value: string | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function photonLabel(feature: NonNullable<PhotonResponse["features"]>[number]) {
  const properties = feature.properties;

  return [
    properties?.name,
    properties?.street,
    properties?.city,
    properties?.state,
    properties?.country,
  ]
    .filter(Boolean)
    .join(", ");
}

async function geocodeWithMapbox(query: string): Promise<MapLocationTarget | null> {
  if (!mapboxToken) {
    return null;
  }

  const params = new URLSearchParams({
    access_token: mapboxToken,
    autocomplete: "true",
    limit: "1",
  });
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MapboxGeocodeResponse;
  const feature = data.features?.[0];
  const center = feature?.center;

  if (!center) {
    return null;
  }

  return {
    label: feature.place_name || query,
    latitude: center[1],
    longitude: center[0],
  };
}

async function geocodeWithNominatim(query: string): Promise<MapLocationTarget | null> {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    q: query,
  });
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimResult[];
  const result = data[0];
  const latitude = parseCoordinate(result?.lat);
  const longitude = parseCoordinate(result?.lon);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    label: result.display_name || query,
    latitude,
    longitude,
  };
}

async function geocodeWithPhoton(query: string): Promise<MapLocationTarget | null> {
  const params = new URLSearchParams({
    limit: "1",
    q: query,
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PhotonResponse;
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;

  if (!coordinates) {
    return null;
  }

  return {
    label: photonLabel(feature) || query,
    latitude: coordinates[1],
    longitude: coordinates[0],
  };
}

export async function geocodeAddress(query: string): Promise<MapLocationTarget> {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Enter an address to search.");
  }

  const result =
    (await geocodeWithMapbox(cleanQuery).catch(() => null)) ??
    (await geocodeWithNominatim(cleanQuery).catch(() => null)) ??
    (await geocodeWithPhoton(cleanQuery).catch(() => null));

  if (!result) {
    throw new Error("Address not found.");
  }

  return result;
}
