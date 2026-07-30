import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/api/apiClient';
import { Button, buttonVariants } from '@/components/ui/button';
import { LogOut, User as UserIcon, Home, Menu, Users, LayoutList, Map as MapIcon, ChevronDown, Crosshair, Radar, Package, Tag, ArrowDownUp, Box, UserPlus, UserMinus, History, Tent, BarChart2, Activity, ShieldAlert } from 'lucide-react';

const roleDisplay = {
  ADMIN: 'ผู้บัญชาการสูงสุด',
  CENTRAL: 'ศูนย์บัญชาการกลาง',
  BRANCH: 'หน่วยศูนย์พักพิง',
};
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const getHomePath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'CENTRAL') return '/central';
    return '/branch';
  };

  return (
    <div className="min-h-svh bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center px-6 md:px-8 w-full">
          {/* Section 1: Logo */}
          <div className="flex flex-1 items-center justify-start shrink-0">
            <Link to={getHomePath()} className="flex items-center hover:opacity-80 transition-opacity">
              <span className="font-black text-2xl tracking-tighter text-slate-900">
                SSKPC<span className="text-rose-600">.</span>
              </span>
            </Link>
          </div>

          {/* Section 2: Menu */}
          <div className="hidden lg:flex items-center justify-center shrink-0">
            <nav className="flex items-center gap-2">
              <Link to={getHomePath()}>
                <Button 
                  variant="ghost" 
                  className={
                    location.pathname === getHomePath() 
                      ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                >
                  <Home className="mr-2 size-4" />
                  หน้าแรก
                </Button>
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/users">
                    <Button 
                      variant="ghost" 
                      className={
                        location.pathname.startsWith('/admin/users')
                          ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    >
                      <Users className="mr-2 size-4" />
                      จัดการกำลังพล
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/admin/monitoring') ? "bg-rose-50 text-rose-600 font-medium hover:bg-rose-100" : "text-muted-foreground hover:text-foreground hover:bg-muted" })}>
                      <ShieldAlert className="mr-2 size-4" />
                      ระบบติดตามความปลอดภัย
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate('/admin/monitoring/audit-logs')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Activity className="mr-3 size-4 text-rose-500" />
                          Security Audit Logs
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              {user?.role === 'BRANCH' && (
                <>
                  <Link to="/branch/location">
                    <Button 
                      variant="ghost" 
                      className={
                        location.pathname === '/branch/location'
                          ? "bg-rose-50 text-rose-600 font-medium hover:bg-rose-100" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }
                    >
                      <Crosshair className="mr-2 size-4" />
                      พิกัดจุดหลบภัย
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/branch/stock') ? "bg-amber-50 text-amber-600 font-medium hover:bg-amber-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <Package className="mr-2 size-4" />
                      จัดการคลังปัจจัย
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <LayoutList className="mr-3 size-4 text-amber-500" />
                          ภาพรวมสต๊อก (Dashboard)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/categories')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Tag className="mr-3 size-4 text-emerald-500" />
                          จัดการหมวดหมู่
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/products')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Box className="mr-3 size-4 text-blue-500" />
                          คลังสินค้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/transactions')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <ArrowDownUp className="mr-3 size-4 text-violet-500" />
                          ประวัติรับเข้า/เบิกออก
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/branch/evacuees') ? "bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <Users className="mr-2 size-4" />
                      ทรัพยากรมนุษย์
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <BarChart2 className="mr-3 size-4 text-emerald-500" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/capacity')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Tent className="mr-3 size-4 text-emerald-500" />
                          ความจุของศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/check-in')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <UserPlus className="mr-3 size-4 text-emerald-500" />
                          ลงทะเบียนเข้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/check-out')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <UserMinus className="mr-3 size-4 text-amber-500" />
                          ลงทะเบียนออก
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/list')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Users className="mr-3 size-4 text-blue-500" />
                          รายชื่อผู้ใช้บริการ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/history')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <History className="mr-3 size-4 text-slate-500" />
                          ประวัติการลงทะเบียน
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/branch/analytics') ? "bg-violet-50 text-violet-600 font-medium hover:bg-violet-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <BarChart2 className="mr-2 size-4" />
                      วิเคราะห์และรายงาน
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-slate-400 font-bold px-3 py-1">ยุทธศาสตร์ศูนย์</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/survival')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Activity className="mr-3 size-4 text-rose-500" />
                          วิเคราะห์ความอยู่รอด
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuLabel className="text-xs text-slate-400 font-bold px-3 py-1">รายงานสรุปผล</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/stock-report')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Package className="mr-3 size-4 text-amber-500" />
                          รายงานปัจจัยยังชีพ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/evacuee-report')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Users className="mr-3 size-4 text-emerald-500" />
                          รายงานยอดผู้พักพิง
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              {user?.role === 'CENTRAL' && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/central/locations') ? "bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <Radar className="mr-2 size-4" />
                      เครือข่ายศูนย์พักพิง
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate('/central/locations/list')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <LayoutList className="mr-3 size-4 text-indigo-500" />
                          ฐานข้อมูลศูนย์ (Database)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/locations/map')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <MapIcon className="mr-3 size-4 text-rose-500" />
                          เรดาร์ติดตาม (Radar View)
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/central/stock') || location.pathname.startsWith('/central/branches-stock') ? "bg-amber-50 text-amber-600 font-medium hover:bg-amber-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <Package className="mr-2 size-4" />
                      ปัจจัยยังชีพ
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-slate-400 font-bold px-3 py-1">คลังส่วนกลาง</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/stock')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <LayoutList className="mr-3 size-4 text-amber-500" />
                          ภาพรวมสต๊อก
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/categories')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Tag className="mr-3 size-4 text-emerald-500" />
                          จัดการหมวดหมู่
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/products')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Box className="mr-3 size-4 text-blue-500" />
                          คลังสินค้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/transactions')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <ArrowDownUp className="mr-3 size-4 text-violet-500" />
                          ประวัติรับเข้า/เบิกออก
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/central/evacuees') ? "bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <Users className="mr-2 size-4" />
                      ผู้พักพิง
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <BarChart2 className="mr-3 size-4 text-emerald-500" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees/branches')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Tent className="mr-3 size-4 text-emerald-500" />
                          สำรวจรายศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees/directory')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <LayoutList className="mr-3 size-4 text-blue-500" />
                          รายชื่อผู้เข้ารับบริการ
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: location.pathname.startsWith('/central/analytics') || location.pathname.startsWith('/central/branches-stock') ? "bg-violet-50 text-violet-600 font-medium hover:bg-violet-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" })}>
                      <BarChart2 className="mr-2 size-4" />
                      วิเคราะห์และรายงาน
                      <ChevronDown className="ml-1 size-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 font-sans rounded-xl p-1 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-slate-400 font-bold px-3 py-1">ยุทธศาสตร์ภาพรวม</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/survival')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Activity className="mr-3 size-4 text-rose-500" />
                          วิเคราะห์ความอยู่รอด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/branches-stock')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Crosshair className="mr-3 size-4 text-violet-500" />
                          เปรียบเทียบสต๊อกรายศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuLabel className="text-xs text-slate-400 font-bold px-3 py-1">รายงานสรุปผล</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/stock-report')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Package className="mr-3 size-4 text-amber-500" />
                          รายงานปัจจัยส่วนกลาง
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/evacuee-report')} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-50">
                          <Users className="mr-3 size-4 text-emerald-500" />
                          รายงานสถิติเครือข่าย
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </nav>
          </div>

          {/* Section 3: Profile */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Desktop User Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
                  <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name}&backgroundColor=f8fafc`} 
                    alt={user?.name}
                    className="size-8 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50"
                  />
                  <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 font-sans p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-3 pb-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-700 border border-slate-200 shadow-sm">
                            {roleDisplay[user?.role as keyof typeof roleDisplay] || user?.role}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-md p-2 hover:bg-slate-50 focus:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <UserIcon className="size-4" />
                        </div>
                        <span className="font-medium text-slate-700">บัญชีของฉัน</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="cursor-pointer rounded-md p-2 text-rose-600 hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                          <LogOut className="size-4" />
                        </div>
                        <span className="font-medium">ออกจากระบบ</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon" })}>
                  <Menu className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 font-sans">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-3 pb-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-700 border border-slate-200 shadow-sm">
                            {roleDisplay[user?.role as keyof typeof roleDisplay] || user?.role}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getHomePath())} className="cursor-pointer py-2">
                      <Home className="mr-2 size-4" />
                      หน้าแรก
                    </DropdownMenuItem>
                    {user?.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/users')} className="cursor-pointer py-2">
                          <Users className="mr-2 size-4" />
                          จัดการกำลังพล
                        </DropdownMenuItem>
                        
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">ระบบติดตามความปลอดภัย</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/admin/monitoring/audit-logs')} className="cursor-pointer py-2 ml-1">
                          <ShieldAlert className="mr-2 size-4 text-rose-500" />
                          Security Audit Logs
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'BRANCH' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/branch/location')} className="cursor-pointer py-2 text-rose-600">
                          <Crosshair className="mr-2 size-4" />
                          พิกัดจุดหลบภัย
                        </DropdownMenuItem>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">จัดการคลังปัจจัย</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock')} className="cursor-pointer py-2 ml-1">
                          <Package className="mr-2 size-4 text-amber-500" />
                          ภาพรวมสต๊อก
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/categories')} className="cursor-pointer py-2 ml-1">
                          <Tag className="mr-2 size-4 text-emerald-500" />
                          จัดการหมวดหมู่
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/products')} className="cursor-pointer py-2 ml-1">
                          <Box className="mr-2 size-4 text-blue-500" />
                          คลังสินค้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/stock/transactions')} className="cursor-pointer py-2 ml-1">
                          <ArrowDownUp className="mr-2 size-4 text-violet-500" />
                          ประวัติรับเข้า/เบิกออก
                        </DropdownMenuItem>
                        
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">ทรัพยากรมนุษย์</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees')} className="cursor-pointer py-2 ml-1">
                          <BarChart2 className="mr-2 size-4 text-emerald-500" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/capacity')} className="cursor-pointer py-2 ml-1">
                          <Tent className="mr-2 size-4 text-emerald-500" />
                          ความจุของศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/check-in')} className="cursor-pointer py-2 ml-1">
                          <UserPlus className="mr-2 size-4 text-emerald-500" />
                          ลงทะเบียนเข้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/check-out')} className="cursor-pointer py-2 ml-1">
                          <UserMinus className="mr-2 size-4 text-amber-500" />
                          ลงทะเบียนออก
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/list')} className="cursor-pointer py-2 ml-1">
                          <Users className="mr-2 size-4 text-blue-500" />
                          รายชื่อผู้ใช้บริการ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/evacuees/history')} className="cursor-pointer py-2 ml-1">
                          <History className="mr-2 size-4 text-slate-500" />
                          ประวัติการลงทะเบียน
                        </DropdownMenuItem>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">วิเคราะห์และรายงาน</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/survival')} className="cursor-pointer py-2 ml-1">
                          <Activity className="mr-2 size-4 text-rose-500" />
                          วิเคราะห์ความอยู่รอด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/stock-report')} className="cursor-pointer py-2 ml-1">
                          <Package className="mr-2 size-4 text-amber-500" />
                          รายงานปัจจัยยังชีพ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/branch/analytics/evacuee-report')} className="cursor-pointer py-2 ml-1">
                          <Users className="mr-2 size-4 text-emerald-500" />
                          รายงานยอดผู้พักพิง
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'CENTRAL' && (
                      <>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">ศูนย์บัญชาการ</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/locations/list')} className="cursor-pointer py-2 ml-1">
                          <LayoutList className="mr-2 size-4 text-indigo-500" />
                          ฐานข้อมูลศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/locations/map')} className="cursor-pointer py-2 ml-1">
                          <MapIcon className="mr-2 size-4 text-rose-500" />
                          เรดาร์ติดตาม
                        </DropdownMenuItem>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">ปัจจัยยังชีพส่วนกลาง</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/stock')} className="cursor-pointer py-2 ml-1">
                          <Package className="mr-2 size-4 text-amber-500" />
                          ภาพรวมสต๊อก
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/categories')} className="cursor-pointer py-2 ml-1">
                          <Tag className="mr-2 size-4 text-emerald-500" />
                          จัดการหมวดหมู่
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/products')} className="cursor-pointer py-2 ml-1">
                          <Box className="mr-2 size-4 text-blue-500" />
                          คลังสินค้า
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/stock/transactions')} className="cursor-pointer py-2 ml-1">
                          <ArrowDownUp className="mr-2 size-4 text-violet-500" />
                          ประวัติรับเข้า/เบิกออก
                        </DropdownMenuItem>

                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">ผู้พักพิง</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees')} className="cursor-pointer py-2 ml-1">
                          <BarChart2 className="mr-2 size-4 text-emerald-500" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees/branches')} className="cursor-pointer py-2 ml-1">
                          <Tent className="mr-2 size-4 text-emerald-500" />
                          สำรวจรายศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/evacuees/directory')} className="cursor-pointer py-2 ml-1">
                          <LayoutList className="mr-2 size-4 text-blue-500" />
                          รายชื่อผู้เข้ารับบริการ
                        </DropdownMenuItem>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">วิเคราะห์และรายงาน</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/survival')} className="cursor-pointer py-2 ml-1">
                          <Activity className="mr-2 size-4 text-rose-500" />
                          วิเคราะห์ความอยู่รอด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/branches-stock')} className="cursor-pointer py-2 ml-1">
                          <Crosshair className="mr-2 size-4 text-violet-500" />
                          เปรียบเทียบสต๊อกรายศูนย์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/stock-report')} className="cursor-pointer py-2 ml-1">
                          <Package className="mr-2 size-4 text-amber-500" />
                          รายงานปัจจัยส่วนกลาง
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/central/analytics/evacuee-report')} className="cursor-pointer py-2 ml-1">
                          <Users className="mr-2 size-4 text-emerald-500" />
                          รายงานสถิติเครือข่าย
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer py-2">
                      <UserIcon className="mr-2 size-4" />
                      โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2"
                    >
                      <LogOut className="mr-2 size-4" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl p-4 md:p-6">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-md p-0 overflow-hidden font-sans border-none rounded-2xl shadow-2xl">
          <div className="bg-rose-50 p-6 flex flex-col items-center justify-center border-b border-rose-100 relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
            <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-rose-100 mb-4 relative z-10">
              <LogOut className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl text-rose-900 font-bold relative z-10">ยืนยันการออกจากระบบ?</AlertDialogTitle>
          </div>
          <div className="p-6 bg-white">
            <AlertDialogDescription className="text-center text-slate-600 text-base leading-relaxed">
              คุณต้องการออกจากระบบบัญชี <b className="text-slate-900">{user?.name}</b> ใช่หรือไม่? <br />
              การดำเนินการนี้จะสิ้นสุดเซสชันการทำงานของคุณทันที
            </AlertDialogDescription>
            <AlertDialogFooter className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
              <AlertDialogCancel className="w-full sm:w-auto h-11 px-8 rounded-xl font-medium border-slate-200 text-slate-600 hover:bg-slate-50 mt-0">
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout} 
                className="w-full sm:w-auto h-11 px-8 rounded-xl font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
              >
                ออกจากระบบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
