export interface SchoolItem {
  nameAr: string;
  nameEn: string;
  note?: string;
}

export interface WilayatItem {
  id: string;
  nameAr: string;
  nameEn: string;
  schools: SchoolItem[];
}

export const OMAN_WUSTA_SCHOOLS: WilayatItem[] = [
  {
    id: 'mahout',
    nameAr: 'ولاية محوت',
    nameEn: 'Wilayat Mahout',
    schools: [
      { nameAr: 'مدرسة الجوبة للتعليم الأساسي', nameEn: 'Al Jouba Basic Education School' },
      { nameAr: 'مدرسة حج للتعليم الأساسي', nameEn: 'Hajj Basic Education School' },
      { nameAr: 'مدرسة قلعة العلم للتعليم الأساسي', nameEn: 'Qalat Al Ilm Basic Education School' },
      { nameAr: 'مدرسة خلوف للتعليم الأساسي', nameEn: 'Khalouf Basic Education School' },
      { nameAr: 'مدرسة مديرة للتعليم الأساسي', nameEn: 'Madira Basic Education School' },
      { nameAr: 'مدرسة محوت للتعليم الأساسي (بنين)', nameEn: 'Mahout Basic Education School (Boys)' },
      { nameAr: 'مدرسة صراب للتعليم الأساسي', nameEn: 'Sarab Basic Education School' },
      { nameAr: 'مدرسة وادي السيل للتعليم الأساسي (بنين)', nameEn: 'Wadi Al Sail Basic Education School (Boys)' },
      { nameAr: 'مدرسة النور للتعليم الأساسي', nameEn: 'Al Noor Basic Education School' },
      { nameAr: 'مدرسة مسيرة الخير للتعليم الأساسي', nameEn: 'Maseerat Al Khair Basic Education School' },
      { nameAr: 'مدرسة 11 يناير للتعليم الأساسي (1-4)', nameEn: '11 January Basic Education School (1-4)', note: 'جديدة - 2025' }
    ]
  },
  {
    id: 'duqm',
    nameAr: 'ولاية الدقم',
    nameEn: 'Wilayat Duqm',
    schools: [
      { nameAr: 'مدرسة الدقم للتعليم الأساسي', nameEn: 'Duqm Basic Education School' },
      { nameAr: 'مدرسة بحر العرب للتعليم الأساسي (بنين)', nameEn: 'Bahr Al Arab Basic Education School (Boys)' },
      { nameAr: 'مدرسة ظهر للتعليم الأساسي', nameEn: 'Dhahr Basic Education School' },
      { nameAr: 'مدرسة هيتام للتعليم الأساسي', nameEn: 'Hitam Basic Education School' },
      { nameAr: 'مدرسة رأس مدركة للتعليم الأساسي', nameEn: 'Ras Madrakah Basic Education School' },
      { nameAr: 'مدرسة الشموخ للتعليم الأساسي', nameEn: 'Al Shamookh Basic Education School' }
    ]
  },
  {
    id: 'jazer',
    nameAr: 'ولاية الجازر',
    nameEn: 'Wilayat Al Jazer',
    schools: [
      { nameAr: 'مدرسة الخضراء للتعليم الأساسي', nameEn: 'Al Khadra Basic Education School' },
      { nameAr: 'مدرسة اللكبي للتعليم الأساسي', nameEn: 'Al Lakbi Basic Education School' },
      { nameAr: 'مدرسة الكحل للتعليم الأساسي', nameEn: 'Al Kuhl Basic Education School' },
      { nameAr: 'مدرسة ريما للتعليم الأساسي', nameEn: 'Rima Basic Education School' },
      { nameAr: 'مدرسة صوقرة للتعليم الأساسي', nameEn: 'Suqrah Basic Education School' },
      { nameAr: 'مدرسة الغبرة الجنوبية للتعليم الأساسي', nameEn: 'Al Ghubra Al Janoubiyah Basic Education School' }
    ]
  },
  {
    id: 'haima',
    nameAr: 'ولاية هيماء',
    nameEn: 'Wilayat Haima',
    schools: [
      { nameAr: 'مدرسة أبو مضابي للتعليم الأساسي', nameEn: 'Abu Madabi Basic Education School' },
      { nameAr: 'مدرسة المعارف للتعليم الأساسي', nameEn: 'Al Maarif Basic Education School' },
      { nameAr: 'مدرسة الوسطى للتعليم الأساسي (بنين)', nameEn: 'Al Wusta Basic Education School (Boys)' },
      { nameAr: 'مدرسة هيماء للتعليم الأساسي', nameEn: 'Haima Basic Education School' }
    ]
  }
];

// Flat list of all school names (Arabic) for lookup and easy rendering
export const ALL_OMAN_SCHOOLS_AR = OMAN_WUSTA_SCHOOLS.flatMap(w => w.schools.map(s => s.nameAr));
