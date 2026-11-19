const WMI: Record<string, { make: string; country: string }> = {
  VF1: { make: 'رونو', country: 'فرنسا' }, VF3: { make: 'بيجو', country: 'فرنسا' },
  VF7: { make: 'ستروين', country: 'فرنسا' }, VNK: { make: 'تويوتا', country: 'فرنسا' },
  WVW: { make: 'فولكس فاغن', country: 'ألمانيا' }, WBA: { make: 'بي إم دبليو', country: 'ألمانيا' },
  WDD: { make: 'مرسيدس-بنز', country: 'ألمانيا' }, ZFA: { make: 'فيات', country: 'إيطاليا' },
  KMH: { make: 'هيونداي', country: 'كوريا الجنوبية' }, KNA: { make: 'كيا', country: 'كوريا الجنوبية' },
  JTD: { make: 'تويوتا', country: 'اليابان' }, UU1: { make: 'داسيا', country: 'رومانيا' },
  LSV: { make: 'فولكس فاغن (الصين)', country: 'الصين' }, NMT: { make: 'تويوتا', country: 'تركيا' },
  VR7: { make: 'سيتروين', country: 'فرنسا' }, TMB: { make: 'سكودا', country: 'التشيك' },
  VSS: { make: 'سيات', country: 'إسبانيا' },
}

const YEARS = 'ABCDEFGHJKLMNPRSTVWXY123456789'
const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
}
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

export type VinResult =
  | { ok: false; error: string }
  | { ok: true; vin: string; make: string; country: string; year: number; plant: string; serial: string; checkDigitValid: boolean }

export function normalizeVin(v: string) {
  return v.toUpperCase().replace(/[\s-]/g, '')
}

export function decodeVin(raw: string): VinResult {
  const vin = normalizeVin(raw)
  if (vin.length !== 17) return { ok: false, error: `يجب أن يتكون VIN من 17 حرفًا (أدخلت ${vin.length}).` }
  if (/[IOQ]/.test(vin)) return { ok: false, error: 'الأحرف I وO وQ غير مستعملة في VIN. تحقق من الرقم المختوم على الشاسيه.' }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return { ok: false, error: 'يحتوي الرقم على رموز غير مسموحة. استعمل الأحرف اللاتينية والأرقام فقط.' }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const c = vin[i]
    const val = /\d/.test(c) ? Number(c) : TRANSLIT[c]
    sum += val * WEIGHTS[i]
  }
  const r = sum % 11
  const expected = r === 10 ? 'X' : String(r)
  const idx = YEARS.indexOf(vin[9])
  const base = vin[6] && /[A-Z]/.test(vin[6]) ? 2010 : 1980
  const year = idx >= 0 ? base + idx : 0
  const info = WMI[vin.slice(0, 3)]
  return {
    ok: true,
    vin,
    make: info?.make ?? 'غير معروف',
    country: info?.country ?? 'غير محدد',
    year,
    plant: vin[10],
    serial: vin.slice(11),
    checkDigitValid: vin[8] === expected,
  }
}