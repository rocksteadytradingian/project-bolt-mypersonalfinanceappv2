import React from 'react';
import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow p-4 dark:text-gray-100 transition-colors duration-200',
      className
    )}>
      {children}
    </div>
  );
}
