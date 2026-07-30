import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '../../../components/ui/alert-dialog';
import { evacueesService } from '../../../services/evacuees.service';
import { Search } from 'lucide-react';

export default function EvacueesCheckOut() {
  const queryClient = useQueryClient();
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; isError: boolean }>({ isOpen: false, title: '', message: '', isError: false });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch evacuees currently in shelter
  const { data: evacuees } = useQuery({
    queryKey: ['branch-evacuees-in-shelter'],
    queryFn: evacueesService.getBranchInShelter,
  });

  const mutation = useMutation({
    mutationFn: (identifier: string) => evacueesService.checkOut(identifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-in-shelter'] });
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-history'] });
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-dashboard'] });
      setAlertConfig({ isOpen: true, title: 'ลงทะเบียนออกสำเร็จ', message: 'บันทึกการออกจากศูนย์พักพิงเรียบร้อยแล้ว', isError: false });
      setIdentifier('');
    },
    onError: (error: any) => {
      setAlertConfig({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: error.response?.data?.error || 'เกิดข้อผิดพลาด หรือไม่พบข้อมูลผู้พักพิง/ออกไปแล้ว', isError: true });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setIdentifierError('กรุณากรอกหมายเลขประจำตัว หรือ ชื่อผู้พักพิง');
      return;
    }
    setIdentifierError('');
    setShowDropdown(false);
    mutation.mutate(identifier);
  };

  const filteredEvacuees = evacuees?.filter((e: any) => 
    e.name.toLowerCase().includes(identifier.toLowerCase()) || 
    e.registrationCode.toLowerCase().includes(identifier.toLowerCase())
  ) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ลงทะเบียนออก (Check-out)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">บันทึกการออกจากศูนย์พักพิง เพื่อบริหารจัดการทรัพยากร</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
          <CardTitle className="text-slate-900">ค้นหาผู้พักพิง</CardTitle>
          <CardDescription className="text-slate-500">พิมพ์เพียงบางส่วนของชื่อหรือรหัส เพื่อค้นหาผู้ที่ต้องการลงทะเบียนออก</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative" ref={dropdownRef}>
              <Label htmlFor="identifier" className={`text-sm font-medium ${identifierError ? 'text-rose-600' : 'text-slate-700'}`}>ค้นหาด้วย รหัส (EV-XXXX) หรือ ชื่อ <span className="text-rose-500">*</span></Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  id="identifier" 
                  value={identifier}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => { 
                    setIdentifier(e.target.value); 
                    setIdentifierError('');
                    setShowDropdown(true);
                  }}
                  autoComplete="off"
                  placeholder="พิมพ์ชื่อหรือรหัส เพื่อค้นหา..."
                  className={`pl-10 h-12 bg-white text-slate-900 text-base transition-all ${identifierError ? 'border-rose-400 focus-visible:ring-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.1)]' : 'border-slate-200 focus-visible:ring-amber-500'}`}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && identifier.trim().length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                  {filteredEvacuees.length > 0 ? (
                    <ul className="py-1">
                      {filteredEvacuees.map((e: any) => (
                        <li 
                          key={e.id}
                          className="px-4 py-3 hover:bg-amber-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                          onClick={() => {
                            setIdentifier(e.registrationCode);
                            setShowDropdown(false);
                            setIdentifierError('');
                          }}
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{e.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{e.basicInfo || 'ไม่มีข้อมูลเพิ่มเติม'}</p>
                          </div>
                          <span className="text-sm font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                            {e.registrationCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      ไม่พบผู้พักพิงที่ตรงกับข้อมูลนี้
                    </div>
                  )}
                </div>
              )}

              {identifierError && (
                <p className="text-sm font-medium text-rose-500 animate-in slide-in-from-top-1 fade-in duration-300">
                  {identifierError}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 rounded-xl transition-all"
            >
              {mutation.isPending ? 'กำลังบันทึกการออก...' : 'ยืนยันการลงทะเบียนออก'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className={alertConfig.isError ? "text-rose-600" : "text-emerald-600"}>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base">
              {alertConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
              className={`rounded-xl px-6 ${alertConfig.isError ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
