"use client";

import { cn } from "@/lib/cn";
import type { MemoryPrivacy } from "@/types";

const tileZoom = 2;
const tileCount = 2 ** tileZoom;
const tileHosts = ["a", "b", "c", "d"];
const maxMercatorLatitude = 85.05112878;

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
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function tileUrl(x: number, y: number) {
  const host = tileHosts[(x + y) % tileHosts.length];

  return `https://${host}.basemaps.cartocdn.com/light_all/${tileZoom}/${x}/${y}.png`;
}

function projectLocation(latitude: number, longitude: number) {
  const clampedLatitude = clamp(latitude, -maxMercatorLatitude, maxMercatorLatitude);
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;
  const x = ((longitude + 180) / 360) * 100;
  const y =
    ((1 -
      Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) /
        Math.PI) /
      2) *
    100;

  return {
    left: `${clamp(x, 0, 100)}%`,
    top: `${clamp(y, 0, 100)}%`,
  };
}

function unprojectLocation(xRatio: number, yRatio: number) {
  const longitude = xRatio * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - 2 * yRatio)));
  const latitude = (latitudeRadians * 180) / Math.PI;

  return {
    latitude: clamp(latitude, -maxMercatorLatitude, maxMercatorLatitude),
    longitude: clamp(longitude, -180, 180),
  };
}

export function RasterWorldMap({
  ariaLabel = "World map",
  className,
  markers = [],
  onMapClick,
}: RasterWorldMapProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    onMapClick(
      unprojectLocation(
        clamp((event.clientX - rect.left) / rect.width, 0, 1),
        clamp((event.clientY - rect.top) / rect.height, 0, 1),
      ),
    );
  };

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "relative min-h-[520px] w-full overflow-hidden rounded-lg bg-[#d6e7f0]",
        onMapClick && "cursor-crosshair",
        className,
      )}
      onClick={handleClick}
      role={onMapClick ? "button" : "img"}
      tabIndex={onMapClick ? 0 : undefined}
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: tileCount }).flatMap((_, y) =>
          Array.from({ length: tileCount }).map((__, x) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="h-full w-full select-none object-fill"
              draggable={false}
              key={`${x}-${y}`}
              src={tileUrl(x, y)}
            />
          )),
        )}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),rgba(32,38,47,0.03))]" />

      {markers.map((marker) => {
        const position = projectLocation(marker.latitude, marker.longitude);
        const isPrivate = marker.privacy === "private";

        return (
          <button
            aria-label={marker.title ? `Open ${marker.title}` : "Open memory"}
            className={cn(
              "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#20262f] text-[11px] font-bold shadow-[0_6px_18px_rgba(32,38,47,0.22)] transition hover:scale-110",
              isPrivate ? "bg-[#7a7ecb] text-white" : "bg-[#f7c9c8] text-[#20262f]",
            )}
            key={marker.id}
            onClick={(event) => {
              event.stopPropagation();
              marker.onClick?.();
            }}
            style={position}
            type="button"
          >
            {marker.label ?? "1"}
          </button>
        );
      })}

      <div className="absolute bottom-1 right-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
        © OpenStreetMap © CARTO
      </div>
    </div>
  );
}
