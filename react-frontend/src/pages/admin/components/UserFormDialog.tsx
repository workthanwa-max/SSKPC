import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, ShieldAlert, Users, Store } from 'lucide-react';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}
export function UserFormDialog({ open, onOpenChange, onSubmit, isLoading }: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BRANCH',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ name: '', email: '', password: '', role: 'BRANCH' }); // Reset on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden font-sans border-none rounded-2xl shadow-2xl">
        <div className="bg-indigo-50 p-6 flex flex-col items-center justify-center border-b border-indigo-100 relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100 mb-4 relative z-10">
            <UserPlus className="size-8 text-indigo-600" />
          </div>
          <DialogTitle className="text-xl text-indigo-900 font-bold relative z-10">
            เพิ่มผู้ใช้ใหม่
          </DialogTitle>
          <p className="text-sm text-indigo-600/80 mt-1 text-center relative z-10">
            กำหนดรายละเอียดสำหรับบัญชีผู้ใช้ใหม่ในระบบ
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-semibold">ชื่อ-นามสกุล <span className="text-rose-500">*</span></Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold">อีเมล <span className="text-rose-500">*</span></Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-semibold">รหัสผ่านชั่วคราว <span className="text-rose-500">*</span></Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 font-semibold">บทบาท <span className="text-rose-500">*</span></Label>
            <Select value={formData.role} onValueChange={(val: any) => setFormData({ ...formData, role: val || 'BRANCH' })}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors shadow-none text-slate-700">
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1 min-w-[320px]">
                <SelectItem value="BRANCH" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-700">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
                      <Store className="size-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">สาขาหน้างาน (BRANCH)</span>
                      <span className="text-[10px] text-slate-500 font-medium">เจ้าหน้าที่ประจำศูนย์พักพิงต่างๆ</span>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="CENTRAL" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                      <Users className="size-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">ส่วนกลาง (CENTRAL)</span>
                      <span className="text-[10px] text-slate-500 font-medium">เจ้าหน้าที่ศูนย์บัญชาการ ควบคุมเครือข่าย</span>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 data-[state=checked]:bg-rose-50 data-[state=checked]:text-rose-700">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-rose-100 text-rose-600">
                      <ShieldAlert className="size-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">ผู้ดูแลระบบ (ADMIN)</span>
                      <span className="text-[10px] text-slate-500 font-medium">จัดการระบบและสิทธิ์การเข้าถึงทั้งหมด</span>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-6 rounded-xl font-medium text-slate-600 hover:bg-slate-100">
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
