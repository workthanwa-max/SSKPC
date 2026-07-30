import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Package, AlertTriangle, Box, ArrowDownUp } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';


export default function BranchStockReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/v1/analytics/branch/stock-report');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch branch stock report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Package className="size-8 animate-pulse text-indigo-500/50" />
        <p className="font-medium animate-pulse">กำลังโหลดรายงานทรัพยากร...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
            <Package className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายงานปัจจัยยังชีพคงเหลือ</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ภาพรวมทรัพยากรคงคลังทั้งหมดภายในศูนย์</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Box className="size-24 text-indigo-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">จำนวนปัจจัยยังชีพรวม</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{data?.totalQuantity?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">ชิ้น / หน่วย (รวมทุกรายการสินค้า)</p>
          </CardContent>
        </Card>
        
        <Card className="border-rose-200 bg-rose-50/30 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="size-24 text-rose-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-rose-700">สินค้าความเสี่ยงสูง (Low Stock)</CardTitle>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-700 tracking-tight">{data?.lowStockCount?.toLocaleString() || 0}</div>
            <p className="text-sm font-medium text-rose-600/70 mt-1">รายการสินค้าที่มีจำนวนเหลือน้อยกว่า 10 หน่วย</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="border-b border-slate-100/60 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg text-slate-900">รายการทรัพยากรทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.products?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <ArrowDownUp className="size-10 mb-3 opacity-20" />
              <p className="font-medium">ยังไม่มีข้อมูลทรัพยากรในคลัง</p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white m-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">ชื่อสินค้า / หมวดหมู่</th>
                      <th className="px-6 py-4 font-medium text-right">จำนวนคงเหลือ</th>
                      <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.products?.map((product: any, idx: number) => {
                      const isLowStock = product.quantity < 10;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{product.name}</span>
                              <span className="text-sm text-slate-500 mt-0.5">{product.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-lg font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>{product.quantity.toLocaleString()}</span>
                            <span className="text-xs font-medium text-slate-500 ml-1">{product.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isLowStock ? (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">ใกล้หมด</span>
                            ) : product.isCritical ? (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">ปัจจัยสำคัญ</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">ปกติ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
