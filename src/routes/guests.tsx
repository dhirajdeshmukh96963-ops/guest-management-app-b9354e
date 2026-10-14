import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { StaySheet } from '@/components/stay-sheet'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fmtDate, inr, stayBill, useLodge } from '@/lib/lodge-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/guests')({
  head: () => ({ meta: [{ title: 'Guest register · Yashoda Lodge Mohol' }] }),
  component: Guests,
})

function Guests() {
  const lodge = useLodge()
  const [query, setQuery] = React.useState('')
  const [tab, setTab] = React.useState<'active' | 'checked-out' | 'all'>('active')
  const [openStay, setOpenStay] = React.useState<string | null>(null)

  const rows = lodge.stays
    .map((stay) => ({
      stay,
      guest: lodge.guests.find((g) => g.id === stay.guestId)!,
      unit: lodge.units.find((u) => u.id === stay.unitId)!,
      bill: stayBill(stay, lodge.payments),
    }))
    .filter(({ stay }) => tab === 'all' || stay.status === tab)
    .filter(({ guest, unit }) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return [guest.name, guest.phone, guest.docNumber, unit.label].some((v) =>
        v.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, '')),
      )
    })
    .sort((a, b) => b.stay.checkIn.localeCompare(a.stay.checkIn))

  return (
    <div className="mx-auto max-w-content p-5 md:p-8">
      <PageHeader eyebrow="All stays" title="Guest register" />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, mobile, Aadhaar or room"
            className="h-11 pl-9 bg-card"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="h-11">
            <TabsTrigger value="active" className="px-4">In-house</TabsTrigger>
            <TabsTrigger value="checked-out" className="px-4">Checked out</TabsTrigger>
            <TabsTrigger value="all" className="px-4">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {rows.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">No guests match this search.</p>
        )}
        <ul className="divide-y">
          {rows.map(({ stay, guest, unit, bill }) => (
            <li key={stay.id}>
              <button
                onClick={() => setOpenStay(stay.id)}
                className="w-full grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1.4fr_1fr_auto] items-center gap-4 px-4 py-3.5 text-left hover:bg-muted/60 transition"
              >
                <span
                  className={cn(
                    'grid place-items-center size-12 rounded-xl font-display font-extrabold',
                    stay.status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {unit.kind === 'room' ? unit.label : `B${unit.label.replace('Bed ', '')}`}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{guest.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {guest.phone} · {guest.docType} {guest.docNumber}
                  </p>
                </div>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  {fmtDate(stay.checkIn)} → {fmtDate(stay.actualCheckOut ?? stay.checkOut)}
                </p>
                <div className="text-right">
                  {bill.due > 0 ? (
                    <Badge variant="destructive">{inr(bill.due)} due</Badge>
                  ) : (
                    <Badge className="bg-success text-white">Paid</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{inr(bill.total)} total</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <StaySheet stayId={openStay} onOpenChange={(o) => !o && setOpenStay(null)} />
    </div>
  )
}
