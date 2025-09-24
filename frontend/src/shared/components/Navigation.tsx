import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

interface NavigationItem {
  path: string
  label: string
  icon?: React.ReactNode
}

interface NavigationProps {
  items: NavigationItem[]
  className?: string
  variant?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

const Navigation = ({ 
  items, 
  className, 
  variant = 'horizontal', 
  size = 'md' 
}: NavigationProps) => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const getNavLinkClass = (path: string) => {
    const baseClass = "transition-colors font-medium flex items-center"
    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base"
    }
    const variantClasses = variant === 'horizontal' ? "rounded-md" : "rounded-lg"
    
    return cn(
      baseClass,
      sizeClasses[size],
      variantClasses,
      isActive(path)
        ? "text-primary-600 bg-primary-50"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    )
  }

  const containerClass = cn(
    variant === 'horizontal' ? "flex space-x-2" : "flex flex-col space-y-1",
    className
  )

  return (
    <nav className={containerClass}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={getNavLinkClass(item.path)}
        >
          {item.icon && (
            <span className="mr-2">
              {item.icon}
            </span>
          )}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default Navigation