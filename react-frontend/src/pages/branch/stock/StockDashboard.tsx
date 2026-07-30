import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Box, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';

export default function StockDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/v1/stock/dashboard/overview');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Package className="size-8 animate-pulse text-amber-500/50" />
        <p className="font-medium animate-pulse">กำลังโหลดข้อมูลคลังปัจจัย...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-inner border border-amber-200/50">
            <Package className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ภาพรวมคลังปัจจัยยังชีพ</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              สรุปข้อมูลสต๊อกสินค้าและการเคลื่อนไหวล่าสุด
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <Button 
            onClick={() => navigate('products')} 
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-500/20 transition-all hover:shadow-amber-500/30 font-medium"
          >
            <Box className="mr-2 size-4" />
            จัดการคลังสินค้า
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Box className="size-24 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">รายการสินค้าทั้งหมด</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Box className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.totalProducts || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">รายการปัจจัยในระบบที่พร้อมใช้งาน</p>
          </CardContent>
        </Card>
        
        <Card className="border-rose-200 bg-rose-50/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="size-24 text-rose-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-rose-700">สินค้าใกล้หมด (Low Stock)</CardTitle>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-700 tracking-tight">{data?.lowStockCount || 0}</div>
            <p className="text-sm font-medium text-rose-600/70 mt-1">จำนวนรายการที่ต้องเติมด่วน</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1">
        {/* Product Inventory List (Full width) */}
        <Card className="border-slate-200/60 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100/60 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">รายการสินค้าคงเหลือ</CardTitle>
                <CardDescription className="font-medium mt-1">สรุปจำนวนปัจจัยทั้งหมดในคลังปัจจุบัน</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('products')} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium">
                จัดการคลังทั้งหมด <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col max-h-[500px] overflow-y-auto">
            {data?.products?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                <Box className="size-10 mb-3 opacity-20" />
                <p className="font-medium">ยังไม่มีรายการสินค้าในระบบ</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data?.products?.map((prod: any) => (
                  <div key={prod.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm border ${prod.quantity < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <Package className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{prod.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {prod.category?.name || 'ไม่มีหมวดหมู่'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${prod.quantity < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                      <p className="text-lg font-bold">
                        {prod.quantity.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium opacity-80">{prod.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
