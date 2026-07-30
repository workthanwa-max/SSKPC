import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { Users, Tent, Radio, Flame, ArrowRight, ArrowDownUp, ShieldAlert, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api/apiClient';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function BranchHome() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Status Toggle State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/branch/overview');
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to load dashboard overview", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleClick = (checked: boolean) => {
    setTargetStatus(checked);
    setIsAlertOpen(true);
  };

  const confirmStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch('/api/v1/locations/me/status', { isReady: targetStatus });
      toast.success(targetStatus ? 'เปิดศูนย์: สถานะพร้อมรับคนเข้าพัก' : 'ปิดศูนย์ชั่วคราว: สถานะไม่พร้อมรับคนเข้าพัก');
      // Update local state directly instead of re-fetching everything
      setData((prev: any) => ({
        ...prev,
        shelter: { ...prev.shelter, isReady: targetStatus }
      }));
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUpdatingStatus(false);
      setIsAlertOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Tent className="size-8 animate-pulse text-indigo-500/50" />
          <p className="font-medium animate-pulse">กำลังโหลดภาพรวมศูนย์พักพิง...</p>
        </div>
      </div>
    );
  }

  const { shelter, demographics, recentCheckIns, supplies, recentTransactions } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-inner border border-emerald-200/50">
            <Tent className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">ศูนย์พักพิง {shelter?.name ? `(${shelter.name})` : '(Branch Unit)'}</h1>
            <p className="text-sm md:text-base font-medium text-slate-500 mt-1">
              ยินดีต้อนรับ เจ้าหน้าที่ประจำศูนย์: <b className="text-slate-700">{user?.name}</b>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto relative z-10">
          
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">สถานะศูนย์</span>
              <span className={`text-[10px] font-bold tracking-wider ${shelter?.isReady ? 'text-emerald-500' : 'text-rose-500'}`}>
                {shelter?.isReady ? 'พร้อมรับผู้ลี้ภัย' : 'งดรับชั่วคราว'}
              </span>
            </div>
            <Switch 
              checked={shelter?.isReady ?? true} 
              onCheckedChange={handleToggleClick} 
              disabled={isUpdatingStatus}
              className={`data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500`}
            />
          </div>

          <Link to="/branch/location" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-sm font-semibold transition-all hover:border-indigo-200">
              <Radio className="mr-2 size-5" />รายงานพิกัดศูนย์
            </Button>
          </Link>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-slate-200/60 font-sans max-w-md">
          <AlertDialogHeader>
            <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${targetStatus ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <ShieldAlert className="size-8" />
            </div>
            <AlertDialogTitle className="text-xl text-center font-black text-slate-900">
              ยืนยันการ{targetStatus ? 'เปิดศูนย์ (พร้อมรับคน)' : 'ปิดศูนย์ (ไม่พร้อมรับคน)'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 mt-2">
              {targetStatus 
                ? "คุณกำลังจะแจ้งไปยังส่วนกลางว่าศูนย์ของคุณพร้อมรับผู้ประสบภัย หากยืนยันข้อมูลจะแสดงบนเรดาร์ว่าคุณพร้อมช่วยเหลือทันที" 
                : "คุณกำลังจะแจ้งเตือนไปยังส่วนกลางว่าศูนย์ของคุณ เต็ม หรือ ไม่พร้อมรับคนเพิ่ม ข้อมูลนี้จะส่งผลให้สถานะบนเรดาร์ของคุณเปลี่ยนเป็นสีแดง"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:justify-center flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl h-12 text-slate-500 font-semibold mt-0">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusUpdate} 
              disabled={isUpdatingStatus}
              className={`w-full sm:w-auto rounded-xl h-12 font-bold shadow-md ${targetStatus ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'}`}
            >
              ยืนยันการเปลี่ยนสถานะ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">คนในศูนย์ตอนนี้</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{shelter?.currentOccupancy?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">ความจุสูงสุด {shelter?.capacity?.toLocaleString() || 0} คน</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative ${shelter?.utilization >= 100 ? 'bg-rose-50 border-rose-200' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-bold ${shelter?.utilization >= 100 ? 'text-rose-700' : 'text-slate-500'}`}>ความหนาแน่น</CardTitle>
            <div className={`p-2 rounded-lg ${shelter?.utilization >= 100 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${shelter?.utilization >= 100 ? 'text-rose-700' : 'text-slate-900'}`}>{shelter?.utilization || 0}%</div>
            <Progress 
              value={shelter?.utilization > 100 ? 100 : shelter?.utilization || 0} 
              className={`h-2 mt-2 ${shelter?.utilization >= 100 ? 'bg-rose-200 [&>div]:bg-rose-600' : 'bg-slate-100 [&>div]:bg-emerald-500'}`} 
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">กลุ่มเปราะบาง</CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{demographics?.type?.VULNERABLE || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">ผู้สูงอายุ / ผู้พิการ / หญิงตั้งครรภ์</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all group relative ${supplies?.lowStockAlerts > 0 ? 'bg-rose-50 border-rose-200' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-bold ${supplies?.lowStockAlerts > 0 ? 'text-rose-700' : 'text-slate-500'}`}>รายการสินค้าใกล้หมด</CardTitle>
            <div className={`p-2 rounded-lg ${supplies?.lowStockAlerts > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
              <Flame className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${supplies?.lowStockAlerts > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{supplies?.lowStockAlerts || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">จากทั้งหมด {supplies?.totalItems || 0} รายการ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-indigo-600" />
              <CardTitle className="text-lg text-slate-900">ผู้เข้าพักล่าสุด</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/branch/evacuees/list')} className="text-indigo-600 font-semibold">
              ดูทั้งหมด <ArrowRight className="ml-1 size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentCheckIns?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentCheckIns.map((person: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{person.name}</p>
                      <p className="text-sm font-medium text-slate-500 mt-0.5 font-mono">{person.registrationCode}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {new Date(person.checkInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium">ยังไม่มีผู้เข้าพักในศูนย์นี้</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="size-5 text-amber-600" />
              <CardTitle className="text-lg text-slate-900">รายการเคลื่อนไหวทรัพยากรล่าสุด</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/branch/stock/transactions')} className="text-amber-600 font-semibold">
              ดูทั้งหมด <ArrowRight className="ml-1 size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{tx.productName}</p>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('th-TH')} {new Date(tx.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {tx.type === 'INBOUND' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          + {tx.quantity} รับเข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          - {tx.quantity} เบิกออก
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium">ยังไม่มีรายการเบิกจ่ายทรัพยากร</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
