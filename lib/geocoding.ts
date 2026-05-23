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

function suggestionLimit(limit: number) {
  return Math.max(1, Math.min(8, Math.floor(limit)));
}

function isValidLocation(location: MapLocationTarget | null): location is MapLocationTarget {
  return Boolean(
    location &&
      location.label.trim() &&
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude),
  );
}

function uniqueLocations(locations: MapLocationTarget[], limit: number) {
  const unique = new Map<string, MapLocationTarget>();

  for (const location of locations) {
    const key = [
      location.label.trim().toLowerCase(),
      location.latitude.toFixed(5),
      location.longitude.toFixed(5),
    ].join(":");

    if (!unique.has(key)) {
      unique.set(key, {
        ...location,
        label: location.label.trim(),
      });
    }

    if (unique.size >= limit) {
      break;
    }
  }

  return Array.from(unique.values());
}

async function geocodeWithMapbox(
  query: string,
  limit: number,
): Promise<MapLocationTarget[]> {
  if (!mapboxToken) {
    return [];
  }

  const params = new URLSearchParams({
    access_token: mapboxToken,
    autocomplete: "true",
    limit: String(limit),
  });
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as MapboxGeocodeResponse;

  return uniqueLocations(
    (data.features ?? [])
      .map((feature) => {
        const center = feature.center;

        if (!center) {
          return null;
        }

        return {
          label: feature.place_name || query,
          latitude: center[1],
          longitude: center[0],
        };
      })
      .filter(isValidLocation),
    limit,
  );
}

async function geocodeWithNominatim(
  query: string,
  limit: number,
): Promise<MapLocationTarget[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: String(limit),
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
    return [];
  }

  const data = (await response.json()) as NominatimResult[];

  return uniqueLocations(
    data
      .map((result) => {
        const latitude = parseCoordinate(result.lat);
        const longitude = parseCoordinate(result.lon);

        if (latitude === null || longitude === null) {
          return null;
        }

        return {
          label: result.display_name || query,
          latitude,
          longitude,
        };
      })
      .filter(isValidLocation),
    limit,
  );
}

async function geocodeWithPhoton(
  query: string,
  limit: number,
): Promise<MapLocationTarget[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    q: query,
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as PhotonResponse;

  return uniqueLocations(
    (data.features ?? [])
      .map((feature) => {
        const coordinates = feature.geometry?.coordinates;

        if (!coordinates) {
          return null;
        }

        return {
          label: photonLabel(feature) || query,
          latitude: coordinates[1],
          longitude: coordinates[0],
        };
      })
      .filter(isValidLocation),
    limit,
  );
}

export async function geocodeAddressSuggestions(
  query: string,
  limit = 5,
): Promise<MapLocationTarget[]> {
  const cleanQuery = query.trim();
  const cleanLimit = suggestionLimit(limit);

  if (cleanQuery.length < 2) {
    return [];
  }

  const providers = [
    () => geocodeWithMapbox(cleanQuery, cleanLimit),
    () => geocodeWithNominatim(cleanQuery, cleanLimit),
    () => geocodeWithPhoton(cleanQuery, cleanLimit),
  ];

  for (const provider of providers) {
    const suggestions = await provider().catch(() => []);

    if (suggestions.length > 0) {
      return uniqueLocations(suggestions, cleanLimit);
    }
  }

  return [];
}

export async function geocodeAddress(query: string): Promise<MapLocationTarget> {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Enter an address to search.");
  }

  const [result] = await geocodeAddressSuggestions(cleanQuery, 1);

  if (!result) {
    throw new Error("Address not found.");
  }

  return result;
}
