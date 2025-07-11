'use client';

import { useState, useRef, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, CrossIcon } from './icons';
import { toast } from 'sonner';

interface PortfolioFormProps {
  onSuccess?: (portfolio: any) => void;
  onCancel?: () => void;
}

export function PortfolioForm({ onSuccess, onCancel }: PortfolioFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Add all images
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Portfolio created successfully!');
        
        // Reset form
        setName('');
        setDescription('');
        setImages([]);
        
        // Call success callback
        onSuccess?.(data.portfolio);
      } else {
        toast.error(data.error || 'Failed to create portfolio');
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="portfolio-name">Portfolio Name</Label>
        <Input
          id="portfolio-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter portfolio name"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-description">Description (Optional)</Label>
        <Textarea
          id="portfolio-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter portfolio description"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
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
            {images.length} image{images.length !== 1 ? 's' : ''} selected
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

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Creating...' : 'Create Portfolio'}
        </Button>
      </div>
    </form>
  );
} 