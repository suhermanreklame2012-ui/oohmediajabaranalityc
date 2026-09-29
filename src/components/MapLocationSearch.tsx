import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Loader2, 
  X, 
  Navigation, 
  Sparkles, 
  Check, 
  AlertCircle,
  Building,
  Compass
} from 'lucide-react';

export interface GeocodedLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  queryName: string;
  locationType?: string;
}

interface MapLocationSearchProps {
  onLocationSelected: (location: GeocodedLocation) => void;
  isSearching?: boolean;
}

// Popular West Java landmark shortcuts for fast 1-click exploration
const WEST_JAVA_LANDMARKS = [
  { name: 'Gedung Sate', regency: 'Kota Bandung', query: 'Gedung Sate, Kota Bandung, Jawa Barat' },
  { name: 'Tol Pasteur Exit', regency: 'Kota Bandung', query: 'Gerbang Tol Pasteur, Kota Bandung, Jawa Barat' },
  { name: 'Margonda Raya', regency: 'Kota Depok', query: 'Jl. Margonda Raya, Kota Depok, Jawa Barat' },
  { name: 'Tugu Kujang Pajajaran', regency: 'Kota Bogor', query: 'Tugu Kujang, Jl. Pajajaran, Kota Bogor, Jawa Barat' },
  { name: 'Summarecon Ahmad Yani', regency: 'Kota Bekasi', query: 'Jl. Ahmad Yani, Kota Bekasi, Jawa Barat' },
  { name: 'Simpang Gadog Puncak', regency: 'Kabupaten Bogor', query: 'Simpang Gadog, Ciawi, Kabupaten Bogor, Jawa Barat' },
  { name: 'Kawasan Industri KIIC', regency: 'Kabupaten Karawang', query: 'Kawasan Industri KIIC, Karawang Barat, Jawa Barat' },
  { name: 'CSB Mall Cipto', regency: 'Kota Cirebon', query: 'Jl. Dr. Cipto Mangunkusumo, Kota Cirebon, Jawa Barat' }
];

export function MapLocationSearch({ onLocationSelected }: MapLocationSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Dago Bandung',
    'Tol Pasteur',
    'Margonda Depok'
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeGeocode = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setShowSuggestions(false);

    try {
      // 1. Primary: Query the server-side Google Maps Geocoding API proxy
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const firstResult = data.results[0];
          const location: GeocodedLocation = {
            lat: firstResult.geometry.location.lat,
            lng: firstResult.geometry.location.lng,
            formattedAddress: firstResult.formatted_address,
            queryName: searchQuery,
            locationType: firstResult.geometry.location_type
          };

          // Save to recent searches
          setRecentSearches(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5));
          onLocationSelected(location);
          setIsLoading(false);
          return;
        } else if (data.status === 'ZERO_RESULTS') {
          // Try fallback before giving up
        } else {
          console.warn('Geocoding API status:', data.status, data.error_message);
        }
      }

      // 2. Client-side SDK fallback if google.maps is loaded
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const clientResult = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({
            address: searchQuery.toLowerCase().includes('jawa barat') ? searchQuery : `${searchQuery}, Jawa Barat`,
            componentRestrictions: { country: 'ID' }
          }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results[0]);
            } else {
              reject(status);
            }
          });
        });

        if (clientResult) {
          const location: GeocodedLocation = {
            lat: clientResult.geometry.location.lat(),
            lng: clientResult.geometry.location.lng(),
            formattedAddress: clientResult.formatted_address,
            queryName: searchQuery
          };
          setRecentSearches(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5));
          onLocationSelected(location);
          setIsLoading(false);
          return;
        }
      }

      // If not found:
      setErrorMessage(`Lokasi "${searchQuery}" tidak ditemukan di area Jawa Barat. Coba tambahkan nama kota (contoh: "${searchQuery} Bandung").`);
    } catch (err: any) {
      console.error('Geocoding error:', err);
      setErrorMessage('Gagal menghubungi Google Maps Geocoding API. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeGeocode(query);
  };

  const handleSelectPreset = (landmarkQuery: string, displayName: string) => {
    setQuery(displayName);
    executeGeocode(landmarkQuery);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Search className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setErrorMessage(null);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Cari lokasi di Jabar (Geocoding API)..."
          className="w-full pl-9 pr-16 py-2 text-xs bg-slate-900/95 backdrop-blur-md text-slate-100 placeholder:text-slate-400 border border-slate-700/80 rounded-xl shadow-2xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setErrorMessage(null);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Cari</span>
          </button>
        </div>
      </form>

      {/* Error message */}
      {errorMessage && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs shadow-2xl flex items-start gap-2 z-40">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Auto-suggestions & Landmark Shortcuts Dropdown */}
      {showSuggestions && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl z-40 max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 mb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Pencarian Geocoding Cepat Jawa Barat
            </span>
            <span className="text-[10px] text-slate-500">Google Geocoding API</span>
          </div>

          {/* Quick Landmark Chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Simpul Koridor & Landmark Populer:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {WEST_JAVA_LANDMARKS.map(item => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectPreset(item.query, item.name)}
                  className="p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-lg text-left transition-all flex items-start gap-1.5 group"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-200 truncate group-hover:text-amber-300">
                      {item.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {item.regency}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pencarian Terakhir:
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      executeGeocode(term);
                    }}
                    className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-md transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
