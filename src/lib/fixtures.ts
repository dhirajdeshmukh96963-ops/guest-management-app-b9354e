// Stubbed lodge data for the product surface. Every screen reads from here via
// `lodge-store.tsx`, so a later milestone can swap this for Netlify Database.

export type Floor = 1 | 2 | 3

export interface Unit {
  id: string
  label: string
  floor: Floor
  kind: 'room' | 'bed'
  type: string
  rate: number
}

export type PaymentKind = 'Advance' | 'Payment' | 'Refund'
export type PaymentMode = 'Cash' | 'UPI' | 'Card'

export interface Payment {
  id: string
  stayId: string
  date: string
  amount: number
  kind: PaymentKind
  mode: PaymentMode
  note?: string
}

export type DocType = 'Aadhaar' | 'PAN' | 'Driving Licence' | 'Voter ID' | 'Passport'

export interface Guest {
  id: string
  name: string
  dob: string
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  address: string
  docType: DocType
  docNumber: string
  photos: string[]
  signature?: string
}

export interface Stay {
  id: string
  guestId: string
  unitId: string
  checkIn: string
  checkOut: string
  actualCheckOut?: string
  persons: number
  tariff: number
  status: 'active' | 'checked-out'
  purpose: string
}

export const LODGE = {
  name: 'Yashoda Lodge',
  town: 'Mohol',
  address: 'Pandharpur Road, Mohol, Dist. Solapur, Maharashtra 413213',
  phone: '+91 98220 00000',
}

const rooms = (floor: 1 | 2): Unit[] =>
  Array.from({ length: 7 }, (_, i) => ({
    id: `R${floor}0${i + 1}`,
    label: `${floor}0${i + 1}`,
    floor,
    kind: 'room' as const,
    type: i < 2 ? 'Deluxe AC' : i < 5 ? 'Double' : 'Single',
    rate: i < 2 ? 1400 : i < 5 ? 900 : 650,
  }))

export const UNITS: Unit[] = [
  ...rooms(1),
  ...rooms(2),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `H${i + 1}`,
    label: `Bed ${i + 1}`,
    floor: 3 as const,
    kind: 'bed' as const,
    type: 'Dormitory bed',
    rate: 300,
  })),
]

export const FLOORS: { floor: Floor; title: string; subtitle: string }[] = [
  { floor: 1, title: 'First floor', subtitle: 'Rooms 101 – 107' },
  { floor: 2, title: 'Second floor', subtitle: 'Rooms 201 – 207' },
  { floor: 3, title: 'Third floor hall', subtitle: '10 dormitory beds' },
]

const today = new Date()
const day = (offset: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export const GUESTS: Guest[] = [
  {
    id: 'g1',
    name: 'Sanjay Vitthal Pawar',
    dob: '1984-03-12',
    gender: 'Male',
    phone: '98221 45671',
    address: 'At Post Kurul, Tal. Mohol, Dist. Solapur 413248',
    docType: 'Aadhaar',
    docNumber: '4521 8890 3312',
    photos: [],
  },
  {
    id: 'g2',
    name: 'Meera Suresh Kulkarni',
    dob: '1991-11-02',
    gender: 'Female',
    phone: '90110 22783',
    address: 'Flat 12, Shivneri Apts, Kothrud, Pune 411038',
    docType: 'Aadhaar',
    docNumber: '7810 2245 9087',
    photos: [],
  },
  {
    id: 'g3',
    name: 'Rahul Dattatray Shinde',
    dob: '1979-07-25',
    gender: 'Male',
    phone: '97654 11092',
    address: 'Near Vitthal Mandir, Pandharpur, Dist. Solapur 413304',
    docType: 'Driving Licence',
    docNumber: 'MH13 20110045321',
    photos: [],
  },
  {
    id: 'g4',
    name: 'Anil Kumar Yadav',
    dob: '1995-01-18',
    gender: 'Male',
    phone: '88050 67123',
    address: 'Ward 7, Station Road, Kalaburagi, Karnataka 585102',
    docType: 'Aadhaar',
    docNumber: '3367 1209 5544',
    photos: [],
  },
  {
    id: 'g5',
    name: 'Prakash Namdev Jadhav',
    dob: '1968-09-30',
    gender: 'Male',
    phone: '94221 30987',
    address: 'Shivaji Nagar, Barshi, Dist. Solapur 413401',
    docType: 'Voter ID',
    docNumber: 'MXR 4410923',
    photos: [],
  },
  {
    id: 'g6',
    name: 'Sunita Ramesh Gaikwad',
    dob: '1988-05-08',
    gender: 'Female',
    phone: '77200 98111',
    address: 'Plot 44, MIDC Road, Solapur 413006',
    docType: 'Aadhaar',
    docNumber: '9012 6634 2280',
    photos: [],
  },
  {
    id: 'g7',
    name: 'Vikas Bhimrao More',
    dob: '1999-12-14',
    gender: 'Male',
    phone: '93700 44512',
    address: 'Gandhi Chowk, Mohol, Dist. Solapur 413213',
    docType: 'Aadhaar',
    docNumber: '6645 7781 0093',
    photos: [],
  },
]

export const STAYS: Stay[] = [
  { id: 's1', guestId: 'g1', unitId: 'R101', checkIn: day(-2), checkOut: day(1), persons: 2, tariff: 1400, status: 'active', purpose: 'Business' },
  { id: 's2', guestId: 'g2', unitId: 'R103', checkIn: day(-1), checkOut: day(0), persons: 1, tariff: 900, status: 'active', purpose: 'Family visit' },
  { id: 's3', guestId: 'g3', unitId: 'R204', checkIn: day(0), checkOut: day(2), persons: 3, tariff: 900, status: 'active', purpose: 'Pilgrimage' },
  { id: 's4', guestId: 'g4', unitId: 'H2', checkIn: day(-3), checkOut: day(4), persons: 1, tariff: 300, status: 'active', purpose: 'Work' },
  { id: 's5', guestId: 'g5', unitId: 'H5', checkIn: day(-1), checkOut: day(1), persons: 1, tariff: 300, status: 'active', purpose: 'Pilgrimage' },
  { id: 's6', guestId: 'g6', unitId: 'R202', checkIn: day(-1), checkOut: day(2), persons: 2, tariff: 1400, status: 'active', purpose: 'Wedding' },
  { id: 's7', guestId: 'g7', unitId: 'R106', checkIn: day(-6), checkOut: day(-4), actualCheckOut: day(-4), persons: 1, tariff: 650, status: 'checked-out', purpose: 'Exam' },
]

export const PAYMENTS: Payment[] = [
  { id: 'p1', stayId: 's1', date: day(-2), amount: 2000, kind: 'Advance', mode: 'UPI' },
  { id: 'p2', stayId: 's1', date: day(-1), amount: 1000, kind: 'Payment', mode: 'Cash' },
  { id: 'p3', stayId: 's2', date: day(-1), amount: 900, kind: 'Advance', mode: 'Cash' },
  { id: 'p4', stayId: 's3', date: day(0), amount: 1000, kind: 'Advance', mode: 'UPI' },
  { id: 'p5', stayId: 's4', date: day(-3), amount: 1500, kind: 'Advance', mode: 'Cash' },
  { id: 'p6', stayId: 's6', date: day(-1), amount: 4200, kind: 'Advance', mode: 'Card' },
  { id: 'p7', stayId: 's7', date: day(-6), amount: 500, kind: 'Advance', mode: 'Cash' },
  { id: 'p8', stayId: 's7', date: day(-4), amount: 800, kind: 'Payment', mode: 'UPI', note: 'Settled at checkout' },
]

// What the document scanner returns today. The AI scan milestone replaces
// this with a real extraction from the uploaded photo.
export const SAMPLE_SCAN: Pick<Guest, 'name' | 'dob' | 'gender' | 'address' | 'docType' | 'docNumber'> = {
  name: 'Ganesh Maruti Deshmukh',
  dob: '1987-06-21',
  gender: 'Male',
  address: 'H. No. 218, Sadashiv Peth, Near Ganpati Mandir, Mohol, Dist. Solapur, Maharashtra 413213',
  docType: 'Aadhaar',
  docNumber: '5823 4417 9016',
}

export const MAX_PHOTOS = 4
