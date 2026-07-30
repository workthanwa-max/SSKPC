import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, Box, MapPin } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function CentralBranchesStock() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiClient.get('/api/v1/stock/central/branches');
        setBranches(response.data.data);
      } catch (error) {
        console.error('Failed to fetch branches overview', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลศูนย์พักพิง...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner shrink-0 hidden sm:flex">
            <Store className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">สต๊อกศูนย์พักพิง</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              ตรวจสอบปริมาณคลังสินค้าและปัจจัยยังชีพของศูนย์พักพิงทั้งหมดในเครือข่าย เพื่อการบริหารจัดการและการกระจายทรัพยากรที่มีประสิทธิภาพ
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Store className="size-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ไม่พบศูนย์พักพิงในระบบ</h3>
            <p className="text-slate-500 mt-1">ยังไม่มีการเพิ่มข้อมูลศูนย์พักพิงในเครือข่าย</p>
          </div>
        ) : (
          branches.map(branch => (
            <Card key={branch.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/50 hover:ring-blue-100 relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1" title={branch.name}>{branch.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{branch.email}</p>
                  </div>
                  <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <Store className="size-5" />
                  </div>
                </div>

                {branch.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <MapPin className="size-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{branch.location.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 mb-5">
                  <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                    <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                      <Box className="size-4 text-emerald-600" />
                    </div>
                    ปัจจัยรวม
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">{branch.totalItems?.toLocaleString() || 0}</span>
                    <span className="text-xs text-slate-500 ml-1">ชิ้น</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-white text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 shadow-sm transition-all rounded-xl h-11 font-semibold group/btn" 
                  onClick={() => navigate(`/central/branches-stock/${branch.id}`)}
                >
                  เจาะลึกคลังสินค้า <ArrowRight className="ml-2 size-4 text-slate-400 group-hover/btn:text-blue-500 transition-colors group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
