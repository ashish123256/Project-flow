import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Zap, LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import { cn, initials } from '@/utils/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { useLogout } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
];

interface NavbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Navbar({ title, actions }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user   = useAppSelector(selectCurrentUser);
  const logout = useLogout();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            className="md:hidden btn-ghost btn-sm p-1.5 rounded-lg"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            {title && <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>}
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-modal flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">
                  Project<span className="text-brand-600">Flow</span>
                </span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="btn-ghost btn-sm p-1.5 rounded-lg text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-4 w-4', isActive ? 'text-brand-600' : 'text-gray-400')} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="px-3 pb-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-700">{initials(user?.name ?? 'U')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
