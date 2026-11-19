import { useEffect, useState } from 'react'

export type Inspection = {
  id: string
  vin: string
  agencyId: string
  date: string
  mileage: number
  result: 'مطابق' | 'مطابق بشروط' | 'غير مطابق'
  vinPlateMatch: boolean
  notes: string
}

export type Booking = {
  id: string
  agencyId: string
  vin: string
  date: string
  time: string
  name: string
  phone: string
  createdAt: string
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked */
    }
  }, [key, value])
  return [value, setValue] as const
}

export const SEED_INSPECTIONS: Inspection[] = [
  { id: 's1', vin: 'VF1RFB00X56123456', agencyId: 'a1', date: '2023-04-12', mileage: 84200, result: 'مطابق', vinPlateMatch: true, notes: 'لا ملاحظات.' },
  { id: 's2', vin: 'VF1RFB00X56123456', agencyId: 'a4', date: '2024-04-20', mileage: 97100, result: 'مطابق بشروط', vinPlateMatch: true, notes: 'تآكل في ممتص الصدمات الأمامي، يلزم الإصلاح خلال شهر.' },
  { id: 's3', vin: 'KMHD35LH5GU123456', agencyId: 'a3', date: '2022-09-03', mileage: 120500, result: 'غير مطابق', vinPlateMatch: false, notes: 'رقم الشاسيه غير مطابق للبطاقة الرمادية.' },
]