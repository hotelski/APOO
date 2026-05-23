import { bulgariaCenter, bulgariaDefaultZoom } from "@/lib/bulgaria";

export const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export const defaultMapCenter = bulgariaCenter;
export const defaultMapZoom = bulgariaDefaultZoom;
