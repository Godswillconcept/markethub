import { cn } from '../../lib/utils.js';

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className 
}) {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  const variants = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    light: 'text-white',
    dark: 'text-gray-900',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
