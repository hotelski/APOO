"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { defaultMapCenter, defaultMapZoom } from "@/lib/mapbox";
import type { MapLocationTarget, MemoryPrivacy } from "@/types";
import type {
  DivIcon,
  LatLngBoundsExpression,
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet";

type LeafletModule = typeof import("leaflet");

type RasterWorldMapMarker = {
  id: string;
  label?: string;
  latitude: number;
  longitude: number;
  onClick?: () => void;
  privacy?: MemoryPrivacy;
  title?: string;
};

type RasterWorldMapProps = {
  ariaLabel?: string;
  className?: string;
  clusterMarkers?: boolean;
  markers?: RasterWorldMapMarker[];
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  searchTarget?: MapLocationTarget | null;
};

type RasterMarkerCluster = {
  count: number;
  id: string;
  latitude: number;
  longitude: number;
  markers: RasterWorldMapMarker[];
  privacy?: MemoryPrivacy;
  title?: string;
};

const maxClusterZoom = 19;

function formatClusterCount(count: number) {
  if (count >= 1000) {
    return `${Number((count / 1000).toFixed(1))}k`;
  }

  return String(count);
}

function clusterPixelRadiusForZoom(zoom: number) {
  return Math.max(12, Math.min(58, 70 - zoom * 3.1));
}

function markerSize(count: number) {
  if (count <= 1) {
    return 18;
  }

  if (count >= 1000) {
    return 38;
  }

  if (count >= 100) {
    return 34;
  }

  if (count >= 10) {
    return 30;
  }

  return 24;
}

function markerPalette(count: number, isPrivate: boolean) {
  if (isPrivate) {
    return {
      background: "#7a7ecb",
      color: "#ffffff",
    };
  }

  if (count <= 1) {
    return {
      background: "#f49b86",
      color: "#20262f",
    };
  }

  if (count <= 4) {
    return {
      background: "#fff2df",
      color: "#20262f",
    };
  }

  return {
    background: count >= 100 ? "#ee7979" : "#f7c9c8",
    color: "#20262f",
  };
}

function markerHtml(count: number, isPrivate: boolean) {
  const size = markerSize(count);
  const palette = markerPalette(count, isPrivate);
  const shadow =
    count <= 1
      ? "0 4px 12px rgba(32, 38, 47, 0.18)"
      : "0 7px 18px rgba(32, 38, 47, 0.2)";
  const baseStyle = [
    "align-items:center",
    `background:${palette.background}`,
    "border:1.5px solid #20262f",
    "border-radius:9999px",
    "box-sizing:border-box",
    `box-shadow:${shadow}`,
    `color:${palette.color}`,
    "display:flex",
    "font-family:Inter, Arial, sans-serif",
    "font-size:11px",
    "font-weight:700",
    "justify-content:center",
    `height:${size}px`,
    "line-height:1",
    `width:${size}px`,
  ].join(";");

  if (count <= 1) {
    return `<span style="${baseStyle};font-size:0;"></span>`;
  }

  return `<span style="${baseStyle};">${formatClusterCount(count)}</span>`;
}

function buildRasterClusters(
  leaflet: LeafletModule,
  map: LeafletMap,
  markers: RasterWorldMapMarker[],
  clusterMarkers: boolean,
): RasterMarkerCluster[] {
  if (!clusterMarkers) {
    return markers.map((marker) => ({
      count: 1,
      id: marker.id,
      latitude: marker.latitude,
      longitude: marker.longitude,
      markers: [marker],
      privacy: marker.privacy,
      title: marker.title,
    }));
  }

  const zoom = map.getZoom();
  const clusterPixelRadius = clusterPixelRadiusForZoom(zoom);
  const clusters: Array<RasterMarkerCluster & { pointX: number; pointY: number }> = [];

  for (const marker of markers) {
    const point = map.project(leaflet.latLng(marker.latitude, marker.longitude), zoom);
    const cluster = clusters.find((candidate) => {
      const distanceX = candidate.pointX - point.x;
      const distanceY = candidate.pointY - point.y;

      return Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= clusterPixelRadius;
    });

    if (cluster) {
      const nextCount = cluster.count + 1;
      cluster.latitude = (cluster.latitude * cluster.count + marker.latitude) / nextCount;
      cluster.longitude = (cluster.longitude * cluster.count + marker.longitude) / nextCount;
      cluster.pointX = (cluster.pointX * cluster.count + point.x) / nextCount;
      cluster.pointY = (cluster.pointY * cluster.count + point.y) / nextCount;
      cluster.count = nextCount;
      cluster.id = `${cluster.id}-${marker.id}`;
      cluster.markers.push(marker);
      cluster.privacy =
        cluster.privacy === "private" || marker.privacy === "private"
          ? "private"
          : marker.privacy;
      cluster.title = `${nextCount} memories`;
    } else {
      clusters.push({
        count: 1,
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        markers: [marker],
        pointX: point.x,
        pointY: point.y,
        privacy: marker.privacy,
        title: marker.title,
      });
    }
  }

  return clusters;
}

export function RasterWorldMap({
  ariaLabel = "World map",
  className,
  clusterMarkers = false,
  markers = [],
  onMapClick,
  searchTarget,
}: RasterWorldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const searchMarkerRef = useRef<LeafletMarker | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [mapViewVersion, setMapViewVersion] = useState(0);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    let active = true;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (!active || !containerRef.current) {
        return;
      }

      const map = L.map(containerRef.current, {
        center: [defaultMapCenter[1], defaultMapCenter[0]],
        maxBounds: [
          [-85, -220],
          [85, 220],
        ],
        minZoom: 2,
        scrollWheelZoom: true,
        worldCopyJump: true,
        zoom: Math.max(2, defaultMapZoom),
        zoomControl: false,
        zoomSnap: 0.25,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: ["a", "b", "c", "d"],
      }).addTo(map);

      map.on("click", (event) => {
        onMapClickRef.current?.({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      });

      mapRef.current = map;
      setLeaflet(L);

      window.setTimeout(() => map.invalidateSize(), 0);
    }

    initializeMap();

    return () => {
      active = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const rerenderMarkers = () => setMapViewVersion((version) => version + 1);

    map.on("zoomend", rerenderMarkers);
    map.on("moveend", rerenderMarkers);

    return () => {
      map.off("zoomend", rerenderMarkers);
      map.off("moveend", rerenderMarkers);
    };
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const clusters = buildRasterClusters(leaflet, map, markers, clusterMarkers);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = clusters.map((cluster) => {
      const isPrivate = cluster.privacy === "private";
      const size = markerSize(cluster.count);
      const icon: DivIcon = leaflet.divIcon({
        className: "",
        html: markerHtml(cluster.count, isPrivate),
        iconAnchor: [size / 2, size / 2],
        iconSize: [size, size],
      });

      const leafletMarker = leaflet
        .marker([cluster.latitude, cluster.longitude], {
          icon,
          keyboard: cluster.markers.some((marker) => Boolean(marker.onClick)),
          title: cluster.title,
        })
        .addTo(map);

      const [firstMarker] = cluster.markers;

      if (cluster.count > 1) {
        leafletMarker.on("click", () => {
          const nextZoom = Math.min(maxClusterZoom, map.getZoom() + 2);

          if (map.getZoom() >= maxClusterZoom - 0.25) {
            firstMarker?.onClick?.();
            return;
          }

          map.flyTo([cluster.latitude, cluster.longitude], nextZoom, {
            duration: 0.6,
          });
        });
      } else if (firstMarker?.onClick) {
        leafletMarker.on("click", firstMarker.onClick);
      }

      return leafletMarker;
    });
  }, [clusterMarkers, leaflet, markers, mapViewVersion]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    if (markers.length === 0) {
      return;
    }

    if (markers.length === 1 && onMapClick) {
      const [marker] = markers;
      map.setView([marker.latitude, marker.longitude], Math.max(map.getZoom(), 4), {
        animate: true,
      });
      return;
    }

    if (searchTarget) {
      return;
    }

    const bounds = markers.map((marker) => [
      marker.latitude,
      marker.longitude,
    ]) as LatLngBoundsExpression;

    map.fitBounds(bounds, {
      animate: true,
      maxZoom: 13,
      padding: [80, 80],
    });
  }, [leaflet, markers, onMapClick, searchTarget]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = null;

    if (!searchTarget) {
      return;
    }

    const icon = leaflet.divIcon({
      className: "",
      html: '<span class="block h-9 w-9 rounded-full border-4 border-white bg-[#2563eb] shadow-[0_12px_28px_rgba(37,99,235,0.35)] ring-4 ring-blue-500/25"></span>',
      iconAnchor: [18, 18],
      iconSize: [36, 36],
    });

    searchMarkerRef.current = leaflet
      .marker([searchTarget.latitude, searchTarget.longitude], {
        icon,
        title: searchTarget.label,
      })
      .addTo(map);

    const tooltip = document.createElement("span");
    tooltip.textContent = searchTarget.label;

    searchMarkerRef.current.bindTooltip(tooltip, {
      direction: "top",
      offset: [0, -16],
      opacity: 0.92,
    });

    map.flyTo([searchTarget.latitude, searchTarget.longitude], Math.max(map.getZoom(), 13), {
      duration: 0.95,
    });
  }, [leaflet, searchTarget]);

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "relative min-h-[520px] w-full overflow-hidden rounded-lg bg-[#d6e7f0]",
        onMapClick && "cursor-crosshair",
        className,
      )}
      ref={containerRef}
    />
  );
}
