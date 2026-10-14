import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/app-shell'
import { StaySheet } from '@/components/stay-sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fmtDate, inr, stayBill, useLodge } from '@/lib/lodge-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/payments')({
  head: () => ({ meta: [{ title: 'Payments · Yashoda Lodge Mohol' }] }),
  component: Payments,
})

function Payments() {
  const lodge = useLodge()
  const [openStay, setOpenStay] = React.useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const signed = (p: (typeof lodge.payments)[number]) => (p.kind === 'Refund' ? -p.amount : p.amount)
  const todays = lodge.payments.filter((p) => p.date === today)
  const byMode = (['Cash', 'UPI', 'Card'] as const).map((mode) => ({
    mode,
    amount: todays.filter((p) => p.mode === mode).reduce((s, p) => s + signed(p), 0),
  }))
  const pending = lodge.stays
    .filter((s) => s.status === 'active')
    .map((stay) => ({
      stay,
      guest: lodge.guests.find((g) => g.id === stay.guestId)!,
      unit: lodge.units.find((u) => u.id === stay.unitId)!,
      bill: stayBill(stay, lodge.payments),
    }))
    .filter((r) => r.bill.due > 0)
    .sort((a, b) => b.bill.due - a.bill.due)

  const ledger = [...lodge.payments].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-content p-5 md:p-8">
      <PageHeader eyebrow="Accounts" title="Payments & dues" />

      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr] mb-8">
        <section className="rounded-2xl bg-primary text-primary-foreground p-5">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">Collected today</p>
          <p className="font-display text-4xl font-extrabold mt-1">
            {inr(todays.reduce((s, p) => s + signed(p), 0))}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {byMode.map(({ mode, amount }) => (
              <div key={mode} className="rounded-xl bg-primary-foreground/10 px-3 py-2">
                <p className="text-xs opacity-70">{mode}</p>
                <p className="font-semibold">{inr(amount)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Remaining dues</h2>
            <span className="font-display text-xl font-bold text-destructive">
              {inr(pending.reduce((s, r) => s + r.bill.due, 0))}
            </span>
          </div>
          <ul className="mt-3 divide-y">
            {pending.length === 0 && <li className="py-3 text-sm text-muted-foreground">All in-house guests are paid up.</li>}
            {pending.map(({ stay, guest, unit, bill }) => (
              <li key={stay.id}>
                <button onClick={() => setOpenStay(stay.id)} className="w-full flex items-center justify-between py-2.5 text-left">
                  <span>
                    <span className="font-medium">{guest.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{unit.kind === 'room' ? `Room ${unit.label}` : unit.label}</span>
                  </span>
                  <span className="font-semibold text-destructive">{inr(bill.due)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <h2 className="font-display text-xl font-bold mb-3">Payment history</h2>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Date</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right pr-4">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((p) => {
              const stay = lodge.stays.find((s) => s.id === p.stayId)!
              const guest = lodge.guests.find((g) => g.id === stay.guestId)!
              const unit = lodge.units.find((u) => u.id === stay.unitId)!
              return (
                <TableRow key={p.id} className="cursor-pointer h-12" onClick={() => setOpenStay(stay.id)}>
                  <TableCell className="pl-4">{fmtDate(p.date)}</TableCell>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{unit.label}</TableCell>
                  <TableCell>{p.kind}</TableCell>
                  <TableCell>{p.mode}</TableCell>
                  <TableCell className={cn('text-right pr-4 font-semibold', p.kind === 'Refund' ? 'text-destructive' : 'text-success')}>
                    {p.kind === 'Refund' ? '−' : '+'}
                    {inr(p.amount)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <StaySheet stayId={openStay} onOpenChange={(o) => !o && setOpenStay(null)} />
    </div>
  )
}
