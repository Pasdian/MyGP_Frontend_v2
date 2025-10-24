import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MyGPButtonWarningProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * MyGPButtonWarning — Enterprise-style yellow warning button.
 * Supports loading state and full-width layout.
 */
export const MyGPButtonWarning = React.forwardRef<HTMLButtonElement, MyGPButtonWarningProps>(
  ({ className, loading, children, disabled, fullWidth = false, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const isTextOnly = typeof children === 'string';

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading ? 'true' : 'false'}
        className={cn(
          'cursor-pointer w-[120px] group relative inline-flex items-center justify-center font-semibold text-white',
          'h-9 px-4 rounded-md',
          fullWidth && 'w-full',
          'bg-yellow-400 hover:bg-yellow-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2',
          'transition-[background,transform,box-shadow] duration-150 ease-out motion-reduce:transition-none',
          'active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:focus-visible:ring-yellow-300',
          className
        )}
        {...props}
      >
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

        {isTextOnly ? (
          <span className="min-w-0 truncate">{children}</span>
        ) : (
          // allow complex child layouts (like grid with icons)
          <div className="flex items-center gap-1">{children}</div>
        )}
      </Button>
    );
  }
);

MyGPButtonWarning.displayName = 'MyGPButtonWarning';
