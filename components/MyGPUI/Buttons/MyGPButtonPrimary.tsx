import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MyGPButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

/* Enterprise primary button: solid color, accessible focus ring, subtle motion */
export const MyGPButtonPrimary = React.forwardRef<HTMLButtonElement, MyGPButtonPrimaryProps>(
  ({ className, loading, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        type="button"
        aria-busy={loading ? 'true' : 'false'}
        className={cn(
          'cursor-pointer group relative inline-flex items-center justify-center',
          'font-semibold text-white',
          // solid brand background; adjust to your palette/tokens
          'bg-blue-600 hover:bg-blue-700',
          // focus ring for accessibility
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
          // subtle motion; respects reduced motion
          'transition-[background,transform,box-shadow] duration-150 ease-out motion-reduce:transition-none',
          'active:scale-[0.98]',
          // disabled
          'disabled:opacity-60 disabled:cursor-not-allowed',
          // dark mode
          'dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:ring-blue-300',
          // size defaults; override via className
          'h-9 px-4 rounded-md',
          className
        )}
        {...props}
      >
        {/* spinner shown only when loading */}
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-white"
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
              fill="none"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              fill="currentColor"
            />
          </svg>
        )}

        <span className="flex items-center min-w-0 truncate">{children}</span>
      </Button>
    );
  }
);

MyGPButtonPrimary.displayName = 'MyGPButtonPrimary';
