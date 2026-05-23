import type { StyleSpecification } from "mapbox-gl";

export const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export const defaultMapCenter: [number, number] = [0, 20];
export const defaultMapZoom = 1.25;

export const fallbackMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    cartoLight: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      type: "raster",
    },
  },
  layers: [
    {
      id: "cartoLight",
      source: "cartoLight",
      type: "raster",
    },
  ],
};
