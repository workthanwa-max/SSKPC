import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient } from '../../services/api/apiClient';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Save, RefreshCw, Navigation, LocateFixed, Info, Store } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

// Fix Leaflet marker icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Default center (Thailand)
const defaultCenter = { lat: 13.7563, lng: 100.5018 };

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}

export default function BranchLocation() {
  const [isEditing, setIsEditing] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [position, setPosition] = useState(defaultCenter);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/api/v1/locations/me');
      if (res.data?.data) {
        setHasLocation(true);
        setFormData({
          name: res.data.data.name,
          description: res.data.data.description || '',
        });
        setPosition({
          lat: res.data.data.latitude,
          lng: res.data.data.longitude,
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No location yet
        setHasLocation(false);
        setIsEditing(true);
        getCurrentLocation();
      } else {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลพิกัด');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // If denied or error, fallback to defaultCenter (already set)
        }
      );
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition({ lat: latLng.lat, lng: latLng.lng });
        }
      },
    }),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        latitude: position.lat,
        longitude: position.lng,
      };

      if (hasLocation) {
        await apiClient.put('/api/v1/locations/me', payload);
        setSuccess('อัปเดตข้อมูลพิกัดสำเร็จ');
        setIsEditing(false);
      } else {
        await apiClient.post('/api/v1/locations', payload);
        setSuccess('ตั้งค่าพิกัดสำเร็จ');
        setHasLocation(true);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw className="size-8 animate-spin" />
          <p>กำลังโหลดข้อมูลพิกัด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
            <MapPin className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {hasLocation ? 'จัดการพิกัดศูนย์พักพิง' : 'ตั้งค่าพิกัดศูนย์พักพิง'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              กำหนดข้อมูลศูนย์พักพิงและปักหมุดตำแหน่งที่ตั้งเพื่อให้ศูนย์บัญชาการกลางมองเห็น
            </p>
          </div>
        </div>
        
        {hasLocation && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 relative z-10 shadow-sm border-slate-200">
            <MapPin className="size-4" />
            ปรับปรุงพิกัด
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
          <AlertTriangle className="size-4" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600 shadow-sm">
          <Navigation className="size-4" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Side: Form Details */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden h-fit">
            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Store className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">ข้อมูลศูนย์พักพิง</CardTitle>
                <CardDescription className="text-xs mt-1">รายละเอียดชื่อและคำอธิบาย</CardDescription>
              </div>
            </div>
            <CardContent className="p-6">
              <form id="location-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">ชื่อศูนย์/จุดพักพิง</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    required
                    placeholder="ระบุชื่อศูนย์พักพิง"
                    className="bg-slate-50/80 border-slate-200 h-11 rounded-xl transition-all focus:bg-white focus:shadow-md focus:shadow-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-semibold">รายละเอียด (เพิ่มเติม)</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    placeholder="ที่อยู่จุดสังเกต ฯลฯ"
                    className="bg-slate-50/80 border-slate-200 resize-none h-28 rounded-xl transition-all focus:bg-white focus:shadow-md focus:shadow-indigo-500/10"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-slate-700 font-semibold">พิกัดภูมิศาสตร์</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                      <p className="text-[10px] font-bold text-slate-400 mb-1">LATITUDE</p>
                      <p className="font-mono text-sm text-slate-700 font-semibold">{position.lat.toFixed(6)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
                      <p className="text-[10px] font-bold text-slate-400 mb-1">LONGITUDE</p>
                      <p className="font-mono text-sm text-slate-700 font-semibold">{position.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </form>
  
              {isEditing && (
                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                  {hasLocation && (
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-11 font-medium border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900" onClick={() => {
                      setIsEditing(false);
                      fetchLocation(); // reset
                    }}>
                      ยกเลิก
                    </Button>
                  )}
                  <Button type="submit" form="location-form" className="flex-1 gap-2 rounded-xl h-11 font-medium shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:-translate-y-0.5 active:translate-y-0" disabled={isSaving}>
                    <Save className="size-4" />
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex gap-4 text-blue-800 shadow-sm">
            <Info className="size-6 shrink-0 text-blue-500" />
            <p className="text-sm leading-relaxed">
              <strong>คำแนะนำ:</strong> ในโหมดแก้ไข คุณสามารถใช้เมาส์ <b>ลากหมุดบนแผนที่</b> หรือซูมเข้าเพื่อเลือกพิกัดที่แม่นยำที่สุดของศูนย์พักพิงได้
            </p>
          </div>
        </div>
  
        {/* Right Side: Map */}
        <Card className="lg:col-span-8 shadow-md border-slate-200/60 rounded-3xl overflow-hidden p-0 relative flex flex-col h-[600px] lg:h-auto">
          <div className="absolute top-6 right-6 z-[400] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-slate-200/60 flex items-center gap-3">
            {isEditing ? (
              <>
                <div className="size-2 rounded-full bg-blue-500 animate-ping absolute" />
                <div className="size-2 rounded-full bg-blue-500 relative" />
                <p className="text-sm font-bold text-slate-800 tracking-wide">โหมดระบุตำแหน่ง (ลากหมุดได้)</p>
              </>
            ) : (
              <>
                <LocateFixed className="size-4 text-emerald-500" />
                <p className="text-sm font-bold text-slate-800 tracking-wide">ตำแหน่งปัจจุบันของคุณ</p>
              </>
            )}
          </div>
          
          {isEditing && (
             <Button 
              variant="default"
              size="icon"
              className="absolute bottom-6 right-6 z-[400] h-12 w-12 rounded-full shadow-2xl bg-slate-900 hover:bg-slate-800 text-white border-2 border-white"
              onClick={getCurrentLocation}
              title="ใช้ตำแหน่งปัจจุบัน (GPS)"
             >
               <LocateFixed className="size-5" />
             </Button>
          )}
          
          <div className="flex-1 w-full z-0 relative">
            <MapContainer center={[position.lat, position.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
              <LayersControl position="bottomleft">
                <LayersControl.BaseLayer checked name="แผนที่ถนน (OpenStreetMap)">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="แผนที่ดาวเทียม (Satellite)">
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="แผนที่ภูมิประเทศ (Terrain)">
                  <TileLayer
                    attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              <Marker 
                draggable={isEditing} 
                eventHandlers={eventHandlers} 
                position={[position.lat, position.lng]} 
                ref={markerRef}
              >
                <Popup className="font-sans">
                  <b>{formData.name || 'ตำแหน่งของคุณ'}</b><br />
                  {isEditing ? 'เลื่อนหมุดเพื่อเปลี่ยนตำแหน่ง' : 'พิกัดที่บันทึกไว้'}
                </Popup>
              </Marker>
              <MapUpdater center={position} />
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
