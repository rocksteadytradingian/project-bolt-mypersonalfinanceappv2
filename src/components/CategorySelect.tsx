import React, { useState } from 'react';
import { useCategoriesStore } from '../store/useCategoriesStore';
import { Button } from './ui/Button';

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, className, disabled = false }: CategorySelectProps) {
  const { categories, addCategory } = useCategoriesStore();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      onChange(newCategory.trim());
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  return (
    <div className={className}>
      {!showNewCategory ? (
        <div className="flex space-x-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={disabled}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {!disabled && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewCategory(true)}
            >
              Add New
            </Button>
          )}
        </div>
      ) : (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="New category name"
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleNewCategory}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowNewCategory(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}