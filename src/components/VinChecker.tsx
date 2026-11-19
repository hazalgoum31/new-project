import { useState, type FormEvent } from 'react'
import { decodeVin, type VinResult } from '../vin'
import { AGENCIES, approvalStatus } from '../data'
import { isDemo, type Inspection } from '../store'

function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-brass bg-brass/10 px-2.5 py-0.5 text-xs font-bold text-ink">
      بيانات تجريبية
    </span>
  )
}

const resultStyle: Record<Inspection['result'], string> = {
  'مطابق': 'border-pine text-pine',
  'مطابق بشروط': 'border-brass text-brass',
  'غير مطابق': 'border-flag text-flag',
}

export default function VinChecker({ inspections, onBook }: { inspections: Inspection[]; onBook: (vin: string) => void }) {
  const [input, setInput] = useState('')
  const [res, setRes] = useState<VinResult | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    setRes(decodeVin(input))
  }

  const history = res && res.ok ? inspections.filter((i) => i.vin === res.vin).sort((a, b) => b.date.localeCompare(a.date)) : []
  const last = history[0]
  const mismatch = history.some((h) => !h.vinPlateMatch)

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">اعرف تاريخ السيارة قبل أن تدفع ثمنها</h1>
      <p className="mt-3 max-w-xl text-ink/70">أدخل رقم الشاسيه (VIN) المختوم على السيارة. نعرض لك مواصفاتها وسجل مراقبتها التقنية لدى الوكالات المعتمدة.</p>

      <form onSubmit={submit} className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/10 sm:p-6">
        <label htmlFor="vin" className="block text-sm font-semibold">رقم VIN (17 حرفًا)</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="vin"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            maxLength={20}
            placeholder="VF1RFB00X56123456"
            autoComplete="off"
            aria-describedby="vin-hint"
            className="vin-mono min-h-[48px] flex-1 rounded-xl border border-ink/20 bg-paper px-4 text-lg text-left focus:border-pine"
          />
          <button className="min-h-[48px] rounded-xl bg-pine px-6 font-semibold text-white transition hover:bg-pine-dark active:scale-95">تحقق الآن</button>
        </div>
        <div id="vin-hint" className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <span>جرّب:</span>
          {['VF1RFB00X56123456', 'KMHD35LH5GU123456'].map((v) => (
            <button type="button" key={v} onClick={() => setInput(v)} className="vin-mono min-h-[44px] rounded-lg bg-pine-light px-3 text-xs text-pine-dark hover:bg-pine/20">{v}</button>
          ))}
        </div>
      </form>

      {res && !res.ok && (
        <div role="alert" className="mt-6 rounded-xl border border-flag/30 bg-flag/5 p-4 text-flag">{res.error}</div>
      )}

      {res && res.ok && (
        <div className="mt-6 space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
            {last && (
              <div key={last.id} className={`stamp absolute left-4 top-4 rounded-lg border-4 px-3 py-1 font-display text-xl ${resultStyle[last.result]}`} aria-label={`آخر نتيجة: ${last.result}`}>
                {last.result}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <p className="vin-mono text-sm text-ink/60">{res.vin}</p>
              {history.some(isDemo) && <DemoBadge />}
            </div>
            <h2 className="mt-1 font-display text-2xl">{res.make} {res.year ? `· ${res.year}` : ''}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><dt className="text-ink/60">بلد التصنيع</dt><dd className="font-semibold">{res.country}</dd></div>
              <div><dt className="text-ink/60">سنة الطراز</dt><dd className="font-semibold">{res.year || 'غير محددة'}</dd></div>
              <div><dt className="text-ink/60">رمز المصنع</dt><dd className="vin-mono font-semibold">{res.plant}</dd></div>
              <div><dt className="text-ink/60">الرقم التسلسلي</dt><dd className="vin-mono font-semibold">{res.serial}</dd></div>
            </dl>
            {!res.checkDigitValid && (
              <p className="mt-4 rounded-lg bg-brass/10 p-3 text-sm text-ink/80">رقم التحقق (الخانة 9) غير مطابق. هذا شائع في السيارات المصنوعة خارج أمريكا الشمالية، لكن قارن الرقم بالبطاقة الرمادية والشاسيه.</p>
            )}
          </div>

          {mismatch && (
            <div role="alert" className="rounded-xl border border-flag/40 bg-flag/5 p-4 text-flag">تحذير: سُجّل في أحد الفحوص عدم تطابق رقم الشاسيه مع الوثائق. لا تتم الصفقة قبل التحقق.</div>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
            <h3 className="font-display text-xl">سجل المراقبة التقنية</h3>
            {history.length === 0 ? (
              <div className="mt-3 text-ink/70">
                <p>لا يوجد فحص مسجل لهذه السيارة في المنصة. اطلب من البائع شهادة المراقبة التقنية السارية، أو احجز فحصًا.</p>
                <button onClick={() => onBook(res.vin)} className="mt-4 min-h-[44px] rounded-xl bg-pine px-5 font-semibold text-white hover:bg-pine-dark">احجز موعد فحص</button>
              </div>
            ) : (
              <ol className="mt-4 space-y-4 border-r-2 border-pine/30 pr-5">
                {history.map((h) => {
                  const ag = AGENCIES.find((a) => a.id === h.agencyId)
                  const st = ag ? approvalStatus(ag.approvalExpiry) : null
                  return (
                    <li key={h.id} className="relative">
                      <span className="absolute -right-[27px] top-2 h-3 w-3 rounded-full bg-pine" />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="flex items-center gap-2 font-semibold">{h.date}{isDemo(h) && <DemoBadge />}</span>
                        <span className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${resultStyle[h.result]}`}>{h.result}</span>
                      </div>
                      <p className="text-sm text-ink/70">{ag?.name} — {h.mileage.toLocaleString('ar-DZ')} كم{st && st.tone === 'bad' ? ' — اعتماد الوكالة منتهٍ اليوم' : ''}</p>
                      {h.notes && <p className="mt-1 text-sm">{h.notes}</p>}
                    </li>
                  )
                })}
              </ol>
            )}
            <p className="mt-6 text-xs text-ink/50">المعلومات للاستئناس فقط ولا تغني عن شهادة المراقبة التقنية الرسمية الصادرة عن وكالة معتمدة.</p>
          </div>
        </div>
      )}
    </section>
  )
}