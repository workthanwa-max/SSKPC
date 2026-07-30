import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../../components/ui/select';
import { evacueesService } from '../../../services/evacuees.service';
import { Search, Filter, History, Clock } from 'lucide-react';

export default function EvacueesHistory() {
  const { data: evacuees, isLoading } = useQuery({
    queryKey: ['branch-evacuees-history'],
    queryFn: evacueesService.getBranchHistory,
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEvacuees = evacuees?.filter((e: any) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.registrationCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  }) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-slate-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-inner">
            <History className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ประวัติการลงทะเบียนทั้งหมด</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ตรวจสอบประวัติการเข้าและออกของประชาชนในศูนย์พักพิง</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
            <Clock className="size-5 text-slate-500" />
            ประวัติทั้งหมด ({filteredEvacuees.length} รายการ)
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
              <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-slate-400" />
                  <span>
                    {filterStatus === 'all' 
                      ? 'สถานะทั้งหมด' 
                      : filterStatus === 'IN_SHELTER' ? 'กำลังพักพิง' : 'ออกจากศูนย์แล้ว'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                <SelectItem value="all" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 font-medium text-slate-700">ทั้งหมด</SelectItem>
                <SelectItem value="IN_SHELTER" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <div className="size-2 rounded-full bg-emerald-500"></div>
                    กำลังพักพิง
                  </div>
                </SelectItem>
                <SelectItem value="CHECKED_OUT" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <div className="size-2 rounded-full bg-slate-400"></div>
                    ออกจากศูนย์แล้ว
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="ค้นหาชื่อ หรือ รหัสประจำตัว..."
                className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors text-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">รหัสประจำตัว</th>
                  <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 font-semibold">สถานะ</th>
                  <th className="px-6 py-4 font-semibold">เวลาเข้า</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">เวลาออก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : filteredEvacuees.length > 0 ? (
                  filteredEvacuees.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-600">{e.registrationCode}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{e.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${
                          e.status === 'IN_SHELTER' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {e.status === 'IN_SHELTER' ? 'กำลังพักพิง' : 'ออกแล้ว'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(e.checkInAt).toLocaleString('th-TH')}</td>
                      <td className="px-6 py-4 text-slate-400">{e.checkOutAt ? new Date(e.checkOutAt).toLocaleString('th-TH') : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่พบประวัติการลงทะเบียน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
