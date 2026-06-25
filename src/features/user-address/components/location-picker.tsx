import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  CheckCircle2,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: LocationCoordinate | null;
  confirmed: boolean;
  onChange: (coordinate: LocationCoordinate) => void;
  onConfirm: () => void;
  onLocationLoaded?: (coordinate: LocationCoordinate) => void;
  onLocationError?: (message: string) => void;
}

interface Point {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  mode: 'map' | 'pin';
  startClient: Point;
  startCenter: LocationCoordinate;
  moved: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const TILE_SIZE = 256;
const DEFAULT_CENTER: LocationCoordinate = { latitude: -6.2088, longitude: 106.8456 };
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 3;
const MAX_ZOOM = 19;
const MAP_UI_SELECTOR = '[data-map-ui="true"]';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeLongitude = (longitude: number) => {
  let nextLongitude = longitude;
  while (nextLongitude < -180) nextLongitude += 360;
  while (nextLongitude > 180) nextLongitude -= 360;
  return nextLongitude;
};

const coordinateToPixel = (coordinate: LocationCoordinate, zoom: number): Point => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLatitude = Math.sin((clamp(coordinate.latitude, -85.0511, 85.0511) * Math.PI) / 180);

  return {
    x: ((coordinate.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
};

const pixelToCoordinate = (point: Point, zoom: number): LocationCoordinate => {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (point.x / scale) * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * point.y) / scale)));
  const latitude = (latitudeRadians * 180) / Math.PI;

  return {
    latitude: Number(clamp(latitude, -85.0511, 85.0511).toFixed(7)),
    longitude: Number(normalizeLongitude(longitude).toFixed(7)),
  };
};

const formatCoordinate = (coordinate: LocationCoordinate | null) =>
  coordinate ? `${coordinate.latitude.toFixed(7)}, ${coordinate.longitude.toFixed(7)}` : '';

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 60_000,
      timeout: 15_000,
    });
  });

const isLocationPermissionDenied = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'number' &&
  error.code === 1;

export function LocationPicker({
  value,
  confirmed,
  onChange,
  onConfirm,
  onLocationLoaded,
  onLocationError,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const initialValueRef = useRef(value);
  const onLocationLoadedRef = useRef(onLocationLoaded);
  const onLocationErrorRef = useRef(onLocationError);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [center, setCenter] = useState<LocationCoordinate>(value ?? DEFAULT_CENTER);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinate | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onLocationLoadedRef.current = onLocationLoaded;
    onLocationErrorRef.current = onLocationError;
  }, [onLocationError, onLocationLoaded]);

  useEffect(() => {
    if (!isExpanded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let frame = 0;
    const measure = () => {
      const rect = map.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setSize({ width: rect.width, height: rect.height });
    });

    resizeObserver.observe(map);
    measure();
    frame = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [isExpanded]);

  useEffect(() => {
    if (value) setCenter(value);
  }, [value]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3 || confirmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '5');
        url.searchParams.set('q', query);

        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to search locations');

        const results = (await res.json()) as SearchResult[];
        setSearchResults(results);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [confirmed, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentLocation = async () => {
      if (!('geolocation' in navigator)) {
        setIsLoadingLocation(false);
        onLocationErrorRef.current?.('GPS is not supported by this browser');
        return;
      }

      try {
        const position = await getCurrentPosition();
        if (!isMounted) return;

        const coordinate = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        };

        setCurrentLocation(coordinate);
        if (!initialValueRef.current) setCenter(coordinate);
        onLocationLoadedRef.current?.(coordinate);
      } catch (error: unknown) {
        if (!isMounted) return;
        const message = isLocationPermissionDenied(error)
          ? 'Location permission denied. Please select your location manually.'
          : 'Failed to detect current location. Please select your location manually.';
        onLocationErrorRef.current?.(message);
      } finally {
        if (isMounted) setIsLoadingLocation(false);
      }
    };

    loadCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const projectToScreen = (coordinate: LocationCoordinate): Point | null => {
    if (!size.width || !size.height) return null;

    const centerPixel = coordinateToPixel(center, zoom);
    const coordinatePixel = coordinateToPixel(coordinate, zoom);

    return {
      x: coordinatePixel.x - centerPixel.x + size.width / 2,
      y: coordinatePixel.y - centerPixel.y + size.height / 2,
    };
  };

  const coordinateFromClientPoint = (clientPoint: Point) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerPixel = coordinateToPixel(center, zoom);
    const mapPoint = {
      x: centerPixel.x + (clientPoint.x - rect.left - rect.width / 2),
      y: centerPixel.y + (clientPoint.y - rect.top - rect.height / 2),
    };

    return pixelToCoordinate(mapPoint, zoom);
  };

  const tiles = useMemo(() => {
    if (!size.width || !size.height) return [];

    const centerPixel = coordinateToPixel(center, zoom);
    const topLeft = {
      x: centerPixel.x - size.width / 2,
      y: centerPixel.y - size.height / 2,
    };
    const minX = Math.floor(topLeft.x / TILE_SIZE);
    const maxX = Math.floor((topLeft.x + size.width) / TILE_SIZE);
    const minY = Math.floor(topLeft.y / TILE_SIZE);
    const maxY = Math.floor((topLeft.y + size.height) / TILE_SIZE);
    const tileCount = 2 ** zoom;
    const nextTiles = [];

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        if (y < 0 || y >= tileCount) continue;

        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        nextTiles.push({
          key: `${zoom}-${x}-${y}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - topLeft.x,
          top: y * TILE_SIZE - topLeft.y,
        });
      }
    }

    return nextTiles;
  }, [center, size.height, size.width, zoom]);

  const selectedPoint = value ? projectToScreen(value) : null;
  const currentPoint = currentLocation ? projectToScreen(currentLocation) : null;

  const selectCoordinate = (coordinate: LocationCoordinate) => {
    if (confirmed) return;
    onChange(coordinate);
  };

  const selectSearchResult = (result: SearchResult) => {
    if (confirmed) return;

    const coordinate = {
      latitude: Number(Number(result.lat).toFixed(7)),
      longitude: Number(Number(result.lon).toFixed(7)),
    };

    setSearchQuery(result.display_name);
    setSearchResults([]);
    setCenter(coordinate);
    selectCoordinate(coordinate);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (confirmed || (event.pointerType === 'mouse' && event.button !== 0)) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      mode: 'map',
      startClient: { x: event.clientX, y: event.clientY },
      startCenter: center,
      moved: false,
    };
  };

  const handlePinPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (confirmed || (event.pointerType === 'mouse' && event.button !== 0)) return;

    event.stopPropagation();
    mapRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      mode: 'pin',
      startClient: { x: event.clientX, y: event.clientY },
      startCenter: center,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || confirmed) return;

    const delta = {
      x: event.clientX - drag.startClient.x,
      y: event.clientY - drag.startClient.y,
    };
    if (Math.abs(delta.x) > 3 || Math.abs(delta.y) > 3) drag.moved = true;

    if (drag.mode === 'map') {
      const startPixel = coordinateToPixel(drag.startCenter, zoom);
      setCenter(pixelToCoordinate({ x: startPixel.x - delta.x, y: startPixel.y - delta.y }, zoom));
      return;
    }

    const coordinate = coordinateFromClientPoint({ x: event.clientX, y: event.clientY });
    if (coordinate) selectCoordinate(coordinate);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || confirmed) return;

    if (isMapUiTarget(event.target)) {
      dragRef.current = null;
      return;
    }

    dragRef.current = null;

    if (drag.mode === 'map' && !drag.moved) {
      const coordinate = coordinateFromClientPoint({ x: event.clientX, y: event.clientY });
      if (coordinate) selectCoordinate(coordinate);
    }
  };

  const changeZoom = (nextZoom: number) => {
    if (confirmed) return;
    setZoom(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
  };

  const recenterMap = () => {
    if (confirmed || !currentLocation) return;
    setCenter(currentLocation);
  };

  const isMapUiTarget = (target: EventTarget | null) =>
    target instanceof Element && target.closest(MAP_UI_SELECTOR) !== null;

  const mapBoxClassName = cn(
    'relative overflow-hidden border border-slate-200 bg-slate-100 select-none touch-none shadow-sm',
    isExpanded ? 'h-full min-h-[24rem] rounded-2xl' : 'h-72 rounded-lg',
    confirmed ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
  );

  const renderMapBox = () => (
    <div
      ref={mapRef}
      role="application"
      aria-label="Location picker map"
      className={mapBoxClassName}
      onPointerDown={(event) => {
        if (isMapUiTarget(event.target)) return;
        handlePointerDown(event);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current = null;
      }}
    >
      <div className="absolute left-3 right-14 top-3 z-10" data-map-ui="true">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            readOnly={confirmed}
            placeholder="Search location or landmark"
            className="h-10 rounded-lg bg-white/95 pl-9 pr-9 shadow-sm"
            aria-label="Search location on map"
          />
          {searchQuery && !confirmed && (
            <button
              type="button"
              aria-label="Clear location search"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {(isSearching || searchResults.length > 0) && !confirmed && (
            <div
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
              data-map-ui="true"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {isSearching && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching locations...
                </div>
              )}
              {!isSearching &&
                searchResults.map(result => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => selectSearchResult(result)}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-700" />
                    <span className="max-h-10 overflow-hidden text-slate-700">{result.display_name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {tiles.map(tile => (
        <img
          key={tile.key}
          src={tile.url}
          alt=""
          draggable={false}
          className="absolute h-64 w-64 max-w-none"
          style={{ left: tile.left, top: tile.top }}
        />
      ))}

      {currentPoint && (
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-500 shadow"
          style={{ left: currentPoint.x, top: currentPoint.y }}
          aria-label="Current location"
        />
      )}

      {selectedPoint && (
        <button
          type="button"
          aria-label={confirmed ? 'Confirmed selected location' : 'Drag selected location pin'}
          disabled={confirmed}
          onPointerDown={handlePinPointerDown}
          className="absolute -translate-x-1/2 -translate-y-full disabled:cursor-not-allowed"
          style={{ left: selectedPoint.x, top: selectedPoint.y }}
        >
          <MapPin className={cn('h-9 w-9 drop-shadow-md', confirmed ? 'fill-slate-600 text-slate-700' : 'fill-indigo-600 text-slate-800')} />
        </button>
      )}

      {confirmed && (
        <div className="absolute inset-0 bg-white/20">
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" data-map-ui="true">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={confirmed || zoom >= MAX_ZOOM}
          onClick={() => changeZoom(zoom + 1)}
          className="flex h-9 w-9 items-center justify-center hover:bg-slate-50 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={confirmed || zoom <= MIN_ZOOM}
          onClick={() => changeZoom(zoom - 1)}
          className="flex h-9 w-9 items-center justify-center border-t border-slate-200 hover:bg-slate-50 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2" data-map-ui="true">
        <button
          type="button"
          aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
          onClick={() => setIsExpanded((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          aria-label="Center map on current location"
          disabled={confirmed || !currentLocation}
          onClick={recenterMap}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-40"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section className={cn('space-y-3', isExpanded && 'fixed inset-0 z-[60] m-0 flex flex-col bg-slate-950/60 p-3 sm:p-6')}>
      {isExpanded ? (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Map Location</p>
              <p className="text-xs text-slate-500">
                {confirmed ? 'Location is confirmed and locked.' : 'Tap the map or drag the pin to choose exact coordinates.'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Collapse map"
              onClick={() => setIsExpanded(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
            <div className="min-h-0 flex-1">
              {renderMapBox()}
            </div>
            <div className="space-y-3 lg:w-80 lg:shrink-0 lg:overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Selected Coordinates *</label>
                <Input
                  readOnly
                  value={formatCoordinate(value)}
                  placeholder="Tap the map to select coordinates"
                  className="pl-3 bg-slate-50 text-slate-700"
                  aria-live="polite"
                />
              </div>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!value || confirmed}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
                  confirmed
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-500',
                )}
              >
                {confirmed ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {confirmed ? 'Location Confirmed' : 'Confirm Map Location'}
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Tip: use fullscreen when you need more precision, especially in dense areas or when placing a pin on
                the right street side.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block">Map Location *</label>
              <p className="text-xs text-slate-500 mt-0.5">
                {confirmed ? 'Location is confirmed and locked.' : 'Tap the map or drag the pin to choose exact coordinates.'}
              </p>
            </div>
            {isLoadingLocation && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Locating
              </span>
            )}
          </div>

          {renderMapBox()}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Selected Coordinates *</label>
            <Input
              readOnly
              value={formatCoordinate(value)}
              placeholder="Tap the map to select coordinates"
              className="pl-3 bg-slate-50 text-slate-700"
              aria-live="polite"
            />
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!value || confirmed}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
              confirmed
                ? 'bg-slate-100 text-slate-700'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-500',
            )}
          >
            {confirmed ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {confirmed ? 'Location Confirmed' : 'Confirm Map Location'}
          </button>
        </>
      )}
    </section>
  );
}
