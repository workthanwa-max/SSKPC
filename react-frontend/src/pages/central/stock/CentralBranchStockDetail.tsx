import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Box, History, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function CentralBranchStockDetail() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, txRes] = await Promise.all([
          apiClient.get(`/api/v1/stock/central/branches/${branchId}/products`),
          apiClient.get(`/api/v1/stock/central/branches/${branchId}/transactions`)
        ]);
        setProducts(prodRes.data.data);
        setTransactions(txRes.data.data);
      } catch (error) {
        console.error('Failed to fetch branch stock detail', error);
      } finally {
        setLoading(false);
      }
    };
    if (branchId) fetchData();
  }, [branchId]);

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === 'all' || p.category?.name === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate('/central/branches-stock')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full shrink-0">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner shrink-0 hidden sm:flex">
            <Box className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายละเอียดคลังศูนย์พักพิง</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5 font-mono">
              รหัสศูนย์: {branchId}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Box className="size-4" />
            รายการสินค้าคงเหลือ
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="size-4" />
            ประวัติการทำรายการ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="size-5 text-blue-500" />
                รายการปัจจัยทั้งหมด ({filteredProducts.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Select value={filterCategory} onValueChange={(val: any) => setFilterCategory(val)}>
                  <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Filter className="size-4 text-slate-400" />
                      <span>
                        {filterCategory === 'all' ? 'ทั้งหมด (All Categories)' : filterCategory}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                    <SelectItem value="all" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 font-medium text-slate-700">ทั้งหมด (All Categories)</SelectItem>
                    {uniqueCategories.map((cat: any) => (
                      <SelectItem key={cat} value={cat} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-blue-500/80"></div>
                          {cat}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือ รหัส SKU..."
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">รหัส (SKU)</th>
                      <th className="px-6 py-4 font-semibold">ชื่อสินค้า</th>
                      <th className="px-6 py-4 font-semibold">หมวดหมู่</th>
                      <th className="px-6 py-4 font-semibold text-right">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">ไม่พบรายการสินค้า</td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{prod.sku || '-'}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{prod.name}</td>
                          <td className="px-6 py-4 text-slate-600">
                            <Badge variant="outline" className="bg-slate-50">{prod.category?.name}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold ${prod.quantity < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                              {prod.quantity}
                            </span>
                            <span className="text-slate-500 ml-1 text-xs">{prod.unit}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="size-5 text-violet-500" />
                ประวัติการรับเข้าและเบิกออก
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">วันเวลา</th>
                      <th className="px-6 py-4 font-semibold">ประเภท</th>
                      <th className="px-6 py-4 font-semibold">สินค้า</th>
                      <th className="px-6 py-4 font-semibold text-right">จำนวน</th>
                      <th className="px-6 py-4 font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่มีประวัติการทำรายการ</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                            {new Date(tx.createdAt).toLocaleString('th-TH')}
                          </td>
                          <td className="px-6 py-4">
                            {tx.type === 'INBOUND' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-wide">
                                <ArrowDownToLine className="size-3" /> รับเข้า
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold tracking-wide">
                                <ArrowUpFromLine className="size-3" /> เบิกออก
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">{tx.product?.name}</td>
                          <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INBOUND' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {tx.type === 'INBOUND' ? '+' : '-'}{tx.quantity} <span className="font-normal text-slate-500 text-xs">{tx.product?.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">{tx.note || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
