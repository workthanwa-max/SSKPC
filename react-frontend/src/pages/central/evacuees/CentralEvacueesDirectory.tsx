import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { evacueesService } from '../../../services/evacuees.service';
import { LayoutList, Search, MapPin } from 'lucide-react';

export default function CentralEvacueesDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: branches, isLoading } = useQuery({
    queryKey: ['central-evacuees-branches'],
    queryFn: evacueesService.getCentralBranches,
  });

  const filteredBranches = branches?.filter((branch: any) => 
    branch.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">กำลังโหลดข้อมูลศูนย์...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
            <LayoutList className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายชื่อผู้เข้ารับบริการ</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">ค้นหาและดูรายชื่อประชาชนที่ลงทะเบียนในแต่ละศูนย์พักพิง</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72 z-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อศูนย์พักพิง..."
            className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 shadow-sm focus:bg-white transition-colors text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.length > 0 ? filteredBranches.map((branch: any) => (
          <Card key={branch.id} className="border-slate-200 shadow-sm flex flex-col hover:border-blue-200 hover:shadow-md transition-all group">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <MapPin className="size-4 text-blue-500" />
                {branch.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">ผู้เข้ารับบริการปัจจุบัน:</span>
                  <span className="text-lg font-bold text-slate-900">{branch._count.evacuees} <span className="text-sm font-normal text-slate-500">คน</span></span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors"
                variant="secondary"
                onClick={() => navigate(`/central/evacuees/directory/${branch.id}`)}
              >
                ดูรายชื่อผู้เข้ารับบริการ
              </Button>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
            ไม่พบศูนย์พักพิงที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
