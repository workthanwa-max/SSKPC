import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { Mail, Shield, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto max-w-3xl space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header Section with Decorative Blob */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-200/60">
        {/* Decorative Background */}
        <div className="absolute -top-[50%] -left-[10%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-[50%] -right-[10%] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        
        {/* Avatar */}
        <div className="relative z-10 mb-5 flex size-24 items-center justify-center rounded-full bg-slate-50 border-4 border-white shadow-xl">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name}&backgroundColor=f1f5f9`} 
            alt={user?.name}
            className="size-full rounded-full object-cover"
          />
        </div>
        
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{user?.name}</h1>
          <Badge variant="secondary" className="font-mono text-sm tracking-wider bg-slate-100 text-slate-600 border-slate-200 px-3 py-1">
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Account Details Section */}
      <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">รายละเอียดบัญชี</h2>
          <p className="text-sm text-slate-500">ข้อมูลส่วนตัวและระดับสิทธิ์การเข้าถึงของคุณ</p>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Name Detail */}
            <div className="flex flex-col space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <UserIcon className="size-4 text-primary/60" />
                ชื่อ-นามสกุล
              </div>
              <p className="text-base font-medium text-slate-900">{user?.name}</p>
            </div>

            {/* Email Detail */}
            <div className="flex flex-col space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Mail className="size-4 text-primary/60" />
                อีเมล
              </div>
              <p className="text-base font-medium text-slate-900">{user?.email}</p>
            </div>

            {/* Role Detail */}
            <div className="flex flex-col space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100 transition-colors hover:bg-slate-100/50 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Shield className="size-4 text-primary/60" />
                บทบาท (Role)
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-slate-900">{user?.role}</p>
                <Badge className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none gap-1 px-2.5 py-0.5">
                  <ShieldCheck className="size-3.5" /> ตรวจสอบสิทธิ์แล้ว
                </Badge>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
