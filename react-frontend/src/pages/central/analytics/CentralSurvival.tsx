import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Activity, AlertTriangle, AlertCircle, Building2, CheckCircle2, Eye, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { analyticsService } from '../../../services/analytics.service';

export default function CentralSurvival() {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['central-survival-analytics'],
    queryFn: analyticsService.getCentralSurvival,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Activity className="size-10 text-rose-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium">กำลังคำนวณอัตราความอยู่รอดเครือข่าย...</p>
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

  const criticalBranches = data.filter(b => b.survivalDays <= 3).length;
  const totalOccupancy = data.reduce((acc, curr) => acc + curr.currentOccupancy, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner">
            <Activity className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">วิเคราะห์ความอยู่รอดเครือข่ายศูนย์พักพิง</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ภาพรวมอัตราการเผาผลาญทรัพยากรของทุกศูนย์ในความดูแล</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5 bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-xl ring-2 ring-rose-500/50">
          
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <AlertTriangle className="size-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              ศูนย์ที่อยู่ในสภาวะวิกฤต
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className={`text-7xl font-black tracking-tighter drop-shadow-sm ${criticalBranches > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {criticalBranches}
              </span>
              <span className="text-2xl font-bold text-slate-400">แห่ง</span>
            </div>
            <div className={`mt-6 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold ${criticalBranches > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {criticalBranches > 0 ? (
                <><AlertTriangle className="size-5 animate-bounce" /> จำเป็นต้องจัดส่งทรัพยากรด่วนภายใน 3 วัน</>
              ) : (
                <><CheckCircle2 className="size-5" /> ทุกศูนย์อยู่ในสภาวะปกติ</>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg rounded-3xl transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
              <Building2 className="size-40" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                จำนวนศูนย์ทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black tracking-tighter text-slate-900">{data.length}</span>
                <span className="text-lg font-bold text-slate-400">แห่ง</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg rounded-3xl transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
              <Activity className="size-40" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                ประชากรเครือข่ายรวม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black tracking-tighter text-slate-900">{totalOccupancy.toLocaleString()}</span>
                <span className="text-lg font-bold text-slate-400">คน</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Branches Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-5 text-indigo-500" />
              ตารางความอยู่รอดรายศูนย์ (SSI Ranking)
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">จัดอันดับศูนย์พักพิงที่เสี่ยงทรัพยากรหมดก่อน (ประเมินจากปัจจัย 4 พื้นฐาน)</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">ศูนย์พักพิง</th>
                    <th className="px-6 py-4 font-medium">ผู้ดูแล</th>
                    <th className="px-6 py-4 font-medium text-right">ประชากรปัจจุบัน</th>
                    <th className="px-6 py-4 font-medium text-center">ปัจจัยขาดแคลน</th>
                    <th className="px-6 py-4 font-medium text-center">อยู่รอดได้อีก (วัน)</th>
                    <th className="px-6 py-4 font-medium text-right">สถานะระดับศูนย์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="size-8 text-slate-300 mb-2" />
                          <span>ยังไม่มีข้อมูลศูนย์พักพิงในเครือข่าย</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((branch) => {
                      const isCritical = branch.survivalDays <= 3;
                      const isWarning = branch.survivalDays > 3 && branch.survivalDays <= 7;
                      
                      return (
                        <tr key={branch.branchId} className={`hover:bg-slate-50 transition-colors ${isCritical ? 'bg-rose-50/20' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <Building2 className="size-4 text-indigo-500" />
                              {branch.branchName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {branch.officerName}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-medium text-slate-900">{branch.currentOccupancy}</span> 
                            <span className="text-slate-500 text-xs ml-1">/ {branch.capacity || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {branch.criticalItemsCount > 0 ? (
                                <span className="text-rose-600 font-medium">{branch.criticalItemsCount} รายการ</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                              <button 
                                onClick={() => setSelectedBranch(branch)}
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                title="ดูรายละเอียดปัจจัยที่ขาดแคลน"
                              >
                                <Eye className="size-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-mono font-medium ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {branch.survivalDays > 999 ? '∞' : branch.survivalDays}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isCritical ? (
                              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">วิกฤต (ด่วน)</span>
                            ) : isWarning ? (
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">เฝ้าระวัง</span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">ปกติ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Items Modal */}
      <Dialog open={!!selectedBranch} onOpenChange={(open) => !open && setSelectedBranch(null)}>
        <DialogContent className="sm:max-w-md md:max-w-2xl rounded-2xl p-0 overflow-hidden font-sans border-slate-200">
          <div className="bg-rose-50 p-6 border-b border-rose-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
                <AlertTriangle className="size-6 text-rose-500" />
                รายงานปัจจัยพื้นฐานขาดแคลน
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1.5">
                ปัจจัยวิกฤตที่ประเมินแล้วว่าจะหมดลงภายใน 3 วัน ของศูนย์ 
                <strong className="text-slate-900 ml-1">{selectedBranch?.branchName}</strong>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6">
            {selectedBranch?.criticalItemsList?.length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">รายการปัจจัยพื้นฐาน</th>
                      <th className="px-6 py-4 font-medium text-right">จำนวนคงเหลือ</th>
                      <th className="px-6 py-4 font-medium text-center">หมดใน (วัน)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBranch.criticalItemsList.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <Package className="size-4 text-slate-400" />
                            {item.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
                          <span className="text-slate-500 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                            {item.ttd} วัน
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <CheckCircle2 className="size-10 text-emerald-500 mb-3" />
                <p className="text-slate-700 font-medium">ไม่มีปัจจัยใดขาดแคลนในระดับวิกฤต</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
