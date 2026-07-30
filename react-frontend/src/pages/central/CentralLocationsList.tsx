import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/apiClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Navigation, Store, Search, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export default function CentralLocationsList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await apiClient.get('/api/v1/locations');
      setLocations(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 w-full sm:w-auto">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner shrink-0 hidden sm:flex">
            <LayoutList className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">ฐานข้อมูลศูนย์พักพิง (Database)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              แสดงข้อมูลศูนย์พักพิงทั้งหมดในระบบพร้อมข้อมูลพิกัดภูมิศาสตร์
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64 z-10 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            placeholder="ค้นหาศูนย์พักพิง..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-semibold text-slate-500 py-4 pl-6">ข้อมูลศูนย์พักพิง</TableHead>
              <TableHead className="font-semibold text-slate-500 py-4">ผู้รับผิดชอบ</TableHead>
              <TableHead className="font-semibold text-slate-500 py-4">สถานะ</TableHead>
              <TableHead className="text-right font-semibold text-slate-500 py-4 pr-6">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-400">กำลังโหลดข้อมูล...</TableCell>
              </TableRow>
            ) : filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-400">ไม่พบข้อมูลศูนย์พักพิง</TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((loc) => (
                <TableRow key={loc.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-sm">
                        <Store className="size-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-bold text-slate-900 leading-none">{loc.name}</span>
                        <span className="text-xs font-medium text-slate-500 truncate max-w-[280px]">
                          {loc.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${loc.user.name}&backgroundColor=f1f5f9`} 
                        alt={loc.user.name}
                        className="size-9 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{loc.user.name}</span>
                        <span className="text-xs font-medium text-slate-500">{loc.user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <Badge variant="outline" className={`border-none px-2.5 py-1 text-[11px] font-bold tracking-wide ${loc.isReady ? 'bg-emerald-100/80 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {loc.isReady ? 'พร้อมรับคน (READY)' : 'งดรับชั่วคราว (NOT READY)'}
                      </Badge>
                      <span className="text-[10px] font-medium text-slate-400">Account: {loc.user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-xl border-slate-200 text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`, '_blank')}
                    >
                      <Navigation className="size-3.5" />
                      เปิดเส้นทาง
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
