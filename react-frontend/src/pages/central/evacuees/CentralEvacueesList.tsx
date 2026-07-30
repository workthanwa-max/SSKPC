import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { evacueesService } from '../../../services/evacuees.service';
import { ArrowLeft, Search } from 'lucide-react';

export default function CentralEvacueesList() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();

  const { data: evacuees, isLoading } = useQuery({
    queryKey: ['central-evacuees-list', branchId],
    queryFn: () => evacueesService.getCentralBranchPeople(branchId as string),
    enabled: !!branchId,
  });

  const [search, setSearch] = useState('');

  const filteredEvacuees = evacuees?.filter((e: any) => {
    return e.name.toLowerCase().includes(search.toLowerCase()) || 
           e.registrationCode.toLowerCase().includes(search.toLowerCase());
  }) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายชื่อผู้เข้ารับบริการ</h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">เจาะลึกข้อมูลผู้พักพิงในศูนย์ที่เลือก</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-slate-900">รวมทั้งหมด {filteredEvacuees.length} รายการ</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="ค้นหาจากชื่อ หรือ รหัสไอดี..."
              className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors text-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">รหัสประจำตัว</th>
                    <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4 font-medium">สถานะ</th>
                    <th className="px-6 py-4 font-medium">เวลาลงทะเบียนเข้า</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                    </tr>
                  ) : filteredEvacuees.length > 0 ? (
                    filteredEvacuees.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
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
                        <td className="px-6 py-4 text-slate-500">{new Date(e.checkInAt).toLocaleString('th-TH')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลผู้พักพิง</td>
                    </tr>
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
