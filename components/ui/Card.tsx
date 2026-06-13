import { clsx } from 'clsx';

interface Props {
  className?: string;
  children: React.ReactNode;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ className, children, gradient, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'ava-card p-8',
        gradient && 'ava-card-gradient-border',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
