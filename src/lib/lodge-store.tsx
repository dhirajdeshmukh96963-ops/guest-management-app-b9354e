import * as React from 'react'

import {
  GUESTS,
  PAYMENTS,
  STAYS,
  UNITS,
  type Guest,
  type Payment,
  type Stay,
  type Unit,
} from '@/lib/fixtures'

interface LodgeState {
  units: Unit[]
  guests: Guest[]
  stays: Stay[]
  payments: Payment[]
}

interface CheckInInput {
  guest: Omit<Guest, 'id'>
  stay: Omit<Stay, 'id' | 'guestId' | 'status'>
  advance?: Omit<Payment, 'id' | 'stayId'>
}

interface LodgeContextValue extends LodgeState {
  checkIn: (input: CheckInInput) => Stay
  addPayment: (payment: Omit<Payment, 'id'>) => void
  checkOut: (stayId: string) => void
}

const LodgeContext = React.createContext<LodgeContextValue | null>(null)

const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function LodgeProvider({ children }: { children: React.ReactNode }) {
  
  // FIX: Read from local browser storage so check-ins and check-outs are remembered!
  const [state, setState] = React.useState<LodgeState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lodge-data')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Couldn't read saved data.")
        }
      }
    }
    return {
      units: UNITS,
      guests: GUESTS,
      stays: STAYS,
      payments: PAYMENTS,
    }
  })

  // FIX: Save data to browser automatically whenever a checkout or checkin happens
  React.useEffect(() => {
    localStorage.setItem('lodge-data', JSON.stringify(state))
  }, [state])

  const value = React.useMemo<LodgeContextValue>(
    () => ({
      ...state,
      checkIn: ({ guest, stay, advance }) => {
        const guestId = uid('g')
        const newStay: Stay = { ...stay, id: uid('s'), guestId, status: 'active' }
        setState((s) => ({
          ...s,
          guests: [...s.guests, { ...guest, id: guestId }],
          stays: [...s.stays, newStay],
          payments:
            advance && advance.amount > 0
              ? [...s.payments, { ...advance, id: uid('p'), stayId: newStay.id }]
              : s.payments,
        }))
        return newStay
      },
      addPayment: (payment) =>
        setState((s) => ({
          ...s,
          payments: [...s.payments, { ...payment, id: uid('p') }],
        })),
      checkOut: (stayId) =>
        setState((s) => ({
          ...s,
          stays: s.stays.map((st) =>
            st.id === stayId
              ? {
                  ...st,
                  status: 'checked-out',
                  actualCheckOut: new Date().toISOString().slice(0, 10),
                }
              : st,
          ),
        })),
    }),
    [state],
  )

  return <LodgeContext.Provider value={value}>{children}</LodgeContext.Provider>
}

export function useLodge() {
  const ctx = React.useContext(LodgeContext)
  if (!ctx) throw new Error('useLodge must be used inside LodgeProvider')
  return ctx
}

export function nightsBetween(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function stayBill(stay: Stay, payments: Payment[]) {
  const nights = nightsBetween(stay.checkIn, stay.actualCheckOut ?? stay.checkOut)
  const total = nights * stay.tariff
  const own = payments.filter((p) => p.stayId === stay.id)
  const paid = own.reduce(
    (sum, p) => sum + (p.kind === 'Refund' ? -p.amount : p.amount),
    0,
  )
  const advance = own
    .filter((p) => p.kind === 'Advance')
    .reduce((sum, p) => sum + p.amount, 0)
  return { nights, total, paid, advance, due: Math.max(0, total - paid), payments: own }
}

export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
