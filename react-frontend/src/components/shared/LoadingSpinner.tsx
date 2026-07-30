import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
}
