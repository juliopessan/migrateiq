'use client';
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-ava-orange text-white hover:bg-ava-dark-orange shadow-ava-brand',
  secondary: 'bg-transparent text-ava-grey-80 border-2 border-ava-grey-80 hover:bg-ava-grey-80 hover:text-white',
  ghost:     'bg-transparent text-white border-2 border-white hover:bg-white hover:text-ava-orange',
  gradient:  'bg-ava-master text-white hover:opacity-90 shadow-ava-brand',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-9 py-4 text-base',
};

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-ava-sm',
        'transition-all duration-200 cursor-pointer select-none tracking-wide',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
