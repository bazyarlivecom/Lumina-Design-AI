import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`
        border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
        flex flex-col items-center justify-center min-h-[300px]
        ${isDragging ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent/50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ImageIcon className="text-gray-400 w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload your room photo</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        Drag and drop your image here, or click to browse. 
        Works best with well-lit, wide-angle photos.
      </p>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/*" 
        className="hidden" 
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        icon={<Upload size={18} />}
      >
        Select Image
      </Button>
    </div>
  );
};