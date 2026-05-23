export const bulgariaBounds = {
  east: 28.62,
  north: 44.23,
  south: 41.22,
  west: 22.35,
};

export const bulgariaPaddedBounds = {
  east: 28.95,
  north: 44.5,
  south: 40.95,
  west: 22.02,
};

export const bulgariaCenter: [number, number] = [25.4858, 42.7339];
export const bulgariaDefaultZoom = 7;

export const bulgariaBoundaryCoordinates: [number, number][] = [
  [22.357, 44.217],
  [22.72, 44.09],
  [23.22, 43.94],
  [23.78, 43.75],
  [24.42, 43.7],
  [25.02, 43.68],
  [25.54, 43.76],
  [26.18, 44.05],
  [26.86, 44.14],
  [27.48, 44.03],
  [28.0, 43.85],
  [28.58, 43.74],
  [28.22, 43.46],
  [27.9, 43.18],
  [27.84, 42.84],
  [27.93, 42.52],
  [28.08, 42.16],
  [27.7, 42.06],
  [27.22, 42.14],
  [26.75, 42.08],
  [26.32, 41.72],
  [25.74, 41.38],
  [25.18, 41.25],
  [24.62, 41.46],
  [24.02, 41.5],
  [23.46, 41.36],
  [22.9, 41.34],
  [22.82, 41.72],
  [22.62, 42.06],
  [22.35, 42.32],
  [22.74, 42.65],
  [22.92, 43.06],
  [22.55, 43.38],
  [22.62, 43.78],
  [22.357, 44.217],
];

export const bulgariaMapboxBounds: [[number, number], [number, number]] = [
  [bulgariaPaddedBounds.west, bulgariaPaddedBounds.south],
  [bulgariaPaddedBounds.east, bulgariaPaddedBounds.north],
];

export const bulgariaLeafletBounds: [[number, number], [number, number]] = [
  [bulgariaBounds.south, bulgariaBounds.west],
  [bulgariaBounds.north, bulgariaBounds.east],
];

export const bulgariaLeafletMaxBounds: [[number, number], [number, number]] = [
  [bulgariaPaddedBounds.south, bulgariaPaddedBounds.west],
  [bulgariaPaddedBounds.north, bulgariaPaddedBounds.east],
];

export const bulgariaLeafletBoundary = bulgariaBoundaryCoordinates.map(
  ([longitude, latitude]) => [latitude, longitude] as [number, number],
);

export const bulgariaLeafletMask = [
  [
    [-90, -360],
    [-90, 360],
    [90, 360],
    [90, -360],
    [-90, -360],
  ] as [number, number][],
  bulgariaLeafletBoundary,
];

const worldMaskCoordinates: [number, number][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

type PolygonFeature = {
  geometry: {
    coordinates: [number, number][][],
    type: "Polygon";
  };
  properties: Record<string, never>;
  type: "Feature";
};

export const bulgariaMaskGeoJson: PolygonFeature = {
  geometry: {
    coordinates: [worldMaskCoordinates, bulgariaBoundaryCoordinates],
    type: "Polygon",
  },
  properties: {},
  type: "Feature",
};

export const bulgariaBorderGeoJson: PolygonFeature = {
  geometry: {
    coordinates: [bulgariaBoundaryCoordinates],
    type: "Polygon",
  },
  properties: {},
  type: "Feature",
};

export function isWithinBulgariaBounds(location: {
  latitude: number;
  longitude: number;
}) {
  return (
    location.latitude >= bulgariaBounds.south &&
    location.latitude <= bulgariaBounds.north &&
    location.longitude >= bulgariaBounds.west &&
    location.longitude <= bulgariaBounds.east
  );
}

export function clampToBulgariaBounds(location: {
  latitude: number;
  longitude: number;
}) {
  return {
    latitude: Math.min(
      Math.max(location.latitude, bulgariaBounds.south),
      bulgariaBounds.north,
    ),
    longitude: Math.min(
      Math.max(location.longitude, bulgariaBounds.west),
      bulgariaBounds.east,
    ),
  };
}
