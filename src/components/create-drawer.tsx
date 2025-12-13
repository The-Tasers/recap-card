'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateDrawerProps {
  children: React.ReactNode;
  hasChanges?: boolean;
}

export function CreateDrawer({ children, hasChanges = false }: CreateDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  // Check if we're on create or edit page
  const isCreatePage = pathname === '/create';
  const isEditPage = pathname.startsWith('/card/') && pathname.endsWith('/edit');
  const shouldShowDrawer = isCreatePage || isEditPage;

  useEffect(() => {
    setIsOpen(shouldShowDrawer);
  }, [shouldShowDrawer]);

  const handleClose = () => {
    if (hasChanges) {
      setPendingClose(true);
      setShowConfirmDialog(true);
    } else {
      setIsOpen(false);
      router.back();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setIsOpen(false);
    router.back();
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
    setPendingClose(false);
  };

  if (!shouldShowDrawer) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobile: Full-screen drawer */}
      <div className="lg:hidden fixed inset-0 z-50 bg-neutral-50 dark:bg-neutral-900 overflow-auto">
        {children}
      </div>

      {/* Desktop: Regular page */}
      <div className="hidden lg:block">
        {children}
      </div>

      {/* Unsaved changes confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelClose}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleConfirmClose}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
