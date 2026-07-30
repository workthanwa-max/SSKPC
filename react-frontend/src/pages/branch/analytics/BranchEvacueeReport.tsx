import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Tent, Activity, UserCircle2, UserRound, Baby, UserMinus, Accessibility } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { Progress } from '../../../components/ui/progress';

export default function BranchEvacueeReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/v1/analytics/branch/evacuee-stats');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch branch evacuee stats', error);
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
        <p className="font-medium animate-pulse">กำลังโหลดสถิติผู้พักพิง...</p>
      </div>
    </div>
  );

  const utilization = data?.capacity ? Math.round((data?.totalInShelter / data?.capacity) * 100) : 0;
  const isOvercrowded = utilization >= 100;
  const isWarning = utilization >= 80 && utilization < 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายงานยอดผู้พักพิง (สถิติประชากร)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ภาพรวมจำนวนและกลุ่มประเภทของผู้พักพิงภายในศูนย์</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="size-24 text-emerald-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">ผู้พักพิงปัจจุบัน</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.totalInShelter?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">คน (อยู่ในศูนย์ ณ ตอนนี้)</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Tent className="size-24 text-indigo-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">ความจุของศูนย์</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Tent className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.capacity?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">จำนวนที่รับได้สูงสุด</p>
          </CardContent>
        </Card>

        <Card className={`border-slate-200/60 shadow-sm relative overflow-hidden group ${isOvercrowded ? 'bg-rose-50/50 border-rose-200' : isWarning ? 'bg-amber-50/50 border-amber-200' : ''}`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className={`size-24 ${isOvercrowded ? 'text-rose-600' : isWarning ? 'text-amber-500' : 'text-blue-600'}`} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-semibold ${isOvercrowded ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-slate-600'}`}>ความหนาแน่น</CardTitle>
            <div className={`p-2 rounded-lg ${isOvercrowded ? 'bg-rose-100 text-rose-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black tracking-tight ${isOvercrowded ? 'text-rose-700' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}>{utilization}%</div>
            <Progress 
              value={utilization > 100 ? 100 : utilization} 
              className={`h-2 mt-2 ${isOvercrowded ? 'bg-rose-200 [&>div]:bg-rose-600' : isWarning ? 'bg-amber-200 [&>div]:bg-amber-500' : 'bg-slate-100 [&>div]:bg-blue-600'}`} 
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gender Breakdown */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="border-b border-slate-100/60 bg-slate-50/50 pb-4">
            <CardTitle className="text-lg text-slate-900">สัดส่วนตามเพศ</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Male */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-50 text-blue-600"><UserRound className="size-4" /></div>
                  <span className="font-semibold text-slate-700">ชาย</span>
                </div>
                <span className="font-bold text-slate-900">{data?.demographics?.gender?.MALE || 0} คน</span>
              </div>
              <Progress value={data?.totalInShelter ? (data.demographics.gender.MALE / data.totalInShelter) * 100 : 0} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
            </div>
            
            {/* Female */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-pink-50 text-pink-600"><UserCircle2 className="size-4" /></div>
                  <span className="font-semibold text-slate-700">หญิง</span>
                </div>
                <span className="font-bold text-slate-900">{data?.demographics?.gender?.FEMALE || 0} คน</span>
              </div>
              <Progress value={data?.totalInShelter ? (data.demographics.gender.FEMALE / data.totalInShelter) * 100 : 0} className="h-2 bg-pink-100 [&>div]:bg-pink-500" />
            </div>

            {/* Other */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-slate-100 text-slate-600"><Users className="size-4" /></div>
                  <span className="font-semibold text-slate-700">อื่นๆ / ไม่ระบุ</span>
                </div>
                <span className="font-bold text-slate-900">{data?.demographics?.gender?.OTHER || 0} คน</span>
              </div>
              <Progress value={data?.totalInShelter ? (data.demographics.gender.OTHER / data.totalInShelter) * 100 : 0} className="h-2 bg-slate-100 [&>div]:bg-slate-500" />
            </div>
          </CardContent>
        </Card>

        {/* Age/Type Breakdown */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="border-b border-slate-100/60 bg-slate-50/50 pb-4">
            <CardTitle className="text-lg text-slate-900">กลุ่มประเภทผู้พักพิง</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Baby className="size-5" /></div>
                  <span className="font-semibold text-slate-700">เด็ก (0-14 ปี)</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{data?.demographics?.type?.CHILD || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><UserRound className="size-5" /></div>
                  <span className="font-semibold text-slate-700">ผู้ใหญ่ (15-59 ปี)</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{data?.demographics?.type?.ADULT || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><UserMinus className="size-5" /></div>
                  <span className="font-semibold text-slate-700">ผู้สูงอายุ (60 ปีขึ้นไป)</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{data?.demographics?.type?.ELDERLY || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600"><Accessibility className="size-5" /></div>
                  <span className="font-semibold text-slate-700">กลุ่มเปราะบาง / หญิงตั้งครรภ์</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{(data?.demographics?.type?.VULNERABLE || 0) + (data?.demographics?.type?.PREGNANT || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600"><Users className="size-5" /></div>
                  <span className="font-semibold text-slate-700">ไม่ระบุ</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{data?.demographics?.type?.UNKNOWN || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
