import { useMemo, useState, type FormEvent } from 'react'
import { AGENCIES, WILAYAS, approvalStatus, type Agency } from '../data'
import { normalizeVin, decodeVin } from '../vin'
import type { Booking } from '../store'

const tone = { ok: 'bg-pine-light text-pine-dark', soon: 'bg-brass/15 text-brass', bad: 'bg-flag/10 text-flag' }

export default function Agencies({ bookings, onBooked, presetVin }: { bookings: Booking[]; onBooked: (b: Booking) => void; presetVin: string }) {
  const [wilaya, setWilaya] = useState('')
  const [sort, setSort] = useState<'rating' | 'name'>('rating')
  const [selected, setSelected] = useState<Agency | null>(null)
  const [toast, setToast] = useState('')

  const list = useMemo(() => {
    return AGENCIES.filter((a) => !wilaya || a.wilaya === wilaya).sort((a, b) => (sort === 'rating' ? b.rating - a.rating : a.name.localeCompare(b.name, 'ar')))
  }, [wilaya, sort])

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">احجز في وكالة مراقبة تقنية معتمدة</h1>
      <p className="mt-3 max-w-xl text-ink/70">نعرض فقط الوكالات المعتمدة من وزارة النقل مع تاريخ انتهاء اعتمادها. الحجز هنا للتنظيم، والفحص الرسمي يتم في الوكالة.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">الولاية
          <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="min-h-[44px] rounded-xl border border-ink/20 bg-white px-3">
            <option value="">كل الولايات</option>
            {WILAYAS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">الترتيب
          <select value={sort} onChange={(e) => setSort(e.target.value as 'rating' | 'name')} className="min-h-[44px] rounded-xl border border-ink/20 bg-white px-3">
            <option value="rating">الأعلى تقييمًا</option>
            <option value="name">الاسم</option>
          </select>
        </label>
      </div>

      {toast && <div role="status" className="mt-4 rounded-xl bg-pine-light p-3 text-pine-dark">{toast}</div>}

      {list.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-6 text-ink/70 ring-1 ring-ink/10">لا توجد وكالات في هذه الولاية بعد. اختر ولاية قريبة.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((a) => {
            const st = approvalStatus(a.approvalExpiry)
            const expired = st.tone === 'bad'
            return (
              <li key={a.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg leading-snug">{a.name}</h2>
                  <span className="shrink-0 rounded-lg bg-ink px-2 py-1 text-sm font-semibold text-white">★ {a.rating}</span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{a.wilaya} — {a.address}</p>
                <p className="text-sm text-ink/70">وكالة {a.type} · {a.reviews} تقييمًا</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className={`rounded-full px-3 py-1 font-semibold ${tone[st.tone]}`}>{st.label}</span>
                  <span className="vin-mono text-xs text-ink/60">{a.approvalNo}</span>
                </div>
                <p className="mt-1 text-xs text-ink/60">ينتهي الاعتماد: {a.approvalExpiry}</p>
                <button
                  disabled={expired}
                  onClick={() => setSelected(a)}
                  className="mt-4 min-h-[44px] w-full rounded-xl bg-pine font-semibold text-white transition hover:bg-pine-dark active:scale-[.98] disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/50"
                >
                  {expired ? 'الحجز غير متاح' : 'احجز موعدًا'}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {bookings.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl">مواعيدك</h2>
          <ul className="mt-3 space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-white p-4 text-sm ring-1 ring-ink/10">
                <span>{AGENCIES.find((a) => a.id === b.agencyId)?.name}</span>
                <span>{b.date} — {b.time}</span>
                <span className="vin-mono text-ink/60">{b.vin}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <BookingDialog
          agency={selected}
          presetVin={presetVin}
          onClose={() => setSelected(null)}
          onDone={(b) => {
            onBooked(b)
            setSelected(null)
            setToast(`تم حجز موعدك في ${selected.name} يوم ${b.date} الساعة ${b.time}.`)
          }}
        />
      )}
    </section>
  )
}

function BookingDialog({ agency, presetVin, onClose, onDone }: { agency: Agency; presetVin: string; onClose: () => void; onDone: (b: Booking) => void }) {
  const [vin, setVin] = useState(presetVin)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const today = new Date().toISOString().slice(0, 10)

  function submit(e: FormEvent) {
    e.preventDefault()
    const er: Record<string, string> = {}
    const v = decodeVin(vin)
    if (!v.ok) er.vin = v.error
    if (!date || date < today) er.date = 'اختر تاريخًا من اليوم فصاعدًا.'
    if (new Date(date).getDay() === 5) er.date = 'الوكالة مغلقة يوم الجمعة. اختر يومًا آخر.'
    if (name.trim().length < 3) er.name = 'أدخل اسمك الكامل.'
    if (!/^0[567]\d{8}$/.test(phone.replace(/\s/g, ''))) er.phone = 'أدخل رقم هاتف جزائري صحيحًا، مثل 0550123456.'
    setErrors(er)
    if (Object.keys(er).length) return
    onDone({ id: crypto.randomUUID(), agencyId: agency.id, vin: normalizeVin(vin), date, time, name: name.trim(), phone, createdAt: new Date().toISOString() })
  }

  const field = 'mt-1 min-h-[44px] w-full rounded-xl border border-ink/20 bg-paper px-3'
  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-flag">{errors[k]}</p>

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="حجز موعد" className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="font-display text-xl">حجز في {agency.name}</h2>
        <label className="block text-sm">رقم VIN<input value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} className={`${field} vin-mono text-left`} />{err('vin')}</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">التاريخ<input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={field} />{err('date')}</label>
          <label className="block text-sm">الساعة
            <select value={time} onChange={(e) => setTime(e.target.value)} className={field}>
              {['08:30', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">الاسم الكامل<input value={name} onChange={(e) => setName(e.target.value)} className={field} />{err('name')}</label>
        <label className="block text-sm">رقم الهاتف<input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} text-left`} dir="ltr" />{err('phone')}</label>
        <div className="flex gap-3 pt-2">
          <button className="min-h-[48px] flex-1 rounded-xl bg-pine font-semibold text-white hover:bg-pine-dark">تأكيد الحجز</button>
          <button type="button" onClick={onClose} className="min-h-[48px] rounded-xl px-5 ring-1 ring-ink/20 hover:bg-paper">إلغاء</button>
        </div>
      </form>
    </div>
  )
}