import * as React from 'react'
import { toast } from 'sonner'
import { CalendarDays, LogOut, Phone, Plus, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PaymentKind, PaymentMode } from '@/lib/fixtures'
import { fmtDate, inr, stayBill, useLodge } from '@/lib/lodge-store'
import { cn } from '@/lib/utils'

export function StaySheet({
  stayId,
  onOpenChange,
}: {
  stayId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const lodge = useLodge()
  const stay = lodge.stays.find((s) => s.id === stayId)
  const guest = stay && lodge.guests.find((g) => g.id === stay.guestId)
  const unit = stay && lodge.units.find((u) => u.id === stay.unitId)

  return (
    <Sheet open={!!stay} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto gap-0">
        {stay && guest && unit && (
          <StayDetail
            stay={stay}
            guest={guest}
            unitLabel={unit.kind === 'room' ? `Room ${unit.label}` : `Hall · ${unit.label}`}
            unitType={unit.type}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function StayDetail({
  stay,
  guest,
  unitLabel,
  unitType,
}: {
  stay: ReturnType<typeof useLodge>['stays'][number]
  guest: ReturnType<typeof useLodge>['guests'][number]
  unitLabel: string
  unitType: string
}) {
  const lodge = useLodge()
  const bill = stayBill(stay, lodge.payments)
  const [amount, setAmount] = React.useState('')
  const [mode, setMode] = React.useState<PaymentMode>('Cash')
  const [kind, setKind] = React.useState<PaymentKind>('Payment')

  const collect = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return
    lodge.addPayment({
      stayId: stay.id,
      amount: value,
      mode,
      kind,
      date: new Date().toISOString().slice(0, 10),
    })
    setAmount('')
    toast.success(`${inr(value)} ${kind === 'Refund' ? 'refunded' : 'received'} via ${mode}`)
  }

  return (
    <>
      <SheetHeader className="bg-primary text-primary-foreground p-6 pr-12">
        <div className="flex items-center gap-2">
          <Badge className="bg-accent text-accent-foreground">{unitLabel}</Badge>
          <span className="text-xs opacity-75">{unitType}</span>
          {stay.status === 'checked-out' && (
            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/40">
              Checked out
            </Badge>
          )}
        </div>
        <SheetTitle className="font-display text-2xl text-primary-foreground">
          {guest.name}
        </SheetTitle>
        <SheetDescription className="text-primary-foreground/75 flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <Phone className="size-3.5" /> {guest.phone}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3.5" /> {guest.docType} · {guest.docNumber}
          </span>
        </SheetDescription>
      </SheetHeader>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Info label="Check-in" value={fmtDate(stay.checkIn)} />
          <Info label="Check-out" value={fmtDate(stay.actualCheckOut ?? stay.checkOut)} />
          <Info label="Guests" value={`${stay.persons} · ${stay.purpose}`} />
        </div>

        <p className="text-sm text-muted-foreground">{guest.address}</p>

        <section className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {bill.nights} night{bill.nights > 1 ? 's' : ''} × {inr(stay.tariff)}
            </span>
            <span className="font-semibold text-foreground">{inr(bill.total)}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Money label="Advance" value={bill.advance} />
            <Money label="Total paid" value={bill.paid} tone="success" />
            <Money label="Remaining" value={bill.due} tone={bill.due > 0 ? 'danger' : 'success'} />
          </div>
        </section>

        <section>
          <h3 className="font-display font-bold text-lg mb-2">Payment history</h3>
          {bill.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ol className="divide-y rounded-xl border bg-card">
              {bill.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.kind}</p>
                    <p className="text-muted-foreground text-xs">
                      {fmtDate(p.date)} · {p.mode}
                      {p.note ? ` · ${p.note}` : ''}
                    </p>
                  </div>
                  <span className={cn('font-semibold', p.kind === 'Refund' ? 'text-destructive' : 'text-success')}>
                    {p.kind === 'Refund' ? '−' : '+'}
                    {inr(p.amount)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {stay.status === 'active' && (
          <form onSubmit={collect} className="rounded-xl border border-dashed p-4 space-y-3">
            <h3 className="font-display font-bold">Record a payment</h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <Input
                inputMode="numeric"
                placeholder={bill.due ? `Due ${inr(bill.due)}` : 'Amount ₹'}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                className="h-11"
              />
              <Select value={kind} onValueChange={(v) => setKind(v as PaymentKind)}>
                <SelectTrigger className="h-11 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['Payment', 'Advance', 'Refund'] as const).map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={(v) => setMode(v as PaymentMode)}>
                <SelectTrigger className="h-11 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['Cash', 'UPI', 'Card'] as const).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-11 flex-1">
                <Plus /> Add payment
              </Button>
              {bill.due > 0 && (
                <Button type="button" variant="outline" className="h-11" onClick={() => setAmount(String(bill.due))}>
                  Fill due
                </Button>
              )}
            </div>
          </form>
        )}

        {guest.signature && (
          <section>
            <h3 className="font-display font-bold text-lg mb-2">Guest signature</h3>
            <img src={guest.signature} alt="Guest signature" className="h-28 rounded-xl border bg-card p-2" />
          </section>
        )}

        {guest.photos.length > 0 && (
          <section>
            <h3 className="font-display font-bold text-lg mb-2">Documents</h3>
            <div className="grid grid-cols-4 gap-2">
              {guest.photos.map((src, i) => (
                <img key={i} src={src} alt={`Document ${i + 1}`} className="aspect-square object-cover rounded-lg border" />
              ))}
            </div>
          </section>
        )}

        {stay.status === 'active' && (
          <Button
            variant={bill.due > 0 ? 'outline' : 'default'}
            className="w-full h-12"
            onClick={() => {
              lodge.checkOut(stay.id)
              toast.success(`${guest.name} checked out of ${unitLabel}`)
            }}
          >
            <LogOut />
            {bill.due > 0 ? `Check out with ${inr(bill.due)} pending` : 'Check out'}
          </Button>
        )}
      </div>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function Money({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'danger' }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          'font-display text-xl font-bold',
          tone === 'success' && 'text-success',
          tone === 'danger' && 'text-destructive',
        )}
      >
        {inr(value)}
      </p>
    </div>
  )
}
