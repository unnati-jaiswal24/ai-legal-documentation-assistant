import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', className = '', onClick, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none';
  
  const variants = {
    primary: 'bg-brand-indigo hover:bg-indigo-600 text-white shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/40',
    secondary: 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white',
    gradient: 'bg-gradient-to-r from-brand-indigo via-brand-pink to-brand-orange text-white shadow-lg hover:opacity-95',
    outline: 'border-2 border-slate-300 dark:border-slate-700 hover:border-brand-indigo text-slate-800 dark:text-slate-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}