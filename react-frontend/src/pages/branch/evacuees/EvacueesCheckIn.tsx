import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '../../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { evacueesService } from '../../../services/evacuees.service';

export default function EvacueesCheckIn() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [type, setType] = useState('');
  const [basicInfo, setBasicInfo] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; isError: boolean }>({ isOpen: false, title: '', message: '', isError: false });

  const mutation = useMutation({
    mutationFn: (data: { name: string; gender: string; type: string; basicInfo: string }) => 
      evacueesService.checkIn(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-in-shelter'] });
      queryClient.invalidateQueries({ queryKey: ['branch-evacuees-dashboard'] });
      setGeneratedCode(response.data.registrationCode);
      setName('');
      setGender('');
      setType('');
      setBasicInfo('');
    },
    onError: () => {
      setAlertConfig({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลงทะเบียนได้ โปรดลองอีกครั้ง', isError: true });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('กรุณากรอกชื่อ-นามสกุล หรือ ชื่อเรียก');
      return;
    }
    setNameError('');
    mutation.mutate({ name, gender, type, basicInfo });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ลงทะเบียนเข้า (Check-in)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ลงทะเบียนรับผู้ประสบภัยเข้าสู่ศูนย์พักพิง</p>
          </div>
        </div>
      </div>

      {generatedCode && (
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-emerald-700 font-medium">ลงทะเบียนสำเร็จ! หมายเลขประจำตัว:</div>
              <div className="text-4xl font-bold tracking-wider text-emerald-600 p-4 bg-white rounded-lg inline-block border border-emerald-200 shadow-sm">
                {generatedCode}
              </div>
              <p className="text-sm text-slate-600">โปรดแจ้งหมายเลขนี้ให้ผู้พักพิงทราบ เพื่อใช้ในการลงทะเบียนออก</p>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedCode(null)}
                className="mt-4 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                ลงทะเบียนคนต่อไป
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedCode && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">แบบฟอร์มลงทะเบียน</CardTitle>
            <CardDescription className="text-slate-500">กรุณากรอกข้อมูลพื้นฐานของผู้เข้าพักพิง</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={`text-sm font-medium ${nameError ? 'text-rose-600' : 'text-slate-700'}`}>ชื่อ-นามสกุล / ชื่อเรียก <span className="text-rose-500">*</span></Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  placeholder="นายสมชาย ใจดี"
                  className={`bg-white text-slate-900 h-12 rounded-xl transition-colors ${nameError ? 'border-rose-400 focus-visible:ring-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.1)]' : 'border-slate-200 focus-visible:ring-emerald-500'}`}
                />
                {nameError && (
                  <p className="text-sm font-medium text-rose-500 animate-in slide-in-from-top-1 fade-in duration-300">
                    {nameError}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-700 font-medium">เพศ</Label>
                  <Select value={gender} onValueChange={(val) => val && setGender(val)}>
                    <SelectTrigger id="gender" className="bg-white border-slate-200 text-slate-900 focus:ring-emerald-500 rounded-xl h-12">
                      <SelectValue placeholder="เลือกเพศ..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden p-1">
                      <SelectItem value="MALE" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">ชาย</SelectItem>
                      <SelectItem value="FEMALE" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">หญิง</SelectItem>
                      <SelectItem value="OTHER" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">อื่นๆ / ไม่ระบุ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-700 font-medium">ประเภทผู้พักพิง</Label>
                  <Select value={type} onValueChange={(val) => val && setType(val)}>
                    <SelectTrigger id="type" className="bg-white border-slate-200 text-slate-900 focus:ring-emerald-500 rounded-xl h-12">
                      <SelectValue placeholder="เลือกกลุ่มประเภท..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden p-1">
                      <SelectItem value="CHILD" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">เด็ก (0-14 ปี)</SelectItem>
                      <SelectItem value="ADULT" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">ผู้ใหญ่ (15-59 ปี)</SelectItem>
                      <SelectItem value="ELDERLY" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">ผู้สูงอายุ (60 ปีขึ้นไป)</SelectItem>
                      <SelectItem value="PREGNANT" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">หญิงตั้งครรภ์</SelectItem>
                      <SelectItem value="VULNERABLE" className="rounded-xl py-2.5 focus:bg-emerald-50 focus:text-emerald-900 font-medium text-slate-700 cursor-pointer transition-colors">กลุ่มเปราะบาง / ผู้พิการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="basicInfo" className="text-slate-700">ข้อมูลเบื้องต้น / ความต้องการพิเศษ (ถ้ามี)</Label>
                <textarea 
                  id="basicInfo"
                  className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                  placeholder="เช่น ต้องการยารักษาโรคประจำตัว, มีเด็กเล็ก, บาดเจ็บเล็กน้อย"
                  value={basicInfo}
                  onChange={(e) => setBasicInfo(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการเข้าพักพิง'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className={alertConfig.isError ? "text-rose-600" : "text-slate-900"}>{alertConfig.title}</AlertDialogTitle>
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
