import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPassword: string;
}

export function PasswordResetDialog({ open, onOpenChange, newPassword }: PasswordResetDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setCopied(false);
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>รีเซ็ตรหัสผ่านสำเร็จ</DialogTitle>
          <DialogDescription>
            นี่คือรหัสผ่านใหม่ที่ระบบสร้างขึ้นอัตโนมัติ กรุณาคัดลอกและส่งให้ผู้ใช้ทันที (รหัสผ่านนี้จะไม่แสดงอีก)
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <Input
            readOnly
            value={newPassword}
            className="font-mono text-lg text-center font-bold tracking-widest bg-muted/50"
          />
          <Button type="button" size="icon" onClick={handleCopy} variant="outline">
            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
