import { cn } from '@/shared/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

const Badge = ({ children, variant = 'secondary', size = 'md', className }: BadgeProps) => {
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  }

  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge