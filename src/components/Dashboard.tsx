import { useState, type FormEvent } from 'react'
import { AGENCIES, approvalStatus } from '../data'
import { decodeVin, normalizeVin } from '../vin'
import type { Inspection } from '../store'

export default function Dashboard({ inspections, onAdd }: { inspections: Inspection[]; onAdd: (i: Inspection) => void }) {
  const [agencyId, setAgencyId] = useState(AGENCIES[0].id)
  const agency = AGENCIES.find((a) => a.id === agencyId)!
  const st = approvalStatus(agency.approvalExpiry)
  const blocked = st.tone === 'bad'

  const [vin, setVin] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [mileage, setMileage] = useState('')
  const [result, setResult] = useState<Inspection['result']>('مطابق')
  const [plate, setPlate] = useState(true)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const mine = inspections.filter((i) => i.agencyId === agencyId).sort((a, b) => b.date.localeCompare(a.date))

  function submit(e: FormEvent) {
    e.preventDefault()
    setOk('')
    const v = decodeVin(vin)
    if (!v.ok) return setError(v.error)
    const km = Number(mileage)
    if (!km || km < 0) return setError('أدخل عدد الكيلومترات المقطوعة.')
    if (!plate && result === 'مطابق') return setError('لا يمكن تسجيل "مطابق" مع عدم تطابق رقم الشاسيه.')
    setError('')
    onAdd({ id: crypto.randomUUID(), vin: normalizeVin(vin), agencyId, date, mileage: km, result, vinPlateMatch: plate, notes: notes.trim() })
    setOk(`سُجّل فحص ${v.vin} وظهر في سجل السيارة.`)
    setVin(''); setMileage(''); setNotes('')
  }

  const field = 'mt-1 min-h-[44px] w-full rounded-xl border border-ink/20 bg-paper px-3'

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">لوحة الوكالة</h1>
      <p className="mt-3 text-ink/70">سجّل نتيجة الفحص واربطها برقم الشاسيه. نسخة تجريبية: اختر وكالة لمحاكاة الدخول.</p>

      <label className="mt-6 block text-sm">الوكالة
        <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} className={`${field} max-w-md`}>
          {AGENCIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${st.tone === 'ok' ? 'bg-pine-light text-pine-dark' : st.tone === 'soon' ? 'bg-brass/15 text-brass' : 'bg-flag/10 text-flag'}`}>{st.label} — حتى {agency.approvalExpiry}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10 lg:col-span-2">
          <h2 className="font-display text-xl">تسجيل فحص جديد</h2>
          {blocked && <p role="alert" className="rounded-lg bg-flag/10 p-3 text-sm text-flag">اعتماد هذه الوكالة منتهٍ. لا يمكن رفع نتائج فحص حتى يُجدَّد.</p>}
          <fieldset disabled={blocked} className="space-y-3">
            <label className="block text-sm">رقم VIN<input value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} className={`${field} vin-mono text-left`} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">التاريخ<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
              <label className="block text-sm">الكيلومترات<input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))} className={field} /></label>
            </div>
            <label className="block text-sm">النتيجة
              <select value={result} onChange={(e) => setResult(e.target.value as Inspection['result'])} className={field}>
                <option>مطابق</option><option>مطابق بشروط</option><option>غير مطابق</option>
              </select>
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={plate} onChange={(e) => setPlate(e.target.checked)} className="h-5 w-5 accent-pine" />رقم الشاسيه مطابق للبطاقة الرمادية</label>
            <label className="block text-sm">ملاحظات<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${field} py-2`} /></label>
            {error && <p role="alert" className="text-sm text-flag">{error}</p>}
            {ok && <p role="status" className="text-sm text-pine-dark">{ok}</p>}
            <button className="min-h-[48px] w-full rounded-xl bg-pine font-semibold text-white hover:bg-pine-dark disabled:bg-ink/20">رفع النتيجة</button>
          </fieldset>
        </form>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10 lg:col-span-3">
          <h2 className="font-display text-xl">آخر الفحوص ({mine.length})</h2>
          {mine.length === 0 ? (
            <p className="mt-3 text-ink/70">لا فحوص مسجلة لهذه الوكالة. سجّل أول فحص من النموذج.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/10">
              {mine.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="vin-mono">{i.vin}</span>
                  <span className="text-ink/60">{i.date}</span>
                  <span className={`font-semibold ${i.result === 'مطابق' ? 'text-pine' : i.result === 'غير مطابق' ? 'text-flag' : 'text-brass'}`}>{i.result}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}