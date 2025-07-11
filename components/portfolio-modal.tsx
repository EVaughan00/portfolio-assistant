'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { PortfolioForm } from './portfolio-form';

interface PortfolioModalProps {
  onSuccess?: (portfolio: any) => void;
}

export function PortfolioModal({ onSuccess }: PortfolioModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (portfolio: any) => {
    setIsOpen(false);
    onSuccess?.(portfolio);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="p-2 h-fit">
          <PlusIcon size={16} />
          <span className="md:sr-only">New Portfolio</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Portfolio</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new portfolio with a name, description, and images to showcase your work.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <PortfolioForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </AlertDialogContent>
    </AlertDialog>
  );
} 