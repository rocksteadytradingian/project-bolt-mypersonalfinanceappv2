import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div 
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg shadow p-4 dark:text-gray-100 transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
