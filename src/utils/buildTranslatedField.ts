import { detectLanguage } from './detectLanguageByFranc';
import { translateTextToTargetLang } from './translateTextToTargetLang';

 export interface TranslatedField {
     en: string;
     bn: string;
     ar: string;
     ur: string;
     hi: string;
     tl: string;
}

/**-------------------------------
 * take actual string and convert to object
 * with en and bn field
 * *-------------------------------- */
export const buildTranslatedField = async (text: string): Promise<TranslatedField> => {
     const cleanText = text.trim();
     if (cleanText.length < 3) {
          throw new Error('Text too short to translate');
     }

     // ---------------------------------

     // 1️⃣ Detect the language
     let detectedLang = await detectLanguage(cleanText);
     const originalLang = detectedLang || 'en';

     // 3️⃣ Build the translation object
     const result: TranslatedField | any = { en: '', bn: '', ar: '', ur: '', hi: '', tl: '' };

     const requiredTranslation = ['en', 'bn', 'ar', 'ur', 'hi', 'tl'];
     const excludeOriginalLang = requiredTranslation.filter((lang) => lang !== originalLang);

     result[originalLang] = cleanText;

     for (const lang of excludeOriginalLang) {
          result[lang as keyof TranslatedField] = await translateTextToTargetLang(cleanText, lang as 'en' | 'bn' | 'ar' | 'ur' | 'hi' | 'tl');
     }

     //   ---------------------------------

     // const result: TranslatedField = { en: 'Testing', bn: 'টেস্টিং', ar: 'اختبار', ur: 'ٹیسٹینگ', hi: 'तेस्टिंग', tl: 'Testing' }; // 🧪 FOR_TESTING

     return result;
};

// 2️⃣ Handle unknown detection
//   if (detectedLang == 'unknown') {
//     const user = await User.findById(userId);
//     detectedLang = user?.language || 'en';
//   }
