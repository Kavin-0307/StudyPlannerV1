import { createFileRoute, redirect, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { authService } from '@/services/authService'
import { LayoutDashboard, Library, BookOpen, Calendar, Clock, CheckSquare, LogOut } from 'lucide-react'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate({ to: '/login' })
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { name: 'Subjects', icon: Library, to: '/subjects' },
    { name: 'Lectures', icon: BookOpen, to: '/lectures' },
    { name: 'Study Plan', icon: Calendar, to: '/study-plan' },
    { name: 'Revisions', icon: CheckSquare, to: '/revisions' },
    { name: 'Deadlines', icon: Clock, to: '/deadlines' },
  ]

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold text-primary">DocMind SOS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              activeProps={{
                className: 'bg-primary/10 text-primary hover:bg-primary/20',
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden text-sm">
              <p className="font-medium truncate">{user?.userName || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col ml-64 min-h-screen overflow-x-hidden">
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
