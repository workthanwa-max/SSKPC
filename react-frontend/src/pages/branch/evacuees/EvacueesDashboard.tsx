import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { evacueesService } from '../../../services/evacuees.service';
import { Users, Tent, Activity } from 'lucide-react';

export default function EvacueesDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['branch-evacuees-dashboard'],
    queryFn: evacueesService.getBranchDashboard,
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading...</div>;

  const capacity = dashboard?.capacity || 0;
  const occupancy = dashboard?.currentOccupancy || 0;
  const percentage = capacity > 0 ? Math.min(Math.round((occupancy / capacity) * 100), 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard ผู้พักพิง</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ภาพรวมทรัพยากรมนุษย์และความจุของศูนย์พักพิง</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ความจุสูงสุด</CardTitle>
            <Tent className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{capacity} <span className="text-sm font-normal text-slate-500">คน</span></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ผู้พักพิงปัจจุบัน</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{occupancy} <span className="text-sm font-normal text-slate-500">คน</span></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">อัตราการรองรับ</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{percentage}%</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-1000 ease-in-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
