import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { evacueesService } from '../../../services/evacuees.service';
import { Search, MoreVertical, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

const GENDER_MAP: Record<string, { label: string, color: string }> = {
  MALE: { label: 'ชาย', color: 'text-blue-700 bg-blue-100' },
  FEMALE: { label: 'หญิง', color: 'text-pink-700 bg-pink-100' },
  OTHER: { label: 'อื่นๆ', color: 'text-slate-700 bg-slate-100' }
};

const TYPE_MAP: Record<string, string> = {
  CHILD: 'เด็ก (0-14 ปี)',
  ADULT: 'ผู้ใหญ่ (15-59 ปี)',
  ELDERLY: 'ผู้สูงอายุ (60+)',
  PREGNANT: 'หญิงตั้งครรภ์',
  VULNERABLE: 'กลุ่มเปราะบาง'
};

export default function EvacueesList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // State for check-out modal
  const [checkoutTarget, setCheckoutTarget] = useState<{ id: string, code: string, name: string } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; isError: boolean }>({ isOpen: false, title: '', message: '', isError: false });

  const { data: evacuees, isLoading } = useQuery({
    queryKey: ['branch-evacuees-in-shelter'],
    queryFn: evacueesService.getBranchInShelter,
  });

  const checkOutMutation = useMutation({
    mutationFn: (identifier: string) => evacueesService.checkOut(identifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-in-shelter'] });
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-history'] });
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-dashboard'] });
      setAlertConfig({ isOpen: true, title: 'ลงทะเบียนออกสำเร็จ', message: 'บันทึกการออกจากศูนย์พักพิงเรียบร้อยแล้ว', isError: false });
      setCheckoutTarget(null);
    },
    onError: (error: any) => {
      setAlertConfig({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: error.response?.data?.error || 'เกิดข้อผิดพลาด หรือไม่พบข้อมูลผู้พักพิง/ออกไปแล้ว', isError: true });
      setCheckoutTarget(null);
    }
  });

  const filteredEvacuees = evacuees?.filter((e: any) => {
    return e.name.toLowerCase().includes(search.toLowerCase()) || 
           e.registrationCode.toLowerCase().includes(search.toLowerCase());
  }) || [];

  const confirmCheckOut = () => {
    if (checkoutTarget) {
      checkOutMutation.mutate(checkoutTarget.code);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายชื่อผู้ใช้บริการปัจจุบัน</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">รายชื่อประชาชนที่กำลังพักพิงอยู่ในศูนย์ขณะนี้</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg text-slate-900">รวมทั้งหมด {filteredEvacuees.length} คน</CardTitle>
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
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">รหัสประจำตัว</th>
                    <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4 font-medium">เพศ</th>
                    <th className="px-6 py-4 font-medium">ประเภท</th>
                    <th className="px-6 py-4 font-medium">ข้อมูลเบื้องต้น</th>
                    <th className="px-6 py-4 font-medium">เวลาลงทะเบียนเข้า</th>
                    <th className="px-6 py-4 font-medium text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                    </tr>
                  ) : filteredEvacuees.length > 0 ? (
                    filteredEvacuees.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-emerald-600">{e.registrationCode}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{e.name}</td>
                        <td className="px-6 py-4">
                          {e.gender ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${GENDER_MAP[e.gender]?.color || 'bg-slate-100 text-slate-700'}`}>
                              {GENDER_MAP[e.gender]?.label || e.gender}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {e.type ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                              {TYPE_MAP[e.type] || e.type}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-600" title={e.basicInfo || '-'}>{e.basicInfo || '-'}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(e.checkInAt).toLocaleString('th-TH')}</td>
                        <td className="px-6 py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl font-sans">
                              <DropdownMenuItem 
                                className="cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                onClick={() => setCheckoutTarget({ id: e.id, code: e.registrationCode, name: e.name })}
                              >
                                <LogOut className="mr-2 size-4" />
                                <span>ลงทะเบียนออก</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">ไม่พบรายชื่อที่ค้นหา หรือยังไม่มีผู้พักพิงในขณะนี้</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check Out Confirmation Modal */}
      <AlertDialog open={!!checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200 font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">ยืนยันการลงทะเบียนออก?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base mt-2">
              คุณต้องการบันทึกการออกจากศูนย์พักพิงของ <br/>
              <strong className="text-slate-900">{checkoutTarget?.name} (รหัส: {checkoutTarget?.code})</strong> ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCheckOut}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยันการออก'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success/Error Alert Dialog */}
      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-2xl border-slate-200 font-sans">
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
