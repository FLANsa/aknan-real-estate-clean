'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, GripVertical } from 'lucide-react';
import { uploadPropertyImage, deletePropertyImage } from '@/lib/firebase/storage';
import { optimizeImages, logger } from '@/lib/performance';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  propertyId?: string;
  maxImages?: number;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

export default function ImageUploader({
  images = [],
  onImagesChange,
  propertyId = 'temp',
  maxImages = 20,
  className = '',
}: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`لا يمكن إضافة أكثر من ${maxImages} صورة`);
      return;
    }

    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    // Upload files
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const uploadIndex = uploadProgress.length + i;

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => 
            prev.map((upload, index) => 
              index === uploadIndex 
                ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
                : upload
            )
          );
        }, 100);

        const url = await uploadPropertyImage(file, propertyId);
        
        clearInterval(progressInterval);
        
        setUploadProgress(prev => 
          prev.map((upload, index) => 
            index === uploadIndex 
              ? { ...upload, progress: 100, status: 'completed', url }
              : upload
          )
        );

        // Add to images after a short delay
        setTimeout(() => {
          onImagesChange([...images, url]);
          setUploadProgress(prev => prev.filter((_, index) => index !== uploadIndex));
        }, 500);

      } catch (error) {
        logger.error('Upload error:', error);
        setUploadProgress(prev => 
          prev.map((upload, index) => 
            index === uploadIndex 
              ? { ...upload, status: 'error' }
              : upload
          )
        );
      }
    }
  }, [images, onImagesChange, propertyId, maxImages, uploadProgress.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      await deletePropertyImage(imageUrl);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      } catch (error) {
        logger.error('Error removing image:', error);
      // Still remove from UI even if deletion fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragActive || isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'أفلت الصور هنا' : 'اسحب الصور هنا أو انقر للاختيار'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PNG، JPG، WebP حتى 10MB لكل صورة
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ({images.length}/{maxImages} صورة)
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((upload, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{upload.file.name}</span>
                <span className="text-muted-foreground">
                  {upload.status === 'uploading' && `${upload.progress}%`}
                  {upload.status === 'completed' && 'مكتمل'}
                  {upload.status === 'error' && 'خطأ'}
                </span>
              </div>
              <Progress 
                value={upload.progress} 
                className={upload.status === 'error' ? 'bg-destructive' : ''}
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => {
            const optimizedImage = optimizeImages.getOptimizedUrl(imageUrl, 200, 200);
            return (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={optimizedImage}
                      alt={`صورة العقار ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading={index < 4 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL={optimizeImages.getSimpleBlurDataURL()}
                    />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(imageUrl, index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-8 w-8 bg-black/50 rounded flex items-center justify-center cursor-move">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </Card>
            </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && uploadProgress.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لم يتم إضافة أي صور بعد</p>
          <p className="text-sm">أضف صور العقار لجذب المزيد من العملاء</p>
        </div>
      )}
    </div>
  );
}



