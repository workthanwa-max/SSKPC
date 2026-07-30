import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownToLine, ArrowUpFromLine, History, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StockTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'INBOUND'|'OUTBOUND'>('INBOUND');
  const [formData, setFormData] = useState({ productId: '', quantity: 1, note: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [txRes, prodRes] = await Promise.all([
        apiClient.get('/api/v1/stock/transactions'),
        apiClient.get('/api/v1/stock/products')
      ]);
      setTransactions(txRes.data.data);
      setProducts(prodRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const endpoint = transactionType === 'INBOUND' ? '/api/v1/stock/transactions/inbound' : '/api/v1/stock/transactions/outbound';
      await apiClient.post(endpoint, {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        note: formData.note
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการทำรายการ');
    }
  };

  const openDialog = (type: 'INBOUND'|'OUTBOUND') => {
    setTransactionType(type);
    setError(null);
    setFormData({ productId: products[0]?.id || '', quantity: 1, note: '' });
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-violet-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shadow-inner">
            <History className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รับเข้า/เบิกออก</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              บันทึกประวัติการรับปัจจัยเข้าและเบิกจ่ายให้ผู้ประสบภัย
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto relative z-10">
          <Button onClick={() => openDialog('INBOUND')} className="flex-1 md:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <ArrowDownToLine className="mr-2 size-4" /> รับเข้า
          </Button>
          <Button onClick={() => openDialog('OUTBOUND')} className="flex-1 md:flex-none rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <ArrowUpFromLine className="mr-2 size-4" /> เบิกออก
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="size-5 text-violet-500" />
            ประวัติการทำรายการ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 py-4 border-b border-slate-100">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                <TabsTrigger value="inbound" className="text-emerald-600 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">รับเข้า</TabsTrigger>
                <TabsTrigger value="outbound" className="text-amber-600 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">เบิกออก</TabsTrigger>
              </TabsList>
            </div>
            
            {['all', 'inbound', 'outbound'].map(tab => {
              const filteredTx = transactions.filter(tx => 
                tab === 'all' || 
                (tab === 'inbound' && tx.type === 'INBOUND') || 
                (tab === 'outbound' && tx.type === 'OUTBOUND')
              );

              return (
                <TabsContent key={tab} value={tab} className="m-0">
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
                        {filteredTx.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่มีประวัติการทำรายการ</td>
                          </tr>
                        ) : (
                          filteredTx.map((tx) => (
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
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {tx.product?.name}
                              </td>
                              <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INBOUND' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {tx.type === 'INBOUND' ? '+' : '-'}{tx.quantity} <span className="font-normal text-slate-500 text-xs">{tx.product?.unit}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                                {tx.note || '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden font-sans border-none rounded-2xl shadow-2xl">
          <div className={`p-6 flex flex-col items-center justify-center border-b relative ${
            transactionType === 'INBOUND' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
          }`}>
            <div className={`absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl ${
              transactionType === 'INBOUND' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`} />
            <div className={`size-16 bg-white rounded-full flex items-center justify-center shadow-sm border mb-4 relative z-10 ${
              transactionType === 'INBOUND' ? 'border-emerald-100' : 'border-amber-100'
            }`}>
              {transactionType === 'INBOUND' ? <ArrowDownToLine className="size-8 text-emerald-500" /> : <ArrowUpFromLine className="size-8 text-amber-500" />}
            </div>
            <DialogTitle className={`text-xl font-bold relative z-10 ${
              transactionType === 'INBOUND' ? 'text-emerald-900' : 'text-amber-900'
            }`}>
              {transactionType === 'INBOUND' ? 'บันทึกรับเข้าสินค้า' : 'บันทึกเบิกออกสินค้า'}
            </DialogTitle>
          </div>
          <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2 shadow-sm">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-slate-700 font-semibold">เลือกสินค้า <span className="text-rose-500">*</span></Label>
              <Select value={formData.productId} onValueChange={(val: string | null) => setFormData({ ...formData, productId: val || '' })}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                  <SelectValue placeholder="เลือกสินค้าที่ต้องการ...">
                    {formData.productId && products.find(p => p.id === formData.productId) ? (
                      <span className="flex items-center">
                        {products.find(p => p.id === formData.productId)?.name} 
                        <span className="text-slate-400 ml-2 text-xs">
                          (คงเหลือ: {products.find(p => p.id === formData.productId)?.quantity} {products.find(p => p.id === formData.productId)?.unit})
                        </span>
                      </span>
                    ) : "เลือกสินค้าที่ต้องการ..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {products.map(prod => (
                    <SelectItem key={prod.id} value={prod.id} className="rounded-lg py-2">
                      {prod.name} <span className="text-slate-400 ml-2 text-xs">(คงเหลือ: {prod.quantity} {prod.unit})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-700 font-semibold">จำนวน <span className="text-rose-500">*</span></Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} 
                required 
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note" className="text-slate-700 font-semibold">หมายเหตุ (ทางเลือก)</Label>
              <Input 
                id="note" 
                value={formData.note} 
                onChange={(e) => setFormData({ ...formData, note: e.target.value })} 
                placeholder={transactionType === 'INBOUND' ? "เช่น รับจากส่วนกลาง, บริจาค" : "เช่น จ่ายให้ผู้ประสบภัยเต็นท์ A"} 
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            
            <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 px-6 rounded-xl font-medium text-slate-600 hover:bg-slate-100">ยกเลิก</Button>
              <Button type="submit" className={`h-11 px-8 rounded-xl font-semibold text-white shadow-md ${
                transactionType === 'INBOUND' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}>
                บันทึกรายการ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

