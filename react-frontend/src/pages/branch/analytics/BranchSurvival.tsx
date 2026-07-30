import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

import { Activity, AlertTriangle, CheckCircle2, PackagePlus, AlertCircle, Clock } from 'lucide-react';
import { analyticsService } from '../../../services/analytics.service';

export default function BranchSurvival() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['branch-survival-analytics'],
    queryFn: analyticsService.getBranchSurvival,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Activity className="size-10 text-rose-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium">กำลังคำนวณอัตราความอยู่รอด...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center gap-3">
        <AlertCircle className="size-5" />
        <p className="font-semibold">ไม่สามารถดึงข้อมูลการวิเคราะห์ได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }

  const { survivalDays, currentOccupancy, metrics } = data;

  const isCritical = survivalDays <= 3;
  const isWarning = survivalDays > 3 && survivalDays <= 7;
  const isHealthy = survivalDays > 7;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full blur-3xl pointer-events-none ${isCritical ? 'bg-rose-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`} />
        <div className="flex items-center gap-4 relative z-10">
          <div className={`flex size-12 items-center justify-center rounded-xl shadow-inner ${isCritical ? 'bg-rose-50 text-rose-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Activity className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">วิเคราะห์ความอยู่รอด (Survival Analysis)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ประเมินศักยภาพการรองรับผู้อพยพด้วยทรัพยากรปัจจุบัน</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className={`md:col-span-8 bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-xl ${isCritical ? 'ring-2 ring-rose-500/50' : ''}`}>
          {isCritical && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 animate-pulse" />}
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Activity className="size-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              ดัชนีความอยู่รอดรวม (Survival Index)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className={`text-7xl font-black tracking-tighter ${isCritical ? 'text-rose-600 drop-shadow-sm' : isWarning ? 'text-amber-500' : 'text-emerald-600'}`}>
                {survivalDays > 999 ? '∞' : survivalDays}
              </span>
              <span className="text-2xl font-bold text-slate-400">วัน</span>
            </div>
            <div className={`mt-6 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold ${isCritical ? 'bg-rose-100 text-rose-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isCritical && <><AlertTriangle className="size-5 animate-bounce" /> วิกฤต! ทรัพยากรใกล้หมด โปรดขอรับการสนับสนุนทันที</>}
              {isWarning && <><Clock className="size-5" /> เฝ้าระวัง ทรัพยากรบางชนิดอาจไม่เพียงพอในสัปดาห์หน้า</>}
              {isHealthy && <><CheckCircle2 className="size-5" /> ปลอดภัย ทรัพยากรเพียงพอต่อการรองรับปัจจุบัน</>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg rounded-3xl transition-all duration-300 hover:shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
            <AlertCircle className="size-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              ประชากรปัจจุบัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black tracking-tighter text-slate-900">{currentOccupancy}</span>
              <span className="text-lg font-bold text-slate-400">คน</span>
            </div>
            <p className="mt-6 text-xs font-medium text-slate-500 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
              อัตราการเผาผลาญถูกคำนวณแบบ Dynamic ตามยอดผู้อพยพแบบ Real-time ณ ปัจจุบัน
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Burn Rate Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Clock className="size-5 text-indigo-500" />
              อัตราเผาผลาญรายปัจจัยวิกฤต (Burn Rate Matrix)
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">จัดเรียงตามทรัพยากรที่มีความเสี่ยงจะหมดก่อน (คำนวณเฉพาะปัจจัย 4 พื้นฐาน)</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">รายการปัจจัย</th>
                    <th className="px-6 py-4 font-medium text-right">คงเหลือ</th>
                    <th className="px-6 py-4 font-medium text-right">เผาผลาญ (ต่อวัน)</th>
                    <th className="px-6 py-4 font-medium text-center">คาดว่าจะหมดใน (วัน)</th>
                    <th className="px-6 py-4 font-medium text-right">สถานะ</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <PackagePlus className="size-8 text-slate-300 mb-2" />
                          <span>ยังไม่มีข้อมูลปัจจัยวิกฤตในระบบ (หมวดหมู่พื้นฐาน)</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    metrics.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.status === 'CRITICAL' ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.category}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-slate-900">{item.quantity.toLocaleString()}</span> 
                          <span className="text-slate-500 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            -{item.dailyBurnRate.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-mono font-medium ${item.status === 'CRITICAL' ? 'text-rose-600' : item.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.ttd > 999 ? '∞' : item.ttd}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'CRITICAL' ? (
                            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">วิกฤต (รอรับความช่วยเหลือ)</span>
                          ) : item.status === 'WARNING' ? (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">เฝ้าระวัง</span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">เพียงพอ</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.status === 'CRITICAL' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors" title="สร้างคำร้องขอสนับสนุน">
                              <PackagePlus className="size-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
