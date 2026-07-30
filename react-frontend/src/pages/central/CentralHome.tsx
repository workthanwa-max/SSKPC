import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { Siren, Radar, Users, Box, ArrowRight, Tent, Activity, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api/apiClient';
import { Progress } from '@/components/ui/progress';

export default function CentralHome() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/api/v1/dashboard/central/overview');
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load central dashboard overview", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Radar className="size-8 animate-pulse text-indigo-500/50" />
          <p className="font-medium animate-pulse">กำลังโหลดภาพรวมศูนย์บัญชาการ...</p>
        </div>
      </div>
    );
  }

  const { network, supplies } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 shadow-inner border border-indigo-200/50">
            <Radar className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">ศูนย์บัญชาการกลาง (Central)</h1>
            <p className="text-sm md:text-base font-medium text-slate-500 mt-1">
              ส่วนควบคุมทรัพยากรและเฝ้าระวังเครือข่ายศูนย์พักพิง, <b>เจ้าหน้าที่: {user?.name}</b>
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <Link to="/central/locations/map" className="w-full md:w-auto">
            <Button className="w-full md:w-auto h-12 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 font-semibold transition-all">
              <Radar className="mr-2 size-5 text-indigo-400" /> เปิดเรดาร์ติดตาม
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">ศูนย์พักพิงในเครือข่าย</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Tent className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{network?.totalShelters || 0}</div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">พร้อม: {network?.readyShelters || 0}</span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">งดรับ: {network?.notReadyShelters || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">ผู้พักพิงรวม</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{network?.currentOccupancy?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">จากความจุทั้งหมด {network?.totalCapacity?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative ${network?.utilization >= 80 ? 'bg-amber-50 border-amber-200' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-bold ${network?.utilization >= 80 ? 'text-amber-700' : 'text-slate-500'}`}>ความหนาแน่นรวม</CardTitle>
            <div className={`p-2 rounded-lg ${network?.utilization >= 80 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${network?.utilization >= 80 ? 'text-amber-700' : 'text-slate-900'}`}>{network?.utilization || 0}%</div>
            <Progress 
              value={network?.utilization > 100 ? 100 : network?.utilization || 0} 
              className={`h-2 mt-2 ${network?.utilization >= 80 ? 'bg-amber-200 [&>div]:bg-amber-500' : 'bg-slate-100 [&>div]:bg-emerald-500'}`} 
            />
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative ${supplies?.lowStockAlerts > 0 ? 'bg-rose-50 border-rose-200' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-bold ${supplies?.lowStockAlerts > 0 ? 'text-rose-700' : 'text-slate-500'}`}>แจ้งเตือนเสบียงขาดแคลน</CardTitle>
            <div className={`p-2 rounded-lg ${supplies?.lowStockAlerts > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
              <Flame className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${supplies?.lowStockAlerts > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{supplies?.lowStockAlerts || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">รายการจากทุกสาขา</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-center">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Box className="size-5 text-indigo-600" />
              เสบียงปัจจัยพื้นฐาน (Critical Supplies)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-5xl font-black text-indigo-700">{supplies?.totalCriticalItems?.toLocaleString() || 0} <span className="text-lg font-bold text-indigo-400">ชิ้น</span></div>
            <p className="text-sm font-bold text-slate-500 mt-2">ยอดรวมสินค้าสำคัญจากทุกศูนย์พักพิงในเครือข่าย</p>
            <Button variant="outline" className="mt-4 h-10 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold" onClick={() => navigate('/central/stock')}>
              ตรวจสอบคลังเสบียง <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative bg-gradient-to-br from-rose-50 to-white border-rose-100/60 flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Siren className="size-32 text-rose-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6 z-10">
            <CardTitle className="text-xs font-bold text-rose-600 uppercase flex items-center gap-2 tracking-wider">
              <Siren className="size-4 animate-pulse" />
              แจ้งเตือนเหตุฉุกเฉิน (Active Alerts)
            </CardTitle>
            <div className="px-3 py-1 bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg">
              NETWORK
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
            <div>
              <div className="text-5xl font-black text-rose-700 tracking-tight">0 <span className="text-sm font-bold text-rose-500">เหตุการณ์</span></div>
              <p className="text-sm font-bold text-slate-500 mt-1">ระบบอยู่ในสภาวะปกติ ไม่มีรายงานฉุกเฉิน</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
