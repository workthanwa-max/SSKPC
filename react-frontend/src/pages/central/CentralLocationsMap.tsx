import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient } from '../../services/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, X, Mail, User as UserIcon, Compass, Search, Layers, MapPin, Target, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Custom Enterprise Marker (HTML/CSS Based)
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="
          background-color: ${color}; 
          width: 28px; height: 28px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.4); 
          display: flex; align-items: center; justify-content: center; z-index: 10;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
        <div style="
          position: absolute; top: 22px; 
          width: 0; height: 0; 
          border-left: 8px solid transparent; 
          border-right: 8px solid transparent; 
          border-top: 12px solid ${color}; 
          filter: drop-shadow(0 4px 2px rgba(0,0,0,0.3)); z-index: 5;">
        </div>
      </div>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    tooltipAnchor: [0, -45]
  });
};

const mapLayers = {
  google_hybrid: { name: 'ดาวเทียมผสมถนน (Google)', desc: 'เหมาะสำหรับดูพื้นที่จริงพร้อมระบุเส้นทางและชื่อถนน', url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' },
  google_street: { name: 'แผนที่ถนน (Google)', desc: 'แผนที่มาตรฐาน เน้นดูการคมนาคมและสถานที่', url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' },
  google_satellite: { name: 'ดาวเทียมล้วน (Google)', desc: 'ดูสภาพพื้นที่จริงจากมุมสูงแบบไม่มีเส้นทางบัง', url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' },
  google_terrain: { name: 'ภูมิประเทศ (Google)', desc: 'ดูลักษณะความสูง-ต่ำของภูเขาและแม่น้ำ', url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}' },
  esri_satellite: { name: 'ดาวเทียมความละเอียดสูง (Esri)', desc: 'ภาพถ่ายทางอากาศแบบคมชัดพิเศษในบางพื้นที่', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  osm: { name: 'แผนที่ชุมชน (OpenStreetMap)', desc: 'แผนที่แบบเปิด มักจะมีเส้นทางในชุมชนที่แม่นยำ', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  topo: { name: 'ระดับความสูง (OpenTopoMap)', desc: 'แผนที่แสดงเส้นชั้นความสูง (Contour) สำหรับการเดินป่า', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  carto_dark: { name: 'โหมดกลางคืน (Dark Matter)', desc: 'ถนอมสายตาเวลากลางคืน เน้นให้หมุดโดดเด่น', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  carto_light: { name: 'โหมดสะอาดตา (Positron)', desc: 'สีพื้นหลังอ่อนมาก เหมาะสำหรับพรีเซนต์ภาพรวม', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
};

const defaultCenter = { lat: 14.1, lng: 103.5 }; // approximate center of lower esan

interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  isReady: boolean;
  user: {
    name: string;
    email: string;
    status: string;
  };
}

function MapController({ locations, selectedLocation, resetTrigger }: { locations: Location[], selectedLocation: Location | null, resetTrigger: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      // Smooth FlyTo when selected
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 15, { 
        animate: true, 
        duration: 1.8 
      });
    }
  }, [selectedLocation, map]);

  useEffect(() => {
    // Initial bounds fit & manual reset
    if (locations.length > 0 && !selectedLocation) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    }
  }, [locations, selectedLocation, resetTrigger, map]);

  return null;
}

export default function CentralLocationsMap() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [layerType, setLayerType] = useState<keyof typeof mapLayers>('google_hybrid');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await apiClient.get('/api/v1/locations');
      setLocations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const filteredLocations = useMemo(() => {
    if (!searchTerm) return [];
    return locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [locations, searchTerm]);

  return (
    // Fixed layout spanning the entire screen under the header (header is h-16 = 4rem)
    <div className="fixed top-16 left-0 right-0 bottom-0 z-10 bg-slate-100 overflow-hidden font-sans flex">
      
      {/* 1. MAP CANVAS */}
      <div className="flex-1 relative h-full w-full">
        <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={8} zoomControl={false} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url={mapLayers[layerType].url}
          />
          {locations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.latitude, loc.longitude]}
              icon={createCustomIcon(!loc.isReady ? '#ef4444' : loc.user.status === 'SUSPENDED' ? '#f59e0b' : '#4f46e5')} // Red if not ready, Amber if suspended, Indigo if active
              eventHandlers={{ click: () => setSelectedLocation(loc) }}
            >
              <Tooltip direction="top" opacity={1} className="custom-tooltip border-none shadow-xl rounded-xl p-0 overflow-hidden bg-transparent">
                <div className="bg-white/95 backdrop-blur-md p-3 min-w-[200px]">
                  <p className="font-bold text-slate-900 text-base mb-1">{loc.name}</p>
                  <p className="text-xs font-medium text-slate-500 mb-2">{loc.user.name}</p>
                  {!loc.isReady && (
                    <Badge variant="destructive" className="mb-2 text-[10px] w-full justify-center">งดรับชั่วคราว</Badge>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0">
                      {loc.latitude.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0">
                      {loc.longitude.toFixed(4)}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-blue-500 mt-2 font-semibold">คลิกเพื่อดูรายละเอียดเพิ่มเติม</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
          <MapController locations={locations} selectedLocation={selectedLocation} resetTrigger={resetTrigger} />
        </MapContainer>

        {/* 2. FLOATING CONTROL PANEL (Left) */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[400] flex flex-col gap-4 w-[calc(100%-2rem)] sm:w-80 sm:max-w-sm pointer-events-none">
          
          {/* Header Panel */}
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-slate-200/60 pointer-events-auto transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
                <Compass className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 truncate">เรดาร์ติดตาม (Radar View)</h1>
                <p className="text-xs md:text-sm font-medium text-slate-500 truncate">
                  ระบบเฝ้าระวังพิกัดศูนย์พักพิงและจุดหลบภัยฉุกเฉิน
                </p>
              </div>
            </div>
            {locations.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                พบ {locations.length} ศูนย์ในพื้นที่
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" />
                กำลังสแกนพื้นที่...
              </span>
            )}
          </div>

          {/* Search & Filters */}
          <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-slate-200/60 pointer-events-auto flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="ค้นหาศูนย์พักพิง..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200/60 rounded-xl h-10 text-sm focus-visible:ring-indigo-500"
              />
              {filteredLocations.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-200 p-2 max-h-48 overflow-y-auto z-50">
                  {filteredLocations.map(loc => (
                    <button 
                      key={loc.id} 
                      onClick={() => {
                        setSelectedLocation(loc);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 font-medium text-slate-700 truncate"
                    >
                      <MapPin className="inline size-3.5 mr-2 text-indigo-500" />
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layer Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="w-full justify-between rounded-xl border-slate-200/60 bg-slate-50 hover:bg-slate-100">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Layers className="size-4" />
                    {mapLayers[layerType].name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(22rem)] rounded-xl font-sans max-h-96 overflow-y-auto" align="start">
                {Object.entries(mapLayers).map(([key, layer]) => (
                  <DropdownMenuItem 
                    key={key} 
                    onClick={() => setLayerType(key as keyof typeof mapLayers)}
                    className="cursor-pointer py-3 px-4 flex flex-col items-start gap-1 focus:bg-indigo-50"
                  >
                    <span className={`font-bold ${layerType === key ? 'text-indigo-600' : 'text-slate-800'}`}>
                      {layer.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {layer.desc}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 3. MAP CONTROLS (Bottom Right) */}
        <div 
          className={`absolute bottom-4 sm:bottom-6 z-[400] flex flex-col gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedLocation ? 'right-4 sm:right-[400px]' : 'right-4 sm:right-6'}`} 
        >
           <Button 
            variant="default" 
            size="icon" 
            className="rounded-full h-12 w-12 shadow-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            onClick={() => {
              setSelectedLocation(null);
              setResetTrigger(prev => prev + 1);
            }}
            title="รีเซ็ตมุมมองแผนที่"
          >
            <Target className="size-5" />
          </Button>
        </div>
      </div>

      {/* 4. SLIDE-OVER DETAIL PANEL (Right) */}
      <div 
        className={`absolute top-0 right-0 z-[500] h-full w-full sm:w-[420px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-slate-200 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          selectedLocation ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedLocation && (
          <>
            {/* Hero Header */}
            <div className={`relative h-40 shrink-0 border-b overflow-hidden ${selectedLocation.isReady ? 'bg-gradient-to-br from-slate-50 to-indigo-50/50 border-slate-100' : 'bg-gradient-to-br from-rose-50 to-red-100/50 border-rose-200'}`}>
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 ${selectedLocation.isReady ? 'bg-indigo-500/5' : 'bg-rose-500/10'}`}></div>
              
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={() => setSelectedLocation(null)} className={`rounded-full size-8 hover:bg-white/50 ${selectedLocation.isReady ? 'text-slate-500' : 'text-rose-500'}`}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <Badge className={`mb-3 border-none px-3 py-1 text-[10px] font-black tracking-widest shadow-sm ${!selectedLocation.isReady ? 'bg-rose-600 text-white' : selectedLocation.user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {!selectedLocation.isReady ? 'OFFLINE (งดรับชั่วคราว)' : selectedLocation.user.status === 'ACTIVE' ? 'ONLINE (พร้อมรับรอง)' : 'SUSPENDED'}
                </Badge>
                <h3 className={`text-2xl font-black leading-tight ${!selectedLocation.isReady ? 'text-rose-950' : 'text-slate-900'}`}>{selectedLocation.name}</h3>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <div className="p-6 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-3">
                    <UserIcon className="size-3.5 text-indigo-400" /> เจ้าหน้าที่รับผิดชอบ
                  </p>
                  <div>
                    <p className="font-black text-lg text-slate-800">{selectedLocation.user.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      <Mail className="size-4 text-indigo-500" /> 
                      <span className="truncate font-medium">{selectedLocation.user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:border-amber-200 transition-colors">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-3">
                    <MapPin className="size-3.5 text-amber-400" /> บริบทพื้นที่และจุดสังเกต
                  </p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl">
                    {selectedLocation.description || 'ไม่มีการระบุรายละเอียดเพิ่มเติมจากสาขา'}
                  </p>
                </div>

                {/* Coordinates Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
                    <Target className="size-3.5 text-emerald-400" /> พิกัดภูมิศาสตร์ (GPS)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center relative overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-wider">LATITUDE</p>
                      <p className="font-mono text-base text-slate-800 font-bold">{selectedLocation.latitude.toFixed(5)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center relative overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-wider">LONGITUDE</p>
                      <p className="font-mono text-base text-slate-800 font-bold">{selectedLocation.longitude.toFixed(5)}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
              <Button 
                className="w-full gap-2 rounded-xl h-14 text-sm font-bold shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:-translate-y-1 active:translate-y-0"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`, '_blank')}
              >
                <Navigation className="size-5" />
                เริ่มระบบนำทาง (Google Maps)
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
