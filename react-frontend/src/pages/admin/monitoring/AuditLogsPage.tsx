import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, FileJson, Clock, Server, User as UserIcon, RefreshCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuditLog {
  id: string;
  action: string;
  userId: string | null;
  ipAddress: string | null;
  metadata: any;
  createdAt: string;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeta, setSelectedMeta] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/api/v1/admin/monitoring/audit-logs');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    if (action === 'LOGIN_FAILED') return <Badge variant="destructive" className="font-mono">{action}</Badge>;
    if (action === 'LOGIN_SUCCESS') return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-mono">{action}</Badge>;
    return <Badge variant="secondary" className="font-mono text-blue-600 bg-blue-50 hover:bg-blue-100">{action}</Badge>;
  };

  const handleViewMeta = (meta: any) => {
    setSelectedMeta(meta);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="size-8 text-rose-500" />
            Security Audit Logs
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Server className="size-4" /> ระบบตรวจสอบร่องรอยการกระทำที่สำคัญตามหลัก Zero-Trust
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={refreshing} variant="outline" className="shrink-0 bg-white shadow-sm border-slate-200 h-10 px-4 rounded-xl">
          <RefreshCcw className={`mr-2 size-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          รีเฟรชข้อมูล
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl">
        <CardHeader className="bg-white/40 border-b border-slate-100/50 pb-4">
          <CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle>
          <CardDescription>แสดงรายการเหตุการณ์ที่มีผลต่อความปลอดภัยของระบบ</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12">Action</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12">IP Address</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12">User ID</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 text-right px-6">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right px-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    ไม่พบข้อมูล Audit Log ในระบบ
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-sm">
                        <Clock className="size-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="py-4 font-mono text-sm text-slate-600">
                      {log.ipAddress || '-'}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        {log.userId ? (
                          <>
                            <UserIcon className="size-3.5 text-slate-400" />
                            <span className="font-mono text-slate-600 truncate max-w-[120px]" title={log.userId}>{log.userId}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">System / Unknown</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewMeta(log.metadata)}
                        disabled={!log.metadata}
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8 rounded-lg"
                      >
                        <FileJson className="mr-2 size-4" />
                        ดูข้อมูล
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl font-sans rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileJson className="size-5 text-blue-500" />
              Metadata Details
            </DialogTitle>
            <DialogDescription>
              ข้อมูลประกอบแบบ JSON Format (ผ่านการทำ PII Masking แล้ว)
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 bg-slate-950 rounded-xl p-4 overflow-x-auto">
            <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
