import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldAlert, Navigation, Tent, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { apiClient } from '@/services/api/apiClient';

interface Shelter {
  id: string;
  name: string;
  description: string;
  capacity: number;
  isReady: boolean;
  latitude: number;
  longitude: number;
  currentOccupancy: number;
  distanceMeters: number;
}

export default function PublicHome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  // Secret Knock Logic
  const [knockCount, setKnockCount] = useState(0);
  const [lastKnockTime, setLastKnockTime] = useState(0);

  const handleSecretKnock = () => {
    const now = Date.now();
    if (now - lastKnockTime > 3000) {
      // Reset if more than 3 seconds since last click
      setKnockCount(1);
    } else {
      const newCount = knockCount + 1;
      setKnockCount(newCount);
      if (newCount >= 5) {
        navigate('/login');
      }
    }
    setLastKnockTime(now);
  };

  const requestLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('อุปกรณ์ของคุณไม่รองรับการระบุพิกัด GPS');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await apiClient.post('/api/v1/public/shelters/nearby', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShelters(res.data.data);
        } catch (error: any) {
          setErrorMsg(error.response?.data?.error || 'เกิดข้อผิดพลาดในการค้นหาศูนย์พักพิง');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg('กรุณาอนุญาตให้ระบบเข้าถึงพิกัด GPS ของคุณเพื่อค้นหาศูนย์ที่ใกล้ที่สุด');
        } else {
          setErrorMsg('ไม่สามารถดึงพิกัดของคุณได้ กรุณาลองใหม่อีกครั้ง');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} เมตร`;
    return `${(meters / 1000).toFixed(1)} กม.`;
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm select-none">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={handleSecretKnock}
          title="AEGIS Public Services"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">AEGIS</h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Public Services</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* Hero Banner */}
        <div className="bg-emerald-600 rounded-3xl p-6 text-white text-center shadow-xl shadow-emerald-600/20 relative overflow-hidden mt-4">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-2 shadow-inner">
              <MapPin className="size-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">ค้นหาศูนย์พักพิงใกล้คุณ</h2>
            <p className="text-emerald-100 text-sm font-medium leading-relaxed">
              ระบบจะแสดงศูนย์พักพิงที่อยู่ใกล้ตัวคุณที่สุด พร้อมระยะทางและสถานะการรับคน เพื่อให้คุณเดินทางไปได้อย่างปลอดภัย
            </p>
            <Button 
              onClick={requestLocation} 
              disabled={isLoading}
              size="lg"
              className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl h-14 text-lg font-bold mt-2 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  กำลังค้นหาสถานที่ปลอดภัย...
                </>
              ) : (
                '📍 ค้นหาศูนย์พักพิงใกล้ฉัน'
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-medium flex gap-3 items-start animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Search Results */}
        {shelters.length > 0 && (
          <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Tent className="w-5 h-5 text-emerald-600" />
              พบศูนย์พักพิงใกล้คุณ {shelters.length} แห่ง
            </h3>
            
            <div className="grid gap-3">
              {shelters.map((shelter) => (
                <Card 
                  key={shelter.id} 
                  className={`border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white group ${
                    shelter.isReady 
                      ? 'cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5' 
                      : 'opacity-70 cursor-not-allowed bg-slate-50'
                  }`}
                  onClick={() => shelter.isReady && setSelectedShelter(shelter)}
                >
                  <CardContent className="p-0">
                    <div className="flex h-full">
                      {/* Left Status Bar */}
                      
                      
                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2">{shelter.name}</h4>
                          <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-sm font-bold shrink-0 border border-blue-100">
                            <Navigation className="w-3.5 h-3.5" />
                            {formatDistance(shelter.distanceMeters)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border-0 ${
                            shelter.isReady 
                              ? 'text-emerald-700 bg-emerald-100' 
                              : 'text-rose-700 bg-rose-100'
                          }`}>
                            {shelter.isReady ? 'พร้อมรับผู้พักพิง' : 'งดรับชั่วคราว'}
                          </Badge>
                          
                          <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>
                              {shelter.currentOccupancy} <span className="text-slate-400 font-normal">/ {shelter.capacity > 0 ? shelter.capacity : 'ไม่จำกัด'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex items-center justify-center pr-4 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 duration-300">
                        {shelter.isReady ? (
                          <ArrowRight className="w-5 h-5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-300" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Shelter Details Modal */}
      <Dialog open={!!selectedShelter} onOpenChange={(open) => !open && setSelectedShelter(null)}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-0">
          {selectedShelter && (
            <>
              <div className={`h-32 ${selectedShelter.isReady ? 'bg-emerald-600' : 'bg-rose-600'} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <Tent className="size-16 text-white/90 drop-shadow-md" />
              </div>
              <div className="p-6">
                <DialogHeader className="text-left space-y-1 mb-4">
                  <div className="flex justify-between items-start gap-4">
                    <DialogTitle className="text-2xl font-bold leading-tight">{selectedShelter.name}</DialogTitle>
                    <Badge variant="outline" className={`text-xs shrink-0 whitespace-nowrap ${selectedShelter.isReady ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200 font-bold'}`}>
                      {selectedShelter.isReady ? 'พร้อมรับ' : 'งดรับชั่วคราว'}
                    </Badge>
                  </div>
                  <DialogDescription className="text-slate-500 font-medium">
                    ห่างจากจุดที่คุณอยู่ {formatDistance(selectedShelter.distanceMeters)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 bg-slate-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-emerald-600"><Users className="w-5 h-5"/></div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ความหนาแน่นปัจจุบัน</div>
                      <div className="text-sm font-bold text-slate-900">
                        มีผู้พักพิง {selectedShelter.currentOccupancy} คน
                        {selectedShelter.capacity > 0 && <span className="text-slate-500 font-medium"> จากความจุ {selectedShelter.capacity} คน</span>}
                      </div>
                    </div>
                  </div>
                  
                  {selectedShelter.description && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600"><MapPin className="w-5 h-5"/></div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ข้อมูลเพิ่มเติม</div>
                        <div className="text-sm text-slate-700 font-medium leading-relaxed">
                          {selectedShelter.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => openGoogleMaps(selectedShelter.latitude, selectedShelter.longitude)}
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl shadow-blue-600/20"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  นำทางไปที่นี่ (Google Maps)
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
