"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { RasterWorldMap } from "@/components/map/RasterWorldMap";
import { cn } from "@/lib/cn";
import {
  defaultMapCenter,
  defaultMapZoom,
  mapboxToken,
} from "@/lib/mapbox";
import type { MapLocationTarget, Memory } from "@/types";

const memorySourceId = "apoo-memories";
const memoryClusterLayerId = "apoo-memory-clusters";
const memoryClusterCountLayerId = "apoo-memory-cluster-count";
const memoryPointLayerId = "apoo-memory-points";

type MemoryMapProps = {
  className?: string;
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  searchTarget?: MapLocationTarget | null;
};

export function MemoryMap({
  className,
  memories,
  onMemorySelect,
  searchTarget,
}: MemoryMapProps) {
  const rasterMarkers = useMemo(
    () =>
      memories.map((memory) => ({
        id: memory.id,
        latitude: memory.latitude,
        longitude: memory.longitude,
        onClick: () => onMemorySelect(memory),
        privacy: memory.privacy,
        title: memory.title,
      })),
    [memories, onMemorySelect],
  );

  if (!mapboxToken) {
    return (
      <RasterWorldMap
        clusterMarkers
        className={className}
        markers={rasterMarkers}
        searchTarget={searchTarget}
      />
    );
  }

  return (
    <MapboxMemoryMap
      className={className}
      memories={memories}
      onMemorySelect={onMemorySelect}
      searchTarget={searchTarget}
    />
  );
}

function MapboxMemoryMap({
  className,
  memories,
  onMemorySelect,
  searchTarget,
}: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const memoriesRef = useRef(memories);
  const onMemorySelectRef = useRef(onMemorySelect);
  const [mapReady, setMapReady] = useState(false);

  const memoryData = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
    () => ({
      features: memories.map((memory) => ({
        geometry: {
          coordinates: [memory.longitude, memory.latitude],
          type: "Point",
        },
        properties: {
          memoryId: memory.id,
          privacy: memory.privacy,
          title: memory.title,
        },
        type: "Feature",
      })),
      type: "FeatureCollection",
    }),
    [memories],
  );

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);

  useEffect(() => {
    onMemorySelectRef.current = onMemorySelect;
  }, [onMemorySelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      center: defaultMapCenter,
      container: containerRef.current,
      renderWorldCopies: true,
      style: "mapbox://styles/mapbox/light-v11",
      zoom: defaultMapZoom,
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );

    const addMemoryLayers = () => {
      if (!mapRef.current || mapRef.current.getSource(memorySourceId)) {
        return;
      }

      mapRef.current.addSource(memorySourceId, {
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 48,
        data: memoryData,
        type: "geojson",
      });

      mapRef.current.addLayer({
        filter: ["has", "point_count"],
        id: memoryClusterLayerId,
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#f7c9c8",
            10,
            "#f4a4a4",
            50,
            "#ee7979",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 19, 50, 24],
          "circle-stroke-color": "#20262f",
          "circle-stroke-width": 1,
        },
        source: memorySourceId,
        type: "circle",
      });

      mapRef.current.addLayer({
        filter: ["has", "point_count"],
        id: memoryClusterCountLayerId,
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 11,
        },
        paint: {
          "text-color": "#20262f",
        },
        source: memorySourceId,
        type: "symbol",
      });

      mapRef.current.addLayer({
        filter: ["!", ["has", "point_count"]],
        id: memoryPointLayerId,
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "privacy"], "private"],
            "#7a7ecb",
            "#f7c9c8",
          ],
          "circle-radius": 8,
          "circle-stroke-color": "#20262f",
          "circle-stroke-width": 2,
        },
        source: memorySourceId,
        type: "circle",
      });

      mapRef.current.on("click", memoryClusterLayerId, (event) => {
        const feature = event.features?.[0];
        const coordinates = (feature?.geometry as GeoJSON.Point | undefined)
          ?.coordinates;

        if (!coordinates) {
          return;
        }

        mapRef.current?.easeTo({
          center: coordinates as [number, number],
          duration: 650,
          zoom: Math.min(18, (mapRef.current?.getZoom() ?? 1) + 2),
        });
      });

      mapRef.current.on("click", memoryPointLayerId, (event) => {
        const memoryId = String(event.features?.[0]?.properties?.memoryId ?? "");
        const memory = memoriesRef.current.find((item) => item.id === memoryId);

        if (memory) {
          onMemorySelectRef.current(memory);
        }
      });

      mapRef.current.on("mouseenter", memoryClusterLayerId, () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "pointer";
        }
      });
      mapRef.current.on("mouseleave", memoryClusterLayerId, () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "";
        }
      });
      mapRef.current.on("mouseenter", memoryPointLayerId, () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "pointer";
        }
      });
      mapRef.current.on("mouseleave", memoryPointLayerId, () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "";
        }
      });
    };

    mapRef.current.once("load", () => {
      addMemoryLayers();
      setMapReady(true);
    });

    return () => {
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const source = mapRef.current.getSource(memorySourceId) as
      | mapboxgl.GeoJSONSource
      | undefined;

    source?.setData(memoryData);

    if (memories.length > 0 && !searchTarget) {
      const bounds = new mapboxgl.LngLatBounds();
      memories.forEach((memory) => bounds.extend([memory.longitude, memory.latitude]));
      mapRef.current.fitBounds(bounds, {
        duration: 900,
        maxZoom: 13,
        padding: 80,
      });
    }
  }, [memories, memoryData, mapReady, searchTarget]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = null;

    if (!searchTarget) {
      return;
    }

    const element = document.createElement("div");
    element.setAttribute("aria-label", `Searched address: ${searchTarget.label}`);
    element.className =
      "h-9 w-9 rounded-full border-4 border-white bg-[#2563eb] shadow-[0_12px_28px_rgba(37,99,235,0.35)] ring-4 ring-blue-500/25";

    searchMarkerRef.current = new mapboxgl.Marker({ anchor: "center", element })
      .setLngLat([searchTarget.longitude, searchTarget.latitude])
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [searchTarget.longitude, searchTarget.latitude],
      duration: 950,
      essential: true,
      zoom: Math.max(mapRef.current.getZoom(), 13),
    });
  }, [searchTarget]);

  return (
    <div
      className={cn("min-h-[520px] w-full rounded-lg", className)}
      ref={containerRef}
    />
  );
}
