'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productsApi } from '@/lib/api';

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  certifications: string;
  description: string;
  imageUrl?: string; // Derived from cloud upload
}

interface ProductFormProps {
  initialData?: ProductFormData;
  categories: string[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isEditing = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: initialData || {
      name: '',
      category: categories[0] || '',
      price: 0,
      unit: 'kg',
      quantity: 0,
      certifications: 'Organic',
      description: '',
      imageUrl: '',
    },
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(initialData?.imageUrl || '');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = (await productsApi.uploadImage(file)).data;
      setPreviewImage(data.url);
      setValue('imageUrl', data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const submitWrapper = async (data: ProductFormData) => {
    try {
      await onSubmit({ ...data, imageUrl: previewImage });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitWrapper)} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Name</span>
        <input
          className={`input mt-1 ${errors.name ? 'border-red-500' : ''}`}
          {...register('name', { required: 'Product name is required' })}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Category</span>
          <select className="input mt-1" {...register('category')}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {!categories.includes(initialData?.category || '') && initialData?.category && (
              <option value={initialData.category}>{initialData.category}</option>
            )}
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Unit</span>
          <input className="input mt-1" {...register('unit', { required: true })} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price (USD)</span>
          <input
            type="number"
            step="0.01"
            className="input mt-1"
            {...register('price', { valueAsNumber: true, min: 0.01, required: true })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quantity</span>
          <input
            type="number"
            className="input mt-1"
            {...register('quantity', { valueAsNumber: true, min: 1, required: true })}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Image Upload</span>
        <input
          type="file"
          accept="image/*"
          className="input mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/50 dark:file:text-primary-300"
          onChange={handleImageUpload}
          disabled={uploadingImage}
        />
        {uploadingImage && <p className="text-xs text-primary-600 mt-1">Uploading to Cloudinary...</p>}
        {previewImage && (
          <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Certifications (comma separated)</span>
        <input className="input mt-1" {...register('certifications')} />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Description</span>
        <textarea className="input mt-1" rows={3} {...register('description')} />
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isSubmitting || uploadingImage}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" className="btn btn-outline flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
