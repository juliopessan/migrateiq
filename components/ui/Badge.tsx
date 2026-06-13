import { clsx } from 'clsx';

type Variant = 'orange' | 'success' | 'warning' | 'error' | 'info' | 'grey' | 'outline';

const variants: Record<Variant, string> = {
  orange:  'bg-ava-orange text-white',
  success: 'bg-ava-success text-white',
  warning: 'bg-ava-luminous text-ava-grey-80',
  error:   'bg-ava-thermal text-white',
  info:    'bg-ava-info text-white',
  grey:    'bg-ava-grey-10 text-ava-grey-80',
  outline: 'bg-transparent text-ava-orange border border-ava-orange',
};

export function Badge({ variant = 'orange', className, children }: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx(
      'inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest rounded-ava-sm',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
