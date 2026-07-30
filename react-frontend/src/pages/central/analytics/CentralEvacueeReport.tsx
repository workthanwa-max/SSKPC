import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Tent, Activity, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';

import { Progress } from '../../../components/ui/progress';

export default function CentralEvacueeReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/v1/analytics/central/network-stats');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch central evacuee stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Users className="size-8 animate-pulse text-emerald-500/50" />
        <p className="font-medium animate-pulse">กำลังโหลดสถิติเครือข่าย...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Activity className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">สถิติเครือข่าย (ผู้พักพิงรวม)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ภาพรวมจำนวนผู้พักพิงและความหนาแน่นของทุกสาขา</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="size-24 text-emerald-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">ผู้พักพิงทั้งหมด</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.currentOccupancy?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">คน (รับเข้าบริการทั้งหมด)</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Tent className="size-24 text-indigo-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">ความจุรวมเครือข่าย</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Tent className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.totalCapacity?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">จำนวนที่รับได้สูงสุดรวมทุกศูนย์</p>
          </CardContent>
        </Card>

        <Card className={`border-slate-200/60 shadow-sm relative overflow-hidden group ${data?.utilization > 80 ? 'bg-rose-50/50 border-rose-200' : ''}`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className={`size-24 ${data?.utilization > 80 ? 'text-rose-600' : 'text-blue-600'}`} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-semibold ${data?.utilization > 80 ? 'text-rose-700' : 'text-slate-600'}`}>ความหนาแน่นรวม</CardTitle>
            <div className={`p-2 rounded-lg ${data?.utilization > 80 ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black tracking-tight ${data?.utilization > 80 ? 'text-rose-700' : 'text-slate-900'}`}>{data?.utilization || 0}%</div>
            <Progress value={data?.utilization || 0} className={`h-2 mt-2 ${data?.utilization > 80 ? 'bg-rose-200 [&>div]:bg-rose-600' : 'bg-slate-100 [&>div]:bg-blue-600'}`} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="border-b border-slate-100/60 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg text-slate-900">ความหนาแน่นของแต่ละศูนย์</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.branches?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <Tent className="size-10 mb-3 opacity-20" />
              <p className="font-medium">ยังไม่มีข้อมูลศูนย์ในเครือข่าย</p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white m-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">ชื่อศูนย์พักพิง</th>
                      <th className="px-6 py-4 font-medium text-right">จำนวนปัจจุบัน (คน)</th>
                      <th className="px-6 py-4 font-medium text-right">ความจุ (คน)</th>
                      <th className="px-6 py-4 font-medium text-right">ความหนาแน่น</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.branches?.map((branch: any, idx: number) => {
                      const isOvercrowded = branch.utilization >= 100;
                      const isWarning = branch.utilization >= 80 && branch.utilization < 100;
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {branch.branchName}
                            {isOvercrowded && <AlertTriangle className="inline-block size-4 ml-2 text-rose-500" />}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">
                            {branch.occupancy.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-500">
                            {branch.capacity.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className={`text-sm font-bold w-12 ${isOvercrowded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {branch.utilization}%
                              </span>
                              <div className="w-24">
                                <Progress 
                                  value={branch.utilization > 100 ? 100 : branch.utilization} 
                                  className={`h-2 ${isOvercrowded ? 'bg-rose-200 [&>div]:bg-rose-600' : isWarning ? 'bg-amber-200 [&>div]:bg-amber-500' : 'bg-emerald-100 [&>div]:bg-emerald-500'}`} 
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
