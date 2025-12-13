'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CreateFormContent } from './create-form-content';

interface CreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSheet({ open, onOpenChange }: CreateSheetProps) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSuccess = (cardId: string) => {
    onOpenChange(false);
    router.push(`/card/${cardId}`);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className={
          isDesktop
            ? 'p-0 flex flex-col overflow-hidden w-[900px] max-w-[70vw]'
            : 'h-[90vh] rounded-t-3xl p-0 flex flex-col overflow-hidden'
        }
      >
        <SheetHeader className="mb-4 px-6 pt-6 shrink-0">
          <SheetTitle className="text-xl font-semibold">
            Capture Today
          </SheetTitle>
          <p className="text-sm text-muted-foreground">Take a mindful moment to reflect</p>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <CreateFormContent onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
