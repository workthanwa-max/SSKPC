import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Box, Search, Filter } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StockProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', unit: '', categoryId: '' });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/api/v1/stock/products'),
        apiClient.get('/api/v1/stock/categories')
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/api/v1/stock/products/${editingId}`, formData);
      } else {
        await apiClient.post('/api/v1/stock/products', formData);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving product', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบสินค้านี้? ข้อมูลและประวัติทั้งหมดที่เกี่ยวข้องจะถูกลบ')) return;
    try {
      await apiClient.delete(`/api/v1/stock/products/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', description: '', unit: '', categoryId: categories[0]?.id || '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (prod: any) => {
    setEditingId(prod.id);
    setFormData({ name: prod.name, sku: prod.sku || '', description: prod.description || '', unit: prod.unit, categoryId: prod.categoryId });
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
            <Box className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">คลังสินค้า</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              จัดการรายการปัจจัยยังชีพและตรวจสอบยอดคงเหลือ
            </p>
          </div>
        </div>

        <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl relative z-10">
          <Plus className="mr-2 size-4" /> เพิ่มสินค้า
        </Button>
      </div>

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
                    {filterCategory === 'all' 
                      ? 'ทั้งหมด (All Categories)' 
                      : categories.find(c => c.id === filterCategory)?.name || 'หมวดหมู่ทั้งหมด'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                <SelectItem value="all" className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 font-medium text-slate-700">ทั้งหมด (All Categories)</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500/80"></div>
                      {c.name}
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
                  <th className="px-6 py-4 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่พบรายการสินค้า</td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{prod.sku || '-'}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{prod.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-[10px] font-medium border border-slate-200">
                          {prod.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${prod.quantity < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {prod.quantity}
                        </span>
                        <span className="text-slate-500 ml-1 text-xs">{prod.unit}</span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(prod)} className="h-8 w-8 text-slate-500 hover:text-blue-600">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)} className="h-8 w-8 text-slate-500 hover:text-rose-600">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden font-sans border-none rounded-2xl shadow-2xl">
          <div className="bg-blue-50 p-6 flex flex-col items-center justify-center border-b border-blue-100 relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 mb-4 relative z-10">
              {editingId ? <Pencil className="size-8 text-blue-500" /> : <Box className="size-8 text-blue-500" />}
            </div>
            <DialogTitle className="text-xl text-blue-900 font-bold relative z-10">
              {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </DialogTitle>
          </div>
          <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">ชื่อสินค้า <span className="text-rose-500">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-slate-700 font-semibold">รหัส SKU (ทางเลือก)</Label>
                <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-slate-700 font-semibold">หน่วยนับ <span className="text-rose-500">*</span></Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="เช่น ชิ้น, กล่อง, แพ็ค" required className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="categoryId" className="text-slate-700 font-semibold">หมวดหมู่ <span className="text-rose-500">*</span></Label>
                <Select value={formData.categoryId} onValueChange={(val: string | null) => setFormData({ ...formData, categoryId: val || '' })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                    <SelectValue>
                      {categories.find(c => c.id === formData.categoryId)?.name || 'เลือกหมวดหมู่'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="desc" className="text-slate-700 font-semibold">คำอธิบาย</Label>
                <Input id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
              </div>
            </div>
            <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 px-6 rounded-xl font-medium text-slate-600 hover:bg-slate-100">ยกเลิก</Button>
              <Button type="submit" className="h-11 px-8 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">บันทึกข้อมูล</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
