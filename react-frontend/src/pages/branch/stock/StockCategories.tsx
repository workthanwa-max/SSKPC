import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function StockCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/v1/stock/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/api/v1/stock/categories/${editingId}`, formData);
      } else {
        await apiClient.post('/api/v1/stock/categories', formData);
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบหมวดหมู่นี้? สินค้าในหมวดหมู่นี้อาจได้รับผลกระทบ')) return;
    try {
      await apiClient.delete(`/api/v1/stock/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category', error);
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '' });
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Tag className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">จัดการหมวดหมู่</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              แบ่งกลุ่มประเภทปัจจัยและสินค้าภายในคลัง
            </p>
          </div>
        </div>
        <Button onClick={openNewDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl relative z-10">
          <Plus className="mr-2 size-4" /> เพิ่มหมวดหมู่
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                    <Tag className="size-4" />
                  </div>
                  <CardTitle className="text-lg">{cat.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)} className="h-8 w-8 text-slate-500 hover:text-blue-600">
                    <Pencil className="size-3.5" />
                  </Button>
                  {!cat.isSystem && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-slate-500 hover:text-rose-600">
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                {cat.isSystem && <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 mr-2">พื้นฐาน (ระบบ)</span>}
                {cat.isCritical && <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">ปัจจัยวิกฤต 4</span>}
              </div>
              {cat.description && <CardDescription className="pt-2">{cat.description}</CardDescription>}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden font-sans border-none rounded-2xl shadow-2xl">
          <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center border-b border-emerald-100 relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 mb-4 relative z-10">
              {editingId ? <Pencil className="size-8 text-emerald-500" /> : <Tag className="size-8 text-emerald-500" />}
            </div>
            <DialogTitle className="text-xl text-emerald-900 font-bold relative z-10">
              {editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </DialogTitle>
          </div>
          <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold">ชื่อหมวดหมู่ <span className="text-rose-500">*</span></Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="เช่น อาหารแห้ง, น้ำดื่ม" 
                required 
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-slate-700 font-semibold">คำอธิบาย (ทางเลือก)</Label>
              <Input 
                id="desc" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="รายละเอียดเพิ่มเติม" 
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 px-6 rounded-xl font-medium text-slate-600 hover:bg-slate-100">ยกเลิก</Button>
              <Button type="submit" className="h-11 px-8 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">บันทึกข้อมูล</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
