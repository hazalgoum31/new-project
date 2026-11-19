export type Agency = {
  id: string
  name: string
  wilaya: string
  address: string
  type: 'عمومية' | 'خاصة'
  approvalNo: string
  approvalExpiry: string
  rating: number
  reviews: number
  phone: string
}

export const WILAYAS = ['الجزائر', 'وهران', 'قسنطينة', 'سطيف', 'عنابة', 'البليدة', 'تيزي وزو', 'باتنة', 'بجاية', 'ورقلة']

export const AGENCIES: Agency[] = [
  { id: 'a1', name: 'وكالة المراقبة التقنية - الحراش', wilaya: 'الجزائر', address: 'المنطقة الصناعية، الحراش', type: 'خاصة', approvalNo: 'DZ-CT-2019-0412', approvalExpiry: '2029-03-14', rating: 4.6, reviews: 212, phone: '021 00 00 11' },
  { id: 'a2', name: 'مركز الشرق للفحص التقني', wilaya: 'الجزائر', address: 'براقي، الجزائر', type: 'خاصة', approvalNo: 'DZ-CT-2016-0188', approvalExpiry: '2026-06-30', rating: 4.1, reviews: 97, phone: '021 00 00 22' },
  { id: 'a3', name: 'وكالة المراقبة التقنية العمومية - السانيا', wilaya: 'وهران', address: 'السانيا، وهران', type: 'عمومية', approvalNo: 'DZ-CT-2015-0031', approvalExpiry: '2025-01-10', rating: 3.8, reviews: 164, phone: '041 00 00 33' },
  { id: 'a4', name: 'مركز الغرب للفحص', wilaya: 'وهران', address: 'بئر الجير، وهران', type: 'خاصة', approvalNo: 'DZ-CT-2021-0620', approvalExpiry: '2031-09-02', rating: 4.8, reviews: 301, phone: '041 00 00 44' },
  { id: 'a5', name: 'وكالة قسنطينة للمراقبة التقنية', wilaya: 'قسنطينة', address: 'الخروب، قسنطينة', type: 'خاصة', approvalNo: 'DZ-CT-2018-0275', approvalExpiry: '2028-05-21', rating: 4.3, reviews: 120, phone: '031 00 00 55' },
  { id: 'a6', name: 'وكالة سطيف العمومية', wilaya: 'سطيف', address: 'طريق العلمة، سطيف', type: 'عمومية', approvalNo: 'DZ-CT-2014-0009', approvalExpiry: '2027-11-18', rating: 3.9, reviews: 88, phone: '036 00 00 66' },
  { id: 'a7', name: 'مركز عنابة للفحص التقني', wilaya: 'عنابة', address: 'الحجار، عنابة', type: 'خاصة', approvalNo: 'DZ-CT-2020-0501', approvalExpiry: '2030-02-08', rating: 4.5, reviews: 143, phone: '038 00 00 77' },
  { id: 'a8', name: 'وكالة البليدة للمراقبة', wilaya: 'البليدة', address: 'بوفاريك، البليدة', type: 'خاصة', approvalNo: 'DZ-CT-2017-0233', approvalExpiry: '2027-07-04', rating: 4.2, reviews: 76, phone: '025 00 00 88' },
]

export function approvalStatus(expiry: string): { label: string; tone: 'ok' | 'soon' | 'bad' } {
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000
  if (days < 0) return { label: 'اعتماد منتهٍ', tone: 'bad' }
  if (days < 365) return { label: 'ينتهي خلال سنة', tone: 'soon' }
  return { label: 'اعتماد ساري', tone: 'ok' }
}