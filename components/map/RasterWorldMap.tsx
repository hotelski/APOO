"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  bulgariaLeafletBoundary,
  bulgariaLeafletBounds,
  bulgariaLeafletMask,
  bulgariaLeafletMaxBounds,
  clampToBulgariaBounds,
  isWithinBulgariaBounds,
} from "@/lib/bulgaria";
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
  markers?: RasterWorldMapMarker[];
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  searchTarget?: MapLocationTarget | null;
};

export function RasterWorldMap({
  ariaLabel = "World map",
  className,
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
        maxBounds: bulgariaLeafletMaxBounds,
        maxBoundsViscosity: 1,
        minZoom: 6,
        scrollWheelZoom: true,
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

      L.polygon(bulgariaLeafletMask, {
        className: "apoo-bulgaria-mask",
        fillColor: "#20262f",
        fillOpacity: 0.64,
        fillRule: "evenodd",
        interactive: false,
        stroke: false,
      }).addTo(map);

      L.polyline(bulgariaLeafletBoundary, {
        className: "apoo-bulgaria-border",
        color: "#f8fafc",
        interactive: false,
        opacity: 0.95,
        weight: 2.5,
      }).addTo(map);

      map.on("click", (event) => {
        const location = {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        };

        if (!isWithinBulgariaBounds(location)) {
          return;
        }

        onMapClickRef.current?.(location);
      });

      mapRef.current = map;
      setLeaflet(L);
      map.fitBounds(bulgariaLeafletBounds, {
        animate: false,
        padding: [24, 24],
      });

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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = markers.map((marker) => {
      const isPrivate = marker.privacy === "private";
      const icon: DivIcon = leaflet.divIcon({
        className: "",
        html: `<span class="flex h-7 w-7 items-center justify-center rounded-full border border-[#20262f] text-[11px] font-bold shadow-[0_6px_18px_rgba(32,38,47,0.22)] transition ${isPrivate ? "bg-[#7a7ecb] text-white" : "bg-[#f7c9c8] text-[#20262f]"}">${marker.label ?? "1"}</span>`,
        iconAnchor: [14, 14],
        iconSize: [28, 28],
      });

      const location = clampToBulgariaBounds(marker);
      const leafletMarker = leaflet
        .marker([location.latitude, location.longitude], {
          icon,
          keyboard: Boolean(marker.onClick),
          title: marker.title,
        })
        .addTo(map);

      if (marker.onClick) {
        leafletMarker.on("click", marker.onClick);
      }

      return leafletMarker;
    });

    if (markers.length === 0) {
      return;
    }

    if (markers.length === 1 && onMapClick) {
      const [marker] = markers;
      const location = clampToBulgariaBounds(marker);
      map.setView(
        [location.latitude, location.longitude],
        Math.max(map.getZoom(), 9),
        {
          animate: true,
        },
      );
      return;
    }

    if (searchTarget) {
      return;
    }

    const bounds = markers.map((marker) => {
      const location = clampToBulgariaBounds(marker);

      return [location.latitude, location.longitude];
    }) as LatLngBoundsExpression;

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

    if (!searchTarget || !isWithinBulgariaBounds(searchTarget)) {
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
