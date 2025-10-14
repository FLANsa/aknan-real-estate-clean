// Arabic to Latin transliteration mapping
const arabicToLatin: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
  'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
  'ة': 'h', 'ء': 'a', 'ؤ': 'w', 'ئ': 'y',
  ' ': '-', '-': '-', '_': '-'
};

// Extended mapping for common Arabic words
const wordMappings: Record<string, string> = {
  'فيلا': 'villa',
  'شقة': 'apartment',
  'أرض': 'land',
  'مكتب': 'office',
  'محل': 'shop',
  'الرياض': 'riyadh',
  'جدة': 'jeddah',
  'مكة': 'makkah',
  'المدينة': 'medina',
  'الدمام': 'dammam',
  'الخبر': 'khobar',
  'الطائف': 'taif',
  'بريدة': 'buraidah',
  'تبوك': 'tabuk',
  'حائل': 'hail',
  'نجران': 'najran',
  'جازان': 'jazan',
  'الحدود الشمالية': 'northern-borders',
  'الباحة': 'al-baha',
  'عسير': 'asir',
  'الملقا': 'malqa',
  'النخيل': 'al-nakheel',
  'الروضة': 'al-rawdah',
  'السلامة': 'al-salamah',
  'النسيم': 'al-naseem',
  'الورود': 'al-ward',
  'الزهور': 'al-zuhur',
  'الربيع': 'al-rabie',
  'الصيف': 'al-sayf',
  'الخريف': 'al-kharif',
  'الشتاء': 'al-shita',
};

export function slugifyArabic(arabicText: string): string {
  if (!arabicText) return '';
  
  // Convert to lowercase and trim
  let text = arabicText.toLowerCase().trim();
  
  // First, try to replace whole words
  for (const [arabicWord, latinWord] of Object.entries(wordMappings)) {
    const regex = new RegExp(arabicWord, 'g');
    text = text.replace(regex, latinWord);
  }
  
  // Then transliterate remaining characters
  let slug = '';
  for (const char of text) {
    if (arabicToLatin[char]) {
      slug += arabicToLatin[char];
    } else if (/[a-z0-9]/.test(char)) {
      slug += char;
    } else if (/[\s\-_]/.test(char)) {
      slug += '-';
    }
  }
  
  // Clean up the slug
  slug = slug
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 100); // Limit length
  
  return slug || 'property'; // Fallback if empty
}

export async function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[] = []
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Helper function to extract slug from property title
export function createPropertySlug(titleAr: string): string {
  return slugifyArabic(titleAr);
}


