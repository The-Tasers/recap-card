'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EditFormContent } from './edit-form-content';

interface EditSheetProps {
  cardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSheet({ cardId, open, onOpenChange }: EditSheetProps) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSuccess = (id: string) => {
    onOpenChange(false);
    router.push(`/card/${id}`);
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
            Edit Recap
          </SheetTitle>
          <p className="text-sm text-muted-foreground">Update your thoughts</p>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <EditFormContent cardId={cardId} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
