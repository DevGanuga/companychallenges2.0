import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          // Variants
          {
            'bg-[var(--gradient-primary)] text-[var(--color-accent-fg)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:shadow-[var(--color-accent)]/20 hover:-translate-y-px focus-visible:ring-[var(--color-accent)]':
              variant === 'primary',
            'bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-sm)] focus-visible:ring-[var(--color-border)]':
              variant === 'secondary',
            'bg-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)] focus-visible:ring-[var(--color-border)]':
              variant === 'ghost',
            'bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-error)]/90 hover:shadow-[var(--shadow-md)] focus-visible:ring-[var(--color-error)]':
              variant === 'destructive',
          },
          // Sizes
          {
            'h-8 px-3 text-sm rounded-[var(--radius-md)]': size === 'sm',
            'h-10 px-4 text-sm rounded-[var(--radius-lg)]': size === 'md',
            'h-12 px-6 text-base rounded-[var(--radius-xl)]': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

