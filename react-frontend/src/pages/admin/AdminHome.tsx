import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { Users, ShieldCheck, Terminal, ShieldAlert, Tent, UserCheck } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';

export default function AdminHome() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get('/api/v1/dashboard/admin/overview');
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const { users, shelters } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 shadow-inner border border-rose-200/50">
            <ShieldAlert className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">กองบัญชาการสูงสุด (Supreme Command)</h1>
            <p className="text-sm md:text-base font-medium text-slate-500 mt-1">
              ยินดีต้อนรับท่านผู้บัญชาการ: <b className="text-slate-700">{user?.name}</b>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">ผู้ใช้งานระบบทั้งหมด</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{loading ? '...' : users?.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Central: {users?.central || 0}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Branch: {users?.branch || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">บัญชีที่เปิดใช้งาน (Active)</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{loading ? '...' : users?.active || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">บัญชีผู้ใช้งานที่สามารถเข้าระบบได้</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">ศูนย์พักพิงที่ลงทะเบียน</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Tent className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{loading ? '...' : shelters?.total || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">สาขาทั้งหมดในเครือข่าย</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-md transition-all relative group bg-gradient-to-br from-white to-rose-50/30">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="size-24 text-rose-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-bold text-slate-500">ระดับความปลอดภัยระบบ</CardTitle>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-4xl font-black text-rose-600">SECURE</div>
            <p className="text-sm font-semibold text-rose-600/80 mt-1">API & Database ทำงานปกติ</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-slate-200/60 rounded-3xl overflow-hidden bg-slate-900 border-0">
        <CardHeader className="bg-slate-950/50 text-white p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="size-6 text-emerald-400" />
            <div>
              <CardTitle className="text-lg text-slate-100 font-bold">บันทึกปฏิบัติการระบบ (System Audit Logs)</CardTitle>
              <CardDescription className="text-slate-400">การเข้าถึงและการเคลื่อนไหวระดับผู้ดูแลระบบ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-slate-900 text-emerald-400 font-mono text-sm">
          <div className="flex flex-col gap-3 h-48 overflow-y-auto">
            <p>{`> [SYSTEM] Secure connection established at ${new Date().toLocaleTimeString('th-TH')}`}</p>
            <p>{`> [AUTH] Supreme Commander ${user?.name} authenticated successfully.`}</p>
            <p>{`> [NETWORK] Dashboard module connected... DATA FETCHED`}</p>
            <p>{`> [SYSTEM] Loaded ${users?.total || 0} user records and ${shelters?.total || 0} branch locations.`}</p>
            <p className="text-slate-500 mt-4 animate-pulse">_ Awaiting further administrative commands...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
