import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, ArrowRight, UserCog, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('กรุณาระบุอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'CENTRAL') navigate('/central');
      else navigate('/branch');
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-svh items-center justify-center overflow-hidden bg-slate-50 p-4 font-sans selection:bg-rose-500/20">
      {/* Vibrant Blurred Background Blobs */}
      <div className="absolute -top-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-rose-500/10 mix-blend-multiply blur-[80px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-blue-500/10 mix-blend-multiply blur-[80px]" />
      <div className="absolute top-[20%] left-[60%] h-[30vw] w-[30vw] rounded-full bg-cyan-400/10 mix-blend-multiply blur-[80px]" />

      <Card className="z-10 w-full max-w-md overflow-hidden border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl relative">
        <CardHeader className="space-y-3 pt-10 pb-6 text-center">
          <div className="space-y-2 pb-2">
            <CardTitle className="text-3xl font-black tracking-tighter text-slate-900">
              SSK<span className="font-light text-slate-400 ml-1.5">Protection Command</span>
            </CardTitle>
            <CardDescription className="text-sm font-medium tracking-wide text-slate-500">
              ระบบบัญชาการศูนย์พักพิงพิทักษ์ภัย (Secure Access)
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                อีเมล
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@ssk-phithak.go.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white px-4 text-base text-slate-900 transition-all hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  รหัสผ่าน
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPwd(true)}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white px-4 text-base text-slate-900 transition-all hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-slate-200"
              />
            </div>

            {error && (
              <div className="flex animate-in fade-in slide-in-from-top-2 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-400">
                <AlertTriangle className="size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="group mt-4 h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-base font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98] border-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  กำลังตรวจสอบ...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  เข้าสู่ระบบ
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-slate-200/50 bg-slate-50/80 py-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
            ระบบความปลอดภัยขั้นสูง (ZERO-TRUST SECURITY)
          </p>
        </CardFooter>
      </Card>

      {/* Back Button Below Card */}
      <div className="z-10 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="rounded-full bg-white/60 backdrop-blur-md border-slate-200/60 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm hover:shadow-md transition-all px-6 h-11 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-slate-400" />
          กลับสู่หน้าสำหรับประชาชน
        </Button>
      </div>

      {/* Forgot Password Dialog */}
      <AlertDialog open={showForgotPwd} onOpenChange={setShowForgotPwd}>
        <AlertDialogContent className="overflow-hidden p-0 font-sans sm:max-w-md border-slate-200/60 shadow-2xl rounded-2xl">
          {/* Decorative Top Banner */}
          <div className="relative h-24 w-full bg-slate-50 border-b border-slate-200">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-8 ring-slate-100 border border-slate-200">
                <UserCog className="size-8 text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-8">
            <AlertDialogHeader className="space-y-3 text-center">
              <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                ลืมรหัสผ่านใช่หรือไม่?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                ตามนโยบาย <span className="text-rose-600 font-bold">ZERO-TRUST SECURITY</span><br />
                ผู้ใช้ไม่สามารถรีเซ็ตรหัสผ่านได้ด้วยตนเอง
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-6 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-center text-sm text-slate-700">
              กรุณาติดต่อ <b className="text-rose-700">ผู้บัญชาการสูงสุด (Admin)</b> ของหน่วยงานคุณ เพื่อทำการสร้างรหัสผ่านใหม่ที่ปลอดภัยให้แก่คุณ<br />
            </div>
            
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction 
                onClick={() => setShowForgotPwd(false)} 
                className="w-full sm:w-2/3 rounded-xl h-11 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                รับทราบ และปิดหน้าต่าง
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
