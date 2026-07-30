import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center text-center gap-4 p-8 rounded-lg border border-border bg-card shadow-sm">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">404 - ไม่พบหน้าเว็บ</h1>
        <p className="text-muted-foreground">
          ขออภัย หน้าเว็บที่คุณกำลังพยายามเข้าถึงไม่มีอยู่หรือถูกย้ายไปแล้ว
        </p>
        <Button onClick={() => navigate('/')} className="mt-4 w-full">
          กลับสู่หน้าแรก
        </Button>
      </div>
    </div>
  );
}
