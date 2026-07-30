import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '../../../components/ui/alert-dialog';
import { evacueesService } from '../../../services/evacuees.service';
import { Tent } from 'lucide-react';

export default function EvacueesCapacity() {
  const queryClient = useQueryClient();
  const [capacity, setCapacity] = useState('');
  const [specInfo, setSpecInfo] = useState('');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; isError: boolean }>({ isOpen: false, title: '', message: '', isError: false });

  const { data: dashboard } = useQuery({
    queryKey: ['branch-evacuees-dashboard'],
    queryFn: evacueesService.getBranchDashboard,
  });

  useEffect(() => {
    if (dashboard) {
      setCapacity(dashboard.capacity.toString());
      setSpecInfo(dashboard.specInfo || '');
    }
  }, [dashboard]);

  const mutation = useMutation({
    mutationFn: (data: { capacity: number; specInfo: string }) => 
      evacueesService.updateCapacity(data.capacity, data.specInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-dashboard'] });
      setAlertConfig({ isOpen: true, title: 'บันทึกสำเร็จ', message: 'บันทึกข้อมูลศูนย์พักพิงเรียบร้อยแล้ว', isError: false });
    },
    onError: () => {
      setAlertConfig({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง', isError: true });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      capacity: parseInt(capacity) || 0,
      specInfo: specInfo,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Tent className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ตั้งค่าความจุของศูนย์</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">กำหนดขีดความสามารถในการรองรับผู้พักพิง เพื่อรายงานต่อส่วนกลาง</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">ข้อมูลศูนย์พักพิง</CardTitle>
          <CardDescription className="text-slate-500">อัปเดตข้อมูลสเปคและจำนวนคนที่สามารถรองรับได้สูงสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-slate-700">ความจุสูงสุด (คน)</Label>
              <Input 
                id="capacity" 
                type="number" 
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="เช่น 100"
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specInfo" className="text-slate-700">รายละเอียดโครงสร้าง / ข้อมูลสเปคเบื้องต้น</Label>
              <textarea 
                id="specInfo"
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="เช่น มีเต็นท์ 50 หลัง, ห้องน้ำ 10 ห้อง, รองรับผู้ป่วยติดเตียงได้"
                value={specInfo}
                onChange={(e) => setSpecInfo(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className={alertConfig.isError ? "text-rose-600" : "text-emerald-600"}>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {alertConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
              className={alertConfig.isError ? "bg-rose-600 hover:bg-rose-700 text-white rounded-xl" : "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
