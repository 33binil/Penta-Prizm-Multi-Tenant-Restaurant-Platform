import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg tracking-tight';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-2xs',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 shadow-2xs',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200/70',
    danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 active:bg-rose-100/70',
    brand: 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
