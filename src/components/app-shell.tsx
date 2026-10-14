import { Link } from '@tanstack/react-router'
import { BedDouble, IndianRupee, LayoutGrid, UserPlus, Users } from 'lucide-react'

import { LODGE } from '@/lib/fixtures'

const NAV = [
  { to: '/', label: 'Rooms', icon: LayoutGrid },
  { to: '/check-in', label: 'Check-in', icon: UserPlus },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/payments', label: 'Payments', icon: IndianRupee },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-24 pb-20 md:pb-0">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-24 flex-col items-center bg-sidebar text-sidebar-foreground py-5 gap-6 z-30">
        <Link to="/" className="flex flex-col items-center gap-1" aria-label={LODGE.name}>
          <span className="grid place-items-center size-12 rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground font-display text-2xl font-extrabold">
            य
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">
            Mohol
          </span>
        </Link>
        <nav className="flex flex-col gap-2 w-full px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/' }}
              className="flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
            >
              <Icon className="size-6" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1 text-[10px] opacity-60">
          <BedDouble className="size-4" />
          24 units
        </div>
      </aside>

      <main className="paper-grain min-h-dvh">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-4 bg-sidebar text-sidebar-foreground pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/' }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-sidebar-foreground/70 data-[status=active]:text-sidebar-primary"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  )
}
