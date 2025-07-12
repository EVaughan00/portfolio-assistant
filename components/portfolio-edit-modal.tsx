'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PaperclipIcon, CrossIcon, PencilEditIcon } from './icons';
import { toast } from 'sonner';
import type { Portfolio } from '@/lib/types';

interface PortfolioEditModalProps {
  portfolio: Portfolio;
  onSuccess?: (portfolio: Portfolio) => void;
  trigger?: React.ReactNode;
}

interface ExistingImage {
  id: string;
  imageUrl: string;
  imageName: string;
  contentType: string;
  createdAt: Date;
}

export function PortfolioEditModal({ portfolio, onSuccess, trigger }: PortfolioEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(portfolio.name);
  const [description, setDescription] = useState(portfolio.description || '');
  const [systemPrompt, setSystemPrompt] = useState(portfolio.systemPrompt || '');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing images when modal opens
  const fetchExistingImages = useCallback(async () => {
    if (!isOpen) return;
    
    setIsLoadingImages(true);
    try {
      const response = await fetch(`/api/portfolio/images?portfolioId=${portfolio.id}`);
      if (response.ok) {
        const data = await response.json();
        setExistingImages(data.images || []);
      } else {
        console.error('Failed to fetch portfolio images');
      }
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  }, [isOpen, portfolio.id]);

  // Fetch images when modal opens
  useEffect(() => {
    fetchExistingImages();
  }, [isOpen, fetchExistingImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate image files
    const validImages = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    // Prevent duplicate files
    const newImages = validImages.filter(newFile => 
      !images.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    if (newImages.length !== validImages.length) {
      toast.error('Some images were already selected');
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId: string, imageName: string) => {
    if (!confirm(`Are you sure you want to delete "${imageName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Image "${imageName}" deleted successfully!`);
        // Remove the image from local state
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        toast.error(data.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!name.trim()) {
      toast.error('Portfolio name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      if (systemPrompt.trim()) {
        formData.append('systemPrompt', systemPrompt.trim());
      }
      
      // Add all images
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`/api/portfolio?id=${portfolio.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Portfolio updated successfully!');
        
        // Reset form to current values
        setName(data.portfolio.name);
        setDescription(data.portfolio.description || '');
        setSystemPrompt(data.portfolio.systemPrompt || '');
        setImages([]);
        
        // Close modal and call success callback
        setIsOpen(false);
        onSuccess?.(data.portfolio);
      } else {
        toast.error(data.error || 'Failed to update portfolio');
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(portfolio.name);
    setDescription(portfolio.description || '');
    setSystemPrompt(portfolio.systemPrompt || '');
    setImages([]);
    setExistingImages([]);
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="p-2 h-fit">
            <PencilEditIcon size={16} />
            <span className="md:sr-only">Edit Portfolio</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Portfolio</AlertDialogTitle>
          <AlertDialogDescription>
            Update your portfolio details, description, and images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-portfolio-name">Portfolio Name</Label>
            <Input
              id="edit-portfolio-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter portfolio name"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-portfolio-description">Description (Optional)</Label>
            <Textarea
              id="edit-portfolio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief public description of your project"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-portfolio-system-prompt">AI Context (Optional)</Label>
            <Textarea
              id="edit-portfolio-system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Additional context for AI about your project (not visible to users)"
              rows={4}
            />
          </div>

          {/* Existing Images Section */}
          {(existingImages.length > 0 || isLoadingImages) && (
            <div className="space-y-2">
              <Label>Existing Images</Label>
              {isLoadingImages ? (
                <div className="text-sm text-muted-foreground">Loading existing images...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingImages.map((existingImage) => (
                    <div key={existingImage.id} className="relative group">
                      <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                        <Image
                          src={existingImage.imageUrl}
                          alt={existingImage.imageName}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(existingImage.id, existingImage.imageName)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CrossIcon size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {existingImage.imageName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Add New Images</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <PaperclipIcon size={16} />
                Add Images
              </Button>
              <span className="text-sm text-muted-foreground">
                {images.length} new image{images.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <CrossIcon size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Updating...' : 'Update Portfolio'}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
} 