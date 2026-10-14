import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { BedSingle, DoorOpen, IndianRupee, LogOut, UserPlus } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { StaySheet } from '@/components/stay-sheet'
import { Button } from '@/components/ui/button'
import { FLOORS, LODGE, type Unit } from '@/lib/fixtures'
import { inr, stayBill, useLodge } from '@/lib/lodge-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: RoomBoard,
})

function RoomBoard() {
  const lodge = useLodge()
  const navigate = useNavigate()
  const [openStay, setOpenStay] = React.useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const active = lodge.stays.filter((s) => s.status === 'active')
  const byUnit = new Map(active.map((s) => [s.unitId, s]))
  const dues = active.reduce((sum, s) => sum + stayBill(s, lodge.payments).due, 0)
  const leavingToday = active.filter((s) => s.checkOut <= today).length

  const stats = [
    { label: 'Occupied', value: `${active.length}/${lodge.units.length}`, icon: BedSingle },
    { label: 'Vacant', value: String(lodge.units.length - active.length), icon: DoorOpen },
    { label: 'Check-outs due', value: String(leavingToday), icon: LogOut },
    { label: 'Pending dues', value: inr(dues), icon: IndianRupee },
  ]

  const onUnit = (unit: Unit) => {
    const stay = byUnit.get(unit.id)
    if (stay) setOpenStay(stay.id)
    else navigate({ to: '/check-in', search: { unit: unit.id } })
  }

  return (
    <div className="mx-auto max-w-content p-5 md:p-8">
      <PageHeader
        eyebrow={`${LODGE.name} · ${LODGE.town}`}
        title={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      >
        <Button asChild size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/check-in">
            <UserPlus /> New check-in
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-card border p-4 flex items-center gap-3">
            <span className="grid place-items-center size-11 rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-display text-2xl font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
        <Legend className="bg-card border-2 border-success/60" label="Vacant — tap to check in" />
        <Legend className="bg-primary" label="Occupied" />
        <Legend className="bg-warning" label="Check-out today" />
        <Legend className="bg-destructive" label="Dues pending" dot />
      </div>

      <div className="space-y-8">
        {FLOORS.map(({ floor, title, subtitle }) => {
          const units = lodge.units.filter((u) => u.floor === floor)
          const used = units.filter((u) => byUnit.has(u.id)).length
          return (
            <section key={floor}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-xl font-bold">
                  {title} <span className="text-muted-foreground font-normal text-sm ml-2">{subtitle}</span>
                </h2>
                <span className="text-sm text-muted-foreground">{used} of {units.length} occupied</span>
              </div>
              <div
                className={cn(
                  'grid gap-3',
                  floor === 3 ? 'grid-cols-5' : 'grid-cols-4 sm:grid-cols-7',
                )}
              >
                {units.map((unit) => {
                  const stay = byUnit.get(unit.id)
                  const guest = stay && lodge.guests.find((g) => g.id === stay.guestId)
                  const bill = stay && stayBill(stay, lodge.payments)
                  const leaving = stay && stay.checkOut <= today
                  return (
                    <button
                      key={unit.id}
                      onClick={() => onUnit(unit)}
                      className={cn(
                        'relative text-left rounded-2xl p-3 min-h-28 flex flex-col justify-between transition active:scale-[0.97]',
                        !stay && 'bg-card border-2 border-dashed border-success/50 hover:border-success hover:bg-success/5',
                        stay && !leaving && 'bg-primary text-primary-foreground shadow-md shadow-primary/20',
                        leaving && 'bg-warning text-accent-foreground shadow-md shadow-warning/30',
                      )}
                    >
                      {bill && bill.due > 0 && (
                        <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-destructive ring-2 ring-card" />
                      )}
                      <div>
                        <p className="font-display text-2xl font-extrabold leading-none">
                          {unit.kind === 'room' ? unit.label : unit.label.replace('Bed ', 'B')}
                        </p>
                        <p className={cn('text-[11px] mt-1', stay ? 'opacity-75' : 'text-muted-foreground')}>
                          {unit.type}
                        </p>
                      </div>
                      {guest ? (
                        <div className="text-xs">
                          <p className="font-semibold truncate">{guest.name.split(' ')[0]}</p>
                          <p className="opacity-75">{bill!.due > 0 ? `${inr(bill!.due)} due` : 'Paid'}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-success">{inr(unit.rate)}/night</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <StaySheet stayId={openStay} onOpenChange={(o) => !o && setOpenStay(null)} />
    </div>
  )
}

function Legend({ className, label, dot }: { className: string; label: string; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn(dot ? 'size-2.5 rounded-full' : 'size-4 rounded-md', className)} />
      {label}
    </span>
  )
}
