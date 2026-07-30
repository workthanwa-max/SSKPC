import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/apiClient';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, ShieldAlert, Key, Ban, UserCheck, Users as UsersIcon, Mail } from 'lucide-react';

import { ConfirmActionDialog } from '../../components/shared/ConfirmActionDialog';
import { UserFormDialog } from './components/UserFormDialog';
import { PasswordResetDialog } from './components/PasswordResetDialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Confirm Action States
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    description: '',
    userId: '',
    action: '' as 'SUSPEND' | 'UNSUSPEND' | 'RESET_PASSWORD',
    isDestructive: false,
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/api/v1/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (data: any) => {
    try {
      await apiClient.post('/api/v1/users', data);
      await fetchUsers();
      setIsFormOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmState.action === 'SUSPEND' || confirmState.action === 'UNSUSPEND') {
        const newStatus = confirmState.action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
        await apiClient.patch(`/api/v1/users/${confirmState.userId}/status`, { status: newStatus });
        await fetchUsers();
      } else if (confirmState.action === 'RESET_PASSWORD') {
        const res = await apiClient.post(`/api/v1/users/${confirmState.userId}/reset-password`);
        setNewPassword(res.data.data.newPassword);
        setIsResetOpen(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const openSuspendConfirm = (user: User) => {
    setConfirmState({
      open: true,
      title: 'ยืนยันการระงับบัญชี',
      description: `คุณแน่ใจหรือไม่ที่จะระงับบัญชีของ ${user.name} (${user.email})? ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบได้อีกจนกว่าจะถูกปลดระงับ`,
      userId: user.id,
      action: 'SUSPEND',
      isDestructive: true,
    });
  };

  const openUnsuspendConfirm = (user: User) => {
    setConfirmState({
      open: true,
      title: 'ยืนยันการปลดระงับบัญชี',
      description: `บัญชีของ ${user.name} (${user.email}) จะกลับมาใช้งานได้ตามปกติ คุณต้องการดำเนินการต่อหรือไม่?`,
      userId: user.id,
      action: 'UNSUSPEND',
      isDestructive: false,
    });
  };

  const openResetPasswordConfirm = (user: User) => {
    setConfirmState({
      open: true,
      title: 'รีเซ็ตรหัสผ่าน',
      description: `ระบบจะสร้างรหัสผ่านใหม่แบบสุ่มสำหรับ ${user.name} รหัสผ่านเดิมจะไม่สามารถใช้งานได้อีก คุณแน่ใจหรือไม่?`,
      userId: user.id,
      action: 'RESET_PASSWORD',
      isDestructive: true,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Decorative Background Blob for Header */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
            <UsersIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">จัดการผู้ใช้ระบบ</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              เพิ่ม แก้ไข ระงับบัญชี และรีเซ็ตรหัสผ่าน สำหรับผู้ปฏิบัติงาน
            </p>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg relative z-10">
          <Plus className="size-4" />
          เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] font-semibold text-slate-600">ผู้ใช้งาน</TableHead>
              <TableHead className="font-semibold text-slate-600">อีเมล</TableHead>
              <TableHead className="font-semibold text-slate-600">บทบาท</TableHead>
              <TableHead className="font-semibold text-slate-600">สถานะ</TableHead>
              <TableHead className="w-[80px] text-right font-semibold text-slate-600">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
                    <span className="text-sm font-medium">กำลังโหลดข้อมูล...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <UsersIcon className="size-10 text-slate-300" />
                    <span className="text-sm font-medium">ไม่พบข้อมูลผู้ใช้งาน</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group transition-colors hover:bg-slate-50/80">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-bold text-primary shadow-sm border border-primary/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{user.name}</span>
                        <span className="text-xs font-medium text-slate-500">ID: {user.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="size-3.5 text-slate-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs font-semibold tracking-wider bg-slate-100 text-slate-700 border-slate-200">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.status === 'ACTIVE' ? (
                      <Badge className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none gap-1 font-medium px-2 py-0.5">
                        <UserCheck className="size-3" /> ปกติ
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-rose-100/80 text-rose-700 hover:bg-rose-100 border-rose-200 shadow-none gap-1 font-medium px-2 py-0.5">
                        <Ban className="size-3" /> ถูกระงับ
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-slate-400 hover:text-slate-900 data-[state=open]:bg-slate-100" })}>
                        <span className="sr-only">เปิดเมนู</span>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 font-sans">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400">การจัดการ</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openResetPasswordConfirm(user)} className="cursor-pointer py-2">
                            <Key className="mr-2 size-4 text-blue-500" />
                            รีเซ็ตรหัสผ่าน
                          </DropdownMenuItem>
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => openSuspendConfirm(user)} className="cursor-pointer py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                              <ShieldAlert className="mr-2 size-4" />
                              ระงับบัญชี (Suspend)
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openUnsuspendConfirm(user)} className="cursor-pointer py-2 text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50">
                              <UserCheck className="mr-2 size-4" />
                              ปลดระงับบัญชี (Unsuspend)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleCreateUser}
        isLoading={false}
      />

      <PasswordResetDialog 
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        newPassword={newPassword}
      />

      <ConfirmActionDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={executeConfirmAction}
        isDestructive={confirmState.isDestructive}
      />
    </div>
  );
}
