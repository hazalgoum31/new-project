import { useState } from 'react'
import VinChecker from './components/VinChecker'
import Agencies from './components/Agencies'
import Dashboard from './components/Dashboard'
import { SEED_INSPECTIONS, useStored, type Booking, type Inspection } from './store'

type Tab = 'vin' | 'agencies' | 'dashboard'
const TABS: { id: Tab; label: string }[] = [
  { id: 'vin', label: 'فحص VIN' },
  { id: 'agencies', label: 'الوكالات والحجز' },
  { id: 'dashboard', label: 'لوحة الوكالة' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('vin')
  const [presetVin, setPresetVin] = useState('')
  const [inspections, setInspections] = useStored<Inspection[]>('vindz.inspections', SEED_INSPECTIONS)
  const [bookings, setBookings] = useStored<Booking[]>('vindz.bookings', [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#0F6B4A" />
              <path d="M8 14l6 14 6-14M24 14v14M24 14h8M24 21h6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="33" cy="9" r="3" fill="#C8312B" />
            </svg>
            <span className="font-display text-2xl text-ink">فحص DZ</span>
          </div>
          <nav aria-label="التنقل الرئيسي" className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`min-h-[44px] rounded-xl px-3 text-sm font-semibold transition sm:px-4 ${tab === t.id ? 'bg-pine text-white' : 'text-ink/70 hover:bg-pine-light'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {tab === 'vin' && <VinChecker inspections={inspections} onBook={(v) => { setPresetVin(v); setTab('agencies') }} />}
        {tab === 'agencies' && <Agencies bookings={bookings} presetVin={presetVin} onBooked={(b) => setBookings((p) => [b, ...p])} />}
        {tab === 'dashboard' && <Dashboard inspections={inspections} onAdd={(i) => setInspections((p) => [i, ...p])} />}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs text-ink/60">
        منصة مستقلة تكمّل «مركبتي DZ» ولا تحل محل المراقبة التقنية الرسمية. بيانات العرض تجريبية ومحفوظة في متصفحك.
      </footer>
    </div>
  )
}