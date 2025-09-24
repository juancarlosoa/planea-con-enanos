import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Menu, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface HeaderProps {
  className?: string
}

const Header = ({ className }: HeaderProps) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors"
    return isActive(path)
      ? `${baseClass} text-primary-600 bg-primary-50`
      : `${baseClass} text-gray-500 hover:text-gray-900 hover:bg-gray-100`
  }

  const mobileNavLinkClass = (path: string) => {
    const baseClass = "block px-3 py-2 rounded-md text-base font-medium transition-colors"
    return isActive(path)
      ? `${baseClass} text-primary-600 bg-primary-50`
      : `${baseClass} text-gray-500 hover:text-gray-900 hover:bg-gray-100`
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={cn("bg-white shadow-sm border-b sticky top-0 z-50", className)}>
      <div className="container-app">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <MapPin className="h-8 w-8 text-primary-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              Escape Room Planner
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <Link to="/" className={navLinkClass('/')}>
              Explorar
            </Link>
            <Link to="/planner" className={navLinkClass('/planner')}>
              Planificar Ruta
            </Link>
            <Link to="/planner-demo" className={navLinkClass('/planner-demo')}>
              Demo Store
            </Link>
            <Link to="/plans" className={navLinkClass('/plans')}>
              Mis Planes
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-500 hover:text-gray-900 p-2 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
          isMobileMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="py-4 space-y-1 border-t">
            <Link 
              to="/" 
              className={mobileNavLinkClass('/')}
              onClick={closeMobileMenu}
            >
              Explorar
            </Link>
            <Link 
              to="/planner" 
              className={mobileNavLinkClass('/planner')}
              onClick={closeMobileMenu}
            >
              Planificar Ruta
            </Link>
            <Link 
              to="/planner-demo" 
              className={mobileNavLinkClass('/planner-demo')}
              onClick={closeMobileMenu}
            >
              Demo Store
            </Link>
            <Link 
              to="/plans" 
              className={mobileNavLinkClass('/plans')}
              onClick={closeMobileMenu}
            >
              Mis Planes
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  )
}

export default Header