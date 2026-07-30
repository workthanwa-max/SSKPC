import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { evacueesService } from '../../../services/evacuees.service';
import { Tent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CentralEvacueesBranches() {
  const { data: branches, isLoading } = useQuery({
    queryKey: ['central-evacuees-branches'],
    queryFn: evacueesService.getCentralBranches,
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Tent className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">สำรวจรายศูนย์</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">วิเคราะห์ข้อมูลความจุและจำนวนผู้พักพิงของแต่ละศูนย์</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches?.map((branch: any) => {
          const capacity = branch.capacity || 0;
          const occupancy = branch._count.evacuees;
          const percentage = capacity > 0 ? Math.min(Math.round((occupancy / capacity) * 100), 100) : 0;
          
          return (
            <Card key={branch.id} className={`h-full border-slate-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md ${!branch.isReady ? 'border-rose-300 bg-rose-50/30' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-slate-900 leading-tight">{branch.name}</CardTitle>
                  <Badge variant="outline" className={`whitespace-nowrap text-[10px] ml-2 shrink-0 ${branch.isReady ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-rose-200 text-rose-600 bg-rose-50 font-bold'}`}>
                    {branch.isReady ? 'พร้อมรับ' : 'งดรับชั่วคราว'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ปัจจุบัน: {occupancy}</span>
                    <span className="text-slate-500">ความจุ: {capacity > 0 ? capacity : 'ไม่ระบุ'}</span>
                  </div>
                  
                  {capacity > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">ความหนาแน่น</span>
                        <span className={percentage >= 90 ? 'text-red-500 font-medium' : 'text-emerald-600 font-medium'}>{percentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 opacity-50">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">ความหนาแน่น</span>
                        <span className="text-slate-400 font-medium">-</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
