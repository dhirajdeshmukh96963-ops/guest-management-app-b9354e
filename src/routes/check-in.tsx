import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CheckCircle2, Sparkles } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { DocumentCapture } from '@/components/document-capture'
import { SignaturePad } from '@/components/signature-pad'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FLOORS, SAMPLE_SCAN, type DocType, type Guest, type PaymentMode } from '@/lib/fixtures'
import { inr, nightsBetween, useLodge } from '@/lib/lodge-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/check-in')({
  validateSearch: (search: Record<string, unknown>): { unit?: string } => ({
    unit: typeof search.unit === 'string' ? search.unit : undefined,
  }),
  head: () => ({ meta: [{ title: 'New check-in · Yashoda Lodge Mohol' }] }),
  component: CheckIn,
})

type GuestFields = Pick<Guest, 'name' | 'dob' | 'gender' | 'phone' | 'address' | 'docType' | 'docNumber'>

const DOC_TYPES: DocType[] = ['Aadhaar', 'PAN', 'Driving Licence', 'Voter ID', 'Passport']
const PURPOSES = ['Business', 'Pilgrimage', 'Family visit', 'Wedding', 'Work', 'Exam', 'Tourism', 'Other']

const isoDay = (offset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function CheckIn() {
  const lodge = useLodge()
  const navigate = useNavigate()
  const { unit: presetUnit } = Route.useSearch()

  const occupied = new Set(lodge.stays.filter((s) => s.status === 'active').map((s) => s.unitId))
  const vacant = lodge.units.filter((u) => !occupied.has(u.id))

  const [photos, setPhotos] = React.useState<string[]>([])
  const [scanning, setScanning] = React.useState<number | null>(null)
  const [filled, setFilled] = React.useState<Set<keyof GuestFields>>(new Set())
  const [guest, setGuest] = React.useState<GuestFields>({
    name: '', dob: '', gender: 'Male', phone: '', address: '', docType: 'Aadhaar', docNumber: '',
  })
  const [unitId, setUnitId] = React.useState(
    presetUnit && !occupied.has(presetUnit) ? presetUnit : '',
  )
  const unit = lodge.units.find((u) => u.id === unitId)
  const [checkIn, setCheckIn] = React.useState(isoDay())
  const [checkOut, setCheckOut] = React.useState(isoDay(1))
  const [persons, setPersons] = React.useState('1')
  const [purpose, setPurpose] = React.useState('Business')
  const [tariff, setTariff] = React.useState(unit ? String(unit.rate) : '')
  const [advance, setAdvance] = React.useState('')
  const [mode, setMode] = React.useState<PaymentMode>('Cash')
  const [signature, setSignature] = React.useState<string>()
  const [consent, setConsent] = React.useState(false)

  const nights = nightsBetween(checkIn, checkOut)
  const total = nights * (Number(tariff) || 0)
  const remaining = Math.max(0, total - (Number(advance) || 0))

  const set = <K extends keyof GuestFields>(key: K, value: GuestFields[K]) => {
    setGuest((g) => ({ ...g, [key]: value }))
    setFilled((f) => {
      const next = new Set(f)
      next.delete(key)
      return next
    })
  }

  // Stand-in for the AI extraction call (PLAN.md, milestone 3).
  const scan = (index: number) => {
    setScanning(index)
    window.setTimeout(() => {
      setGuest((g) => ({ ...g, ...SAMPLE_SCAN }))
      setFilled(new Set(Object.keys(SAMPLE_SCAN) as (keyof GuestFields)[]))
      setScanning(null)
      toast.success('Details extracted from document', {
        description: 'Please check each highlighted field before saving.',
      })
    }, 1800)
  }

  const chooseUnit = (id: string) => {
    setUnitId(id)
    const u = lodge.units.find((x) => x.id === id)
    if (u) setTariff(String(u.rate))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const missing = [
      !guest.name && 'guest name',
      !guest.phone && 'mobile number',
      !guest.docNumber && 'ID number',
      !unitId && 'room or bed',
      !signature && 'signature',
      !consent && 'declaration',
    ].filter(Boolean)
    if (missing.length) {
      toast.error(`Please add: ${missing.join(', ')}`)
      return
    }
    lodge.checkIn({
      guest: { ...guest, photos, signature },
      stay: { unitId, checkIn, checkOut, persons: Number(persons) || 1, tariff: Number(tariff) || 0, purpose },
      advance: { amount: Number(advance) || 0, mode, kind: 'Advance', date: checkIn },
    })
    toast.success(`${guest.name} checked in to ${unit?.kind === 'room' ? `Room ${unit.label}` : unit?.label}`)
    navigate({ to: '/' })
  }

  const field = (key: keyof GuestFields) =>
    cn('h-11 transition-shadow', filled.has(key) && 'ring-2 ring-accent bg-accent/10')

  return (
    <form onSubmit={submit} className="mx-auto max-w-content p-5 md:p-8">
      <PageHeader eyebrow="Guest registration" title="New check-in">
        <Button type="submit" size="lg" className="h-12">
          <CheckCircle2 /> Save &amp; check in
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <Panel step="1" title="Scan ID document" hint="Aadhaar, PAN, licence, voter ID or passport · up to 4 photos">
            <DocumentCapture photos={photos} onPhotosChange={setPhotos} onScan={scan} scanningIndex={scanning} />
          </Panel>

          <Panel
            step="2"
            title="Guest details"
            hint={filled.size ? undefined : 'Fill in by hand, or scan a document to auto-fill'}
            badge={filled.size ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="size-3.5" /> Auto-filled · please verify
              </span>
            ) : undefined}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" className="sm:col-span-2">
                <Input className={field('name')} value={guest.name} onChange={(e) => set('name', e.target.value)} placeholder="As printed on ID" />
              </Field>
              <Field label="Date of birth">
                <Input type="date" className={field('dob')} value={guest.dob} onChange={(e) => set('dob', e.target.value)} />
              </Field>
              <Field label="Gender">
                <Select value={guest.gender} onValueChange={(v) => set('gender', v as Guest['gender'])}>
                  <SelectTrigger className={cn(field('gender'), 'w-full')}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Male', 'Female', 'Other'] as const).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="ID type">
                <Select value={guest.docType} onValueChange={(v) => set('docType', v as DocType)}>
                  <SelectTrigger className={cn(field('docType'), 'w-full')}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={guest.docType === 'Aadhaar' ? 'Aadhaar number' : 'ID number'}>
                <Input className={cn(field('docNumber'), 'tracking-wider')} value={guest.docNumber} onChange={(e) => set('docNumber', e.target.value)} placeholder={guest.docType === 'Aadhaar' ? '0000 0000 0000' : ''} />
              </Field>
              <Field label="Mobile number" className="sm:col-span-2">
                <Input type="tel" inputMode="tel" className={field('phone')} value={guest.phone} onChange={(e) => set('phone', e.target.value)} placeholder="10-digit mobile" />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Textarea rows={3} className={cn(field('address'), 'h-auto')} value={guest.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel step="3" title="Room & stay">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Room / bed" className="col-span-2">
                <Select value={unitId} onValueChange={chooseUnit}>
                  <SelectTrigger className="h-11 w-full"><SelectValue placeholder={`Choose from ${vacant.length} vacant`} /></SelectTrigger>
                  <SelectContent>
                    {FLOORS.map(({ floor, title }) => (
                      <SelectGroup key={floor}>
                        <SelectLabel>{title}</SelectLabel>
                        {vacant.filter((u) => u.floor === floor).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.kind === 'room' ? `Room ${u.label}` : u.label} · {u.type} · {inr(u.rate)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Check-in">
                <Input type="date" className="h-11" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </Field>
              <Field label="Expected check-out">
                <Input type="date" className="h-11" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </Field>
              <Field label="Persons">
                <Input inputMode="numeric" className="h-11" value={persons} onChange={(e) => setPersons(e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Purpose">
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel step="4" title="Payment">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tariff per night (₹)">
                <Input inputMode="numeric" className="h-11" value={tariff} onChange={(e) => setTariff(e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Advance received (₹)">
                <Input inputMode="numeric" className="h-11" value={advance} onChange={(e) => setAdvance(e.target.value.replace(/\D/g, ''))} placeholder="0" />
              </Field>
              <div className="col-span-2 flex gap-2">
                {(['Cash', 'UPI', 'Card'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      'flex-1 h-11 rounded-lg border text-sm font-medium transition',
                      mode === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <dl className="mt-4 rounded-xl bg-primary text-primary-foreground p-4 grid grid-cols-3 gap-2">
              <Sum label={`${nights} night${nights > 1 ? 's' : ''}`} value={inr(total)} />
              <Sum label="Advance" value={inr(Number(advance) || 0)} />
              <Sum label="Remaining" value={inr(remaining)} highlight />
            </dl>
          </Panel>

          <Panel step="5" title="Guest signature">
            <SignaturePad value={signature} onChange={setSignature} />
            <label className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
              I confirm the details above are correct and agree to the lodge rules of Yashoda Lodge, Mohol.
            </label>
          </Panel>

          <Button type="submit" size="lg" className="w-full h-14 text-base bg-accent text-accent-foreground hover:bg-accent/90">
            <CheckCircle2 /> Save &amp; check in
          </Button>
        </div>
      </div>
    </form>
  )
}

function Panel({
  step,
  title,
  hint,
  badge,
  children,
}: {
  step: string
  title: string
  hint?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="grid place-items-center size-8 rounded-full bg-secondary font-display font-bold text-primary">
          {step}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-bold leading-tight">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {badge}
      </div>
      {children}
    </section>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Sum({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider opacity-70">{label}</dt>
      <dd className={cn('font-display text-xl font-bold', highlight && 'text-accent')}>{value}</dd>
    </div>
  )
}
