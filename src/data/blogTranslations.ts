import { BlogPost } from '../components/BlogsPage';

export type BlogLanguage = 'en' | 'roman' | 'urdu';

export interface LanguageOption {
  id: BlogLanguage;
  label: string;
  sublabel: string;
  flag: string;
  fontClass: string;
  dir: 'ltr' | 'rtl';
}

export const BLOG_LANGUAGES: LanguageOption[] = [
  {
    id: 'en',
    label: 'English',
    sublabel: 'Standard',
    flag: '🇬🇧',
    fontClass: 'font-sans',
    dir: 'ltr'
  },
  {
    id: 'roman',
    label: 'Roman Urdu',
    sublabel: 'Asaan Urdu',
    flag: '🇵🇰',
    fontClass: 'font-sans',
    dir: 'ltr'
  },
  {
    id: 'urdu',
    label: 'اردو',
    sublabel: 'نستعلیق فونٹ',
    flag: '🇵🇰',
    fontClass: 'font-urdu',
    dir: 'rtl'
  }
];

export const CATEGORY_TRANSLATIONS: Record<string, { roman: string; urdu: string }> = {
  'All': {
    roman: 'Tamam Guides',
    urdu: 'تمام مضامین'
  },
  '🔋 Battery & Chemistry': {
    roman: '🔋 Battery & Chemistry',
    urdu: '🔋 بیٹری اور کیمسٹری'
  },
  '🔧 Maintenance & Repairs': {
    roman: '🔧 Dekhbhal & Repairs',
    urdu: '🔧 دیکھ بھال اور مرمت'
  },
  '⚡ Tariffs & Charging': {
    roman: '⚡ Bijli Tariffs & Charging',
    urdu: '⚡ بجلی ٹیرف اور چارجنگ'
  },
  '🛵 Buyer Guides': {
    roman: '🛵 Khareedari Guides',
    urdu: '🛵 خریداری گائیڈز'
  },
  '📦 Gig Economy': {
    roman: '📦 Delivery Riders Bachat',
    urdu: '📦 رائیڈرز اور روزگار'
  },
  '☀️ Solar & Green': {
    roman: '☀️ Solar Panel & Free Charging',
    urdu: '☀️ سولر اور ماحول دوست'
  }
};

export const UI_TRANSLATIONS: Record<BlogLanguage, {
  badge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  articlesCount: string;
  showingCategory: string;
  readArticle: string;
  readTime: string;
  takeawaysTitle: string;
  relatedToolPrefix: string;
  shareBtn: string;
  copiedNotice: string;
  closeBtn: string;
  languageSelectLabel: string;
  fontBadge: string;
  minRead: string;
  tableNote: string;
  authorLabel: string;
  resetCategory: string;
}> = {
  en: {
    badge: 'Editorial & Practical Guides',
    heroTitle: 'Pakistan EV',
    heroHighlight: 'Knowledge & Insights',
    heroSubtitle: 'In-depth guides, tariff breakdowns, battery chemistry comparisons, and commercial gig-rider analysis written specifically for Pakistani road and economic realities.',
    searchPlaceholder: 'Search guides (e.g. NEPRA tariffs, LiFePO4, Bykea, Yadea, Solar)...',
    articlesCount: 'Available Guides',
    showingCategory: 'Showing category',
    readArticle: 'Read Full Guide',
    readTime: 'min read',
    takeawaysTitle: 'Key Takeaways for Pakistani Riders',
    relatedToolPrefix: 'Launch Interactive Tool',
    shareBtn: 'Share Guide',
    copiedNotice: 'Link copied to clipboard!',
    closeBtn: 'Close Guide',
    languageSelectLabel: 'Choose Reading Language / زبان منتخب کریں:',
    fontBadge: 'Urdu Nastaliq Font Active',
    minRead: 'min read',
    tableNote: 'Data benchmarked for Pakistani conditions (2026)',
    authorLabel: 'Author',
    resetCategory: 'Show All'
  },
  roman: {
    badge: 'Tahqeeqi aur Amli Rahnumai',
    heroTitle: 'Pakistan EV',
    heroHighlight: 'Maloomat aur Rahnumai',
    heroSubtitle: 'Pakistani sarkon aur maeeshat k mutabiq battery, bijli k bills (NEPRA/K-Electric) aur Bykea/Foodpanda delivery riders ki bachat k mukammal aasan tareeqay.',
    searchPlaceholder: 'Guides talash karein (maslan NEPRA bijli bill, LiFePO4 battery, Bykea bachat)...',
    articlesCount: 'Dastyab Guides',
    showingCategory: 'Category dikhai ja rahi hai',
    readArticle: 'Mukammal Guide Parhein',
    readTime: 'min parhai',
    takeawaysTitle: 'Pakistani Riders K Liye Zaroori Nakaat (Takeaways)',
    relatedToolPrefix: 'Mutaliqa Calculator Kholein',
    shareBtn: 'Guide Share Karein',
    copiedNotice: 'Link copy ho gaya!',
    closeBtn: 'Guide Band Karein',
    languageSelectLabel: 'Parhne Ki Zuban Chunein:',
    fontBadge: 'Roman Urdu Active',
    minRead: 'min parhai',
    tableNote: 'Pakistani market aur sarak k tajzia k mutabiq (2026)',
    authorLabel: 'Musannif',
    resetCategory: 'Sab Dekhein'
  },
  urdu: {
    badge: 'ادارتی اور عملی رہنمائی',
    heroTitle: 'پاکستان الیکٹرک بائیک',
    heroHighlight: 'مکمل معلوماتی گائیڈز',
    heroSubtitle: 'پاکستانی سڑکوں، گرم موسم اور بجلی کے نرخوں (نیپرا/کے-الیکٹرک) کے عین مطابق بیٹریاں، دیکھ بھال، بائیکیا و فوڈ پانڈا رائیڈرز کی بچت اور سولر چارجنگ کی رہنمائی۔',
    searchPlaceholder: 'گائیڈز تلاش کریں (مثلاً نیپرا بل، لیتھیم بیٹری، بائیکیا بچت، موٹر فالٹ)...',
    articlesCount: 'دستیاب گائیڈز',
    showingCategory: 'موجودہ کیٹیگری',
    readArticle: 'مکمل مضمون پڑھیں',
    readTime: 'منٹ مطالعہ',
    takeawaysTitle: 'پاکستانی رائیڈرز کے لیے انتہائی اہم نکات و نتائج',
    relatedToolPrefix: 'متعلقہ کیلکولیٹر ٹول کھولیں',
    shareBtn: 'مضمون شیئر کریں',
    copiedNotice: 'لنک کامیابی سے کاپی ہو گیا!',
    closeBtn: 'بند کریں',
    languageSelectLabel: 'پڑھنے کی زبان و فونٹ منتخب کریں:',
    fontBadge: 'خالص اردو نستعلیق فونٹ فعال ہے',
    minRead: 'منٹ مطالعہ',
    tableNote: 'پاکستانی مارکیٹ کے مستند اعداد و شمار (2026)',
    authorLabel: 'تحریر و تحقیق',
    resetCategory: 'سب دیکھیں'
  }
};

// Curated specific translations for titles, excerpts and full bodies
export const CURATED_TRANSLATIONS: Record<string, {
  roman: {
    title: string;
    excerpt: string;
    intro?: string;
    takeaways?: string[];
    headings?: string[];
    callout?: string;
  };
  urdu: {
    title: string;
    excerpt: string;
    intro?: string;
    takeaways?: string[];
    headings?: string[];
    callout?: string;
  };
}> = {
  'nepra-tariffs-2026-ev-charging-strategy': {
    roman: {
      title: 'NEPRA 2026 Bijli Tariffs: Apni Electric Bike Ko 60% Saste Me Kaise Charge Karein?',
      excerpt: 'WAPDA aur K-Electric k Peak aur Off-Peak ghanton ko samajh kar mahana charging ka kharcha Rs 2,400 se kam kar k Rs 1,100 tak laya ja sakta hai.',
      intro: 'NEPRA k naye gharelu aur commercial slabs k baad bijli k bill bohat barh chukay hain. Lekin aksar Pakistani sham 5 baje se raat 11 baje (Peak Hours) me bike charge lagate hain jahan unit rate 60 se 65 rupay parta hai. Raat 11 baje k baad charging se yeh rate 30 se 35 rupay par aa jata hai.',
      headings: [
        '1. Pakistan Me Peak aur Off-Peak Rates Ka Farq',
        '2. 300+ Units K Bhari Slab Penalties Se Bachna',
        '3. Garmi Me Battery Ka Temperature Aur Raat Ki Charging'
      ],
      callout: 'Tarkeeb: Sirf 1,200 rupay ka digital timer switch lein. Sham ko bike plug laga dein magar switch raat 11:30 baje on ho.',
      takeaways: [
        'Raat 11:30 PM se subah 7:00 AM k darmian charge karein taake sasti bijli aur thandi hawa dono ka faida ho.',
        '1,000 kilometer chalane par EV bike ka bijli ka bill sirf Rs 1,150 se 1,400 aata hai jabkay petrol Rs 9,500 se zyada khata hai.',
        'Apne DISCO meter k hisab se exact kharcha janne k liye hamara Charging Cost Calculator istemal karein.'
      ]
    },
    urdu: {
      title: 'نیپرا 2026 بجلی ٹیرف: اپنی الیکٹرک بائیک 60 فیصد کم خرچ پر کیسے چارج کریں؟',
      excerpt: 'واپڈا اور کے-الیکٹرک کے پیک اور آف پیک اوقات کو سمجھ کر ماہانہ چارجنگ کا خرچ 2400 روپے سے کم کر کے 1100 روپے لانے کا مجرب طریقہ۔',
      intro: 'نیپرا کے نئے گھریلو اور کمرشل ٹیرف کے بعد بجلی کے بلوں میں غیر معمولی اضافہ ہوا ہے۔ اکثر صارفین نادانستہ طور پر شام 5 سے رات 11 بجے (پیک آورز) میں بائیک چارجنگ پر لگا دیتے ہیں جہاں فی یونٹ 60 سے 65 روپے پڑتا ہے۔ جبکہ رات 11 بجے کے بعد آف پیک چارجنگ پر یہی یونٹ 28 سے 34 روپے کا پڑتا ہے۔',
      headings: [
        '۱. پاکستان میں پیک اور آف پیک اوقات کا فرق',
        '۲. 300 سے زائد یونٹس کے بھاری سلیب جرمانے سے بچاؤ',
        '۳. گرمیوں میں بیٹری کا درجہ حرارت اور رات کو چارجنگ کے فوائد'
      ],
      callout: 'اہم مشورہ: مارکیٹ سے 1200 روپے کا ڈیجیٹل ٹائمر پلگ خریدیں۔ شام کو پلگ لگا دیں مگر ٹائمر رات 11:30 پر خودکار آن ہوگا۔',
      takeaways: [
        'ہمیشہ رات 11:30 سے صبح 7 بجے کے درمیان چارج کریں تاکہ سستے ریٹ اور ٹھنڈے ماحول کا مکمل فائدہ مل سکے۔',
        'ایک ہزار کلومیٹر کے سفر پر الیکٹرک بائیک کا خرچ صرف 1150 تا 1400 روپے آتا ہے جبکہ پیٹرول بائیک 9500 روپے پی جاتی ہے۔',
        'اپنے میٹر اور سلیب کے مطابق مکمل تخمینہ لگانے کے لیے ہمارا چارجنگ لاگت کیلکولیٹر استعمال کریں۔'
      ]
    }
  },
  'lifepo4-vs-graphene-vs-ternary-lithium-pakistan-heat': {
    roman: {
      title: 'LiFePO4 vs Graphene vs Ternary Lithium: Pakistan Ki Sakht Garmi Me Konsi Battery Kamiyab Hai?',
      excerpt: 'Multan, Lahore aur Sukkur me 44°C+ garmi sasti battery ko bohot jald khatam kar deti hai. Janiye kaunsi battery 5 se 7 saal chalti hai.',
      intro: 'Pakistan me electric bike lene k baad sab se bara kharcha battery badalne ka hota hai. Showrooms 3 se 5 saal ka dawa karte hain, lekin 45°C garmi me lead-acid graphene aur ordinary lithium bohot jaldi phool jati hain jabkay LiFePO4 dhoop me bhi mazboot rehti hai.',
      headings: [
        '1. Graphene (Upgraded Lead-Acid): Sasta Sauda Magar Mehnga Nuqsan',
        '2. Ternary Lithium (NMC): Halki aur Tez, Magar Garmi Me Nazuk',
        '3. LiFePO4 (LFP): Pakistani Mausam K Liye Sab Se Behtareen'
      ],
      takeaways: [
        'Agar daily 30 km se zyada chalana hai to hamesha thore extra paise de kar LiFePO4 battery lein.',
        'Tez dhoop me 100% full charge kar k bike khari na karein, shade me park karein.',
        'Used bike lene se pehle hamare Battery Health Tracker se SOH lazmi check karein.'
      ]
    },
    urdu: {
      title: 'لیتھیم آئرن فاسفیٹ بمقابلہ گریفین و ٹرنری: پاکستان کی شدید گرمی میں کون سی بیٹری کامیاب ہے؟',
      excerpt: 'ملتان، سکھر اور لاہور میں 44 ڈگری سے زائد درجہ حرارت سستی بیٹریوں کو تباہ کر دیتا ہے۔ جانیے کون سی کیمسٹری 5 سے 7 سال ساتھ نبھاتی ہے۔',
      intro: 'پاکستان میں ای وی بائیک مالکان کے لیے سب سے بڑا چھپا ہوا خرچ قبل از وقت بیٹری کی تبدیلی ہے۔ شو رومز اکثر لمبی گارنٹی کا دعویٰ کرتے ہیں، مگر اصل انحصار بیٹری کی کیمسٹری پر ہے۔ 46 ڈگری گرمی میں لیڈ ایسڈ گریفین چند ماہ میں کمزور ہو جاتی ہے جبکہ لیتھیم آئرن فاسفیٹ (LiFePO4) غیر متزلزل کارکردگی دکھاتی ہے۔',
      headings: [
        '۱. گریفین لیڈ ایسڈ: سستا لیکن وقتی سودا',
        '۲. ٹرنری لیتھیم (NMC): تیز رفتار مگر شدید گرمی سے حساس',
        '۳. لیتھیم آئرن فاسفیٹ (LFP): پاکستان کے گرم موسم کے لیے سونا'
      ],
      takeaways: [
        'اگر آپ روزانہ 30 کلومیٹر سے زیادہ سفر کرتے ہیں تو ہمیشہ لیتھیم آئرن فاسفیٹ (LiFePO4) پیک کا انتخاب کریں۔',
        'دوپہر کی سخت دھوپ میں 100 فیصد فل چارج حالت میں بائیک ہرگز کھڑی نہ کریں۔',
        'پرانی استعمال شدہ بائیک خریدنے سے پہلے بیٹری کا ایس او ایچ ہمارے ہیلتھ ٹریکر سے چیک کریں۔'
      ]
    }
  },
  'delivery-rider-ev-transition-profit-breakdown': {
    roman: {
      title: 'Bykea, Indrive & Foodpanda Riders: Electric Bike Se Mahana Rs 28,000 Ki Bachat Kaise Karein?',
      excerpt: 'Honda CD70 petrol bike k muqable me 120 km daily chalane wale delivery rider ka kharcha aur munafa ka sachha hisab.',
      intro: 'Lahore, Karachi, Rawalpindi aur Faisalabad me kaam karne wale delivery riders ka sab se bara kharcha petrol hai. 120 km daily chalane par mahana 24,000 se 28,000 rupay petrol aur mobile oil me nikal jate hain. Electric bike pe shift hone se yeh raqam seedhi pocket me bachti hai.',
      headings: [
        '1. Kharchay Ka Asal Hisab: 120 KM Daily Duty',
        '2. Gig Workers K Liye Dual-Battery aur Quick Charge Strategy'
      ],
      callout: 'Nateeja: Delivery rider mahana 24,000 se 29,000 rupay naqad bachat karta hai — sirf 10 mahinon me nayi EV bike ki poori qeemat wasool ho jati hai!',
      takeaways: [
        'Riders saalana 2 lakh 90 hazar rupay se zyada bacha saktay hain.',
        'Vibration aur shor na hone ki waja se 8 ghantay duty k baad rider thakta nahi hai.',
        'Apne daily kilometers k hisab se exact munafa dekhne k liye hamara Rider Profit Calculator chalayein.'
      ]
    },
    urdu: {
      title: 'بائیکیا، ان ڈرائیو اور فوڈ پانڈا رائیڈرز: ای وی بائیک سے ماہانہ 28 ہزار روپے اضافی بچت کیسے کریں؟',
      excerpt: 'ہونڈا سی ڈی 70 پیٹرول کے مقابلے میں روزانہ 120 کلومیٹر سفر کرنے والے رائیڈر کے پیٹرول، آئل اور مرمت کے اخراجات کا جامع مالیاتی موازنہ۔',
      intro: 'لاہور، کراچی اور راولپنڈی میں محنت کرنے والے رائیڈرز کا سب سے بڑا دشمن پیٹرول کا خرچ ہے۔ روزانہ 120 کلومیٹر پر پیٹرول اور موبل آئل کا ماہانہ خرچ 28 ہزار روپے سے تجاوز کر جاتا ہے۔ الیکٹرک اسکوٹر یا بائیک پر منتقلی سے ماہانہ خرچ گر کر صرف 3500 روپے رہ جاتا ہے۔',
      headings: [
        '۱. روزانہ 120 کلومیٹر کے اخراجات کا مکمل کچا چٹھا',
        '۲. ڈلیوری رائیڈرز کے لیے ڈبل بیٹری اور دوپہر کی فوری چارجنگ حکمت عملی'
      ],
      callout: 'حتمی نتیجہ: ایک رائیڈر ہر ماہ 24,000 تا 29,000 روپے خالص کیش بچاتا ہے، جس سے محض 10 ماہ میں الیکٹرک بائیک کی مکمل قیمت وصول ہو جاتی ہے!',
      takeaways: [
        'رائیڈرز سالانہ تقریباً 3 لاکھ روپے پیٹرول اور آئل کی مد میں بچا سکتے ہیں۔',
        'شور اور وائبریشن نہ ہونے سے جسمانی تھکن اور کمر کے درد سے مکمل نجات ملتی ہے۔',
        'اپنے روزانہ سفر کے مطابق درست بچت جاننے کے لیے ہمارا رائیڈر پرافٹ انجن استعمال کریں۔'
      ]
    }
  },
  'buyers-guide-top-ev-bikes-pakistan-2026': {
    roman: {
      title: 'Khareedari Guide 2026: Pakistan Ki Top 5 Electric Bikes Aur Scooters Ka Sachha Jaiza',
      excerpt: 'Yadea T5 se le kar Road Prince Bella aur Metro E-Bikes tak: Students, office jane walon aur families k liye kaunsa model behtareen hai?',
      intro: 'Pakistan me ab 38 se zyada factory-built electric bikes dastyab hain jin me Yadea, Road Prince, Metro, MS Jaguar, Crown aur United shamil hain. Hum ne unki build quality, spare parts aur real mileage ka tajzia kiya hai.',
      headings: [
        '1. Yadea T5 aur Ruibin: Premium Quality aur TTFAR Technology',
        '2. Road Prince Bella: European Retro Style aur Ladies K Liye Aasan',
        '3. Metro E-Bikes: Shehr Shehr Dastyab Spare Parts'
      ],
      takeaways: [
        'Showroom me do banday bitha kar speed breaker par suspension lazmi test karein.',
        'Battery warranty card par replacement clause written me check karein.',
        'Hamare Fleet Comparison tool se tamam 38+ models ka aamnay samnay mوازنہ karein.'
      ]
    },
    urdu: {
      title: 'خریداری گائیڈ 2026: پاکستان کی ٹاپ 5 الیکٹرک بائیکس اور اسکوٹرز کا غیر جانبدارانہ جائزہ',
      excerpt: 'یادیہ ٹی 5، روڈ پرنس بیلا اور میٹرو ای بائیکس: طلباء، دفتری ملازمین اور گھریلو سواری کے لیے کون سا ماڈل بہترین قیمت فراہم کرتا ہے؟',
      intro: 'پاکستانی مارکیٹ اب پرانے لوکل تجربات سے نکل کر مستند فیکٹری مینوفیکچررز جیسے یادیہ، روڈ پرنس، میٹرو اور یونائیٹڈ کے درجنوں ماڈلز تک پھیل چکی ہے۔ ہم نے روڈ ٹیسٹ، اسپیئر پارٹس کی دستیابی اور اصل رینج کا تفصیلی جائزہ لیا ہے۔',
      headings: [
        '۱. یادیہ T5 اور روئی بن: عالمی معیار اور بہترین ٹی ٹی ایف اے آر سسٹم',
        '۲. روڈ پرنس بیلا: دلکش ڈیزائن اور خواتین و فیملی کے لیے ہلکی پھلکی سواری',
        '۳. میٹرو ای بائیکس: وسیع ڈیلرشپ نیٹ ورک اور سستے اسپیئر پارٹس'
      ],
      takeaways: [
        'خریدنے سے پہلے پچھلی سیٹ پر سواری بٹھا کر جمپوں اور بریکوں کا عملی تجربہ لیں۔',
        'وارنٹی کارڈ پر بیٹری تبدیل کرنے کی تحریری شرط بغور پڑھیں۔',
        'تمام ماڈلز کے موازنے کے لیے ہمارا پروڈکٹ کمپیریزن ٹول وزٹ کریں۔'
      ]
    }
  },
  'home-solar-net-metering-ev-charging-blueprint': {
    roman: {
      title: 'Solar Net-Metering Aur EV Home Charging: 100% Muft Safar Ka Formula',
      excerpt: 'Chhat par 1.5 kW se 3 kW solar panels laga kar apne ghar k bijli k bill aur petrol ka kharcha hamesha k liye khatam karein.',
      intro: 'Pakistan me sooraj ki roshni bohot zyada hai. Agar aap ghar ki chhat par sirf 2 solar panels (550W) laga lein to aap ki electric bike ka rozana ka safar bilkul muft (Zero Rupees) ho jata hai.',
      headings: [
        '1. Bike K Liye Kitne Solar Panels Chahiye?',
        '2. Din Me Direct Charging vs Raat Ko Inverter Se Charging'
      ],
      takeaways: [
        'Solar aur EV ka jor aap ko NEPRA k kisi bhi rate k izafay se hamesha mehfooz rakhta hai.',
        '2 panels ka kharcha sirf 8 se 9 mahinon me petrol ki bachat se poora ho jata hai.',
        'Apne ghar k solar system ka hisab lagane k liye hamara Solar Power Calculator use karein.'
      ]
    },
    urdu: {
      title: 'گھریلو سولر پینلز اور الیکٹرک بائیک چارجنگ: 100 فیصد مفت سفر کا مکمل خاکہ',
      excerpt: 'چھت پر محض 2 سولر پینلز لگا کر اپنے گھر کا ماہانہ پیٹرول خرچ ہمیشہ کے لیے صفر روپے پر لانے کا باقاعدہ فارمولا۔',
      intro: 'پاکستان میں سورج کی وافر روشنی سال کے 300 سے زائد دن میسر رہتی ہے۔ اگر ایک چھوٹا الیکٹرک اسکوٹر روزانہ 35 کلومیٹر چلتا ہے تو اسے روزانہ صرف 1 یونٹ بجلی درکار ہوتی ہے، جو محض 2 مونو پرک سولر پینلز باآسانی پیدا کر دیتے ہیں۔',
      headings: [
        '۱. بائیک چارجنگ کے لیے سولر سسٹم کا درست سائز',
        '۲. آن گرڈ بمقابلہ ہائبرڈ انورٹر اور بیٹری اسٹوریج'
      ],
      takeaways: [
        'سولر پینل سے بائیک چارج کرنے پر پٹرول کی قیمتوں میں اضافے کا خوف ہمیشہ کے لیے ختم ہو جاتا ہے۔',
        '2 پینلز پر آنے والا خرچ محض 9 ماہ میں پٹرول کی بچت کی صورت میں واپس مل جاتا ہے۔',
        'اپنے سولر پینلز کا تخمینہ ہمارے سولر پاور کیلکولیٹر سے لگائیں۔'
      ]
    }
  },
  'rain-water-heatwave-ev-safety-pakistan': {
    roman: {
      title: 'Monsoon Barish, Paani Aur Garmi: Pakistani EV Riders K Liye Hifazati Tadabeer',
      excerpt: 'Kya Karachi aur Lahore k kharay paani me electric bike chalana safe hai? IP67 waterproofing aur motor safety ki haqeeqat.',
      intro: 'Barishon me Karachi, Lahore aur Rawalpindi ki sarkon par paani jam jata hai. Bohat se riders darrte hain k bike me current na aa jaye ya motor kharab na ho jaye. Achhi quality k BLDC hub motors IP67 waterproof hotay hain lekin kuch baaton ka khayal rakhna farz hai.',
      headings: [
        '1. Paani Ki Mehfooz Gehrai (Wheel Axle Ka Qanoon)',
        '2. Barish K Baad Dhone Aur Charging Ka Tareeqa'
      ],
      takeaways: [
        'Paani motor k center axle se ooper nahi aana chahiye.',
        'Pressure washer se direct wiring aur charger socket par paani na marein.',
        'Charger lagane se pehle socket ko achhi tarah sookhne dein.'
      ]
    },
    urdu: {
      title: 'مون سون کی بارشیں، کھڑا پانی اور ہیٹ ویو: پاکستانی ای وی رائیڈرز کے لیے ناگزیر حفاظتی تدابیر',
      excerpt: 'کیا کراچی اور لاہور کے برساتی پانی میں الیکٹرک بائیک چلانا محفوظ ہے؟ آئی پی 67 واٹر پروفنگ اور موٹر کی حفاظت کے بنیادی اصول۔',
      intro: 'برسات کے موسم میں جب سڑکوں پر پانی کھڑا ہو جائے تو اکثر افراد کرنٹ لگنے یا موٹر خراب ہونے کے خوف میں مبتلا ہو جاتے ہیں۔ جدید الیکٹرک بائیکس کے بی ایل ڈی سی حب موٹرز واٹر پروف ہوتے ہیں لیکن ایک بنیادی حد پار کرنے پر خرابی ہو سکتی ہے۔',
      headings: [
        '۱. محفوظ پانی کی گہرائی (ویل ایکسل کا سنہری اصول)',
        '۲. بارش کے بعد دھلائی اور چارجنگ کا درست طریقہ'
      ],
      takeaways: [
        'پانی کی سطح موٹر کے درمیانی ایکسل سے اوپر نہیں ہونی چاہیے۔',
        'پریشر واشر سے کبھی بھی وائرنگ یا چارجنگ ساکٹ پر سیدھی دھار نہ ماریں۔',
        'چارجر لگانے سے قبل چارجنگ پورٹ کو مکمل خشک ہونے دیں۔'
      ]
    }
  },
  'ebike-battery-types-explained': {
    roman: {
      title: 'Electric Bike Battery Ki Qismein: Lead-Acid, Graphene, NMC aur LiFePO4 Ka Jaiza',
      excerpt: 'Har battery ki khasiyat, wazan, qeemat aur Pakistani mausam me chalne ki muddat ka aasan lafzon me mawazna.',
      intro: 'Pakistani market me 4 tarah ki batteries milti hain: Lead-Acid, Graphene, NMC Lithium aur LiFePO4. In sab ki qeemat aur life me zameen aasman ka farq hota hai.',
      takeaways: [
        'Lead-acid sasti hoti hai magar 1 saal se zyada nahi chalti.',
        'LiFePO4 sab se behtareen aur 5 saal se zyada chalne wali battery hai.',
        'Kharidte waqt sirf mileage na dekhein, battery k cycles check karein.'
      ]
    },
    urdu: {
      title: 'الیکٹرک بائیک کی بیٹریوں کی اقسام: لیڈ ایسڈ، گریفین، این ایم سی اور لیتھیم آئرن فاسفیٹ',
      excerpt: 'ہر بیٹری کی خصوصیات، وزن، قیمت اور پاکستانی موسم میں پائیداری کا آسان اور جامع موازنہ۔',
      intro: 'پاکستانی شو رومز پر عام طور پر 4 قسم کی بیٹریاں پیش کی جاتی ہیں۔ سستی لیڈ ایسڈ سے لے کر پائیدار لیتھیم آئرن فاسفیٹ تک، ہر بیٹری کی لائف اور لاگت کا حقیقت پسندانہ جائزہ حاضر ہے۔',
      takeaways: [
        'لیڈ ایسڈ سستی ضرور ہے مگر ایک ڈیڑھ سال میں بدلنی پڑتی ہے۔',
        'لیتھیم آئرن فاسفیٹ طویل ترین لائف اور محفوظ ترین کیمسٹری ہے۔',
        'بیٹری خریدتے وقت سائیکلز اور گرمی برداشت کرنے کی صلاحیت لازمی دیکھیں۔'
      ]
    }
  },
  '48v-vs-60v-vs-72v-ebike-battery': {
    roman: {
      title: '48V vs 60V vs 72V E-Bike Battery: Speed, Pickup aur Range Me Kya Farq Hai?',
      excerpt: 'Voltage barhne se speed aur charhai (climbing power) par kya asar parta hai? Janiye aap k shehr k liye kaunsa system behtar hai.',
      intro: 'Voltage aap ki electric bike ki taqat (torque) aur top speed tay karta hai. 48V aam tor par 40-45 km/h deti hai, jabkay 72V system 65-70 km/h tak aaram se jata hai aur do sawariyon k sath pul par aasan charhta hai.',
      takeaways: [
        'Do sawariyon aur pullon (bridges) par chalane k liye 72V system sab se kamiyab hai.',
        'Students aur halki driving k liye 48V ya 60V kafi rehta hai.',
        'Voltage barhane se pehle controller aur motor ki rating check karein.'
      ]
    },
    urdu: {
      title: '48 وولٹ بمقابلہ 60 وولٹ بمقابلہ 72 وولٹ: اسپیڈ، پک اپ اور رینج میں کیا فرق ہے؟',
      excerpt: 'وولٹیج بڑھنے سے موٹر کی رفتار اور پلوں پر چڑھائی کی صلاحیت پر کیا اثر پڑتا ہے؟ جانیے کون سا سسٹم آپ کے لیے موزوں ہے۔',
      intro: 'وولٹیج دراصل موٹر کی طاقت اور تیز رفتاری کا پیمانہ ہے۔ 48 وولٹ کا نظام 40 کلومیٹر فی گھنٹہ دیتا ہے جبکہ 72 وولٹ کا پاور فل سسٹم 65 سے 70 کلومیٹر کی رفتار اور ڈبل سواری پر زبردست پک اپ فراہم کرتا ہے۔',
      takeaways: [
        'شہری ٹریفک اور پلوں پر دو بندوں کے ساتھ 72 وولٹ کا سسٹم سب سے کامیاب ہے۔',
        'روزانہ کے قریبی سفر کے لیے 48 یا 60 وولٹ بجلی کی کم کھپت کرتا ہے۔',
        'وولٹیج میں ردوبدل سے قبل کنٹرولر اور موٹر کی حد ضرور جانچیں۔'
      ]
    }
  },
  'complete-ebike-maintenance-guide': {
    roman: {
      title: 'Pakistan Me Electric Bike Ki Mukammal Maintenance: Rozana, Haftawar aur Mahana Checklist',
      excerpt: 'Tyre pressure, brake adjustments, chain lube aur battery terminals ki sahi dekhbhal se bike ki life 3 guna barhayein.',
      intro: 'Electric bike me engine oil ya spark plug to nahi hotay, lekin tyres, brakes, wiring aur battery connection ki regular maintenance zaroori hai taake raste me bike band na ho.',
      takeaways: [
        'Rozana tyre hawa (PSI) check karein taake battery par load na aaye.',
        'Brake switch regenerator kaam kar raha hai ya nahi har haftay check karein.',
        'Har 3 mahine baad wiring connectors par contact cleaner spray karein.'
      ]
    },
    urdu: {
      title: 'پاکستان میں الیکٹرک بائیک کی مکمل دیکھ بھال: روزانہ، ہفتہ وار اور ماہانہ چیک لسٹ',
      excerpt: 'ٹائر پریشر، بریک سیٹنگز، تاروں اور بیٹری ٹرمینلز کی بروقت نگہداشت سے بائیک کی عمر 3 گنا بڑھانے کا طریقہ۔',
      intro: 'اگرچہ الیکٹرک بائیک میں پیٹرول انجن، فلٹرز یا موبل آئل کا کوئی جھنجھٹ نہیں ہوتا، لیکن بی ایل ڈی سی موٹر، بریک شو اور بیٹری کی باقاعدہ دیکھ بھال راستے میں خرابی سے بچاتی ہے۔',
      takeaways: [
        'ٹائروں میں ہوا کا دباؤ درست رکھیں تاکہ بیٹری پر غیر ضروری دباؤ نہ پڑے۔',
        'ری جنریٹو بریکنگ سوئچ اور بریک پیڈز کی باقاعدہ جانچ کریں۔',
        'برسات اور مٹی کے بعد کنیکٹرز اور چارجنگ پورٹ کی صفائی کریں۔'
      ]
    }
  },
  'ebike-battery-not-charging': {
    roman: {
      title: 'Electric Bike Charge Na Hone Ki 7 Wajuhat Aur Ghar Par Check Karne Ka Tareeqa',
      excerpt: 'Charger ki green/red light, fuse, MCB switch aur BMS cut-off ko multimeter k baghair kaise troubleshoot karein.',
      intro: 'Jab bike charger lagane par charge na le to log foran pareshan ho kar mehnge mechanic k paas jate hain. 80% mamlaat me masla bike ki main breaker (MCB) ya fuse ka hota hai jo Rs 50 me theek ho jata hai.',
      takeaways: [
        'Pehle seat k neechay wala MCB breaker switch check karein k trip to nahi hua.',
        'Charger ka fuse khol kar dekhein k kala to nahi para.',
        'Agar battery bohot garam ho to thanda hone k baad charger lagayein.'
      ]
    },
    urdu: {
      title: 'الیکٹرک بائیک چارج نہ ہونے کی 7 وجوہات اور گھر پر خود چیک کرنے کا طریقہ',
      excerpt: 'چارجر کی لائٹ نہ جلنا، فیوز اڑنا، ایم سی بی بریکر ٹرپ ہونا اور بی ایم ایس کٹ آف کا آسان ہوم ٹربل شوٹنگ طریقہ۔',
      intro: 'بائیک چارج نہ ہونے کی صورت میں فوری طور پر مہنگے مستری کے پاس جانے کی ضرورت نہیں ہوتی۔ اکثر اوقات صرف سیٹ کے نیچے دیا گیا بریکر ٹرپ ہوتا ہے یا پلگ میں خرابی ہوتی ہے جو منٹوں میں حل ہو جاتی ہے۔',
      takeaways: [
        'سب سے پہلے سیٹ کے نیچے لگے ہوئے ایم سی بی بریکر کی پوزیشن دیکھیں۔',
        'چارجر ساکٹ کے فیوز اور پنوں پر کاربن کی صفائی کریں۔',
        'سخت گرمی کے سفر کے فوراً بعد بیٹری کو 20 منٹ ٹھنڈا ہونے کا وقت دیں۔'
      ]
    }
  },
  'ebike-throttle-not-working': {
    roman: {
      title: 'Electric Bike Ka Race / Throttle Kaam Na Kare To Kya Karein? Hall Sensor Fault',
      excerpt: 'Handle ghumaane par bike aage na barhe to brake sensor cut-off, loose wire aur accelerator muthi ko kaise theek karein.',
      intro: 'Electric bike me throttle me magnetic Hall effect sensor hota hai. Aksar brake lever thora sa phans jata hai jis se controller motor ki bijli cut kar deta hai aur accelerator kaam nahi karta.',
      takeaways: [
        'Brake levers ko aage dhakel kar dekhein k kahin brake cut-off switch to nahi daba hua.',
        'Handle k neechay throttle wire k 3 pins (Red, Black, Green) connector ko hila kar check karein.',
        'Naya throttle Rs 800 se 1,200 me kisi bhi EV shop se mil jata hai.'
      ]
    },
    urdu: {
      title: 'الیکٹرک بائیک کا ایکسلریٹر (تھروٹل) کام نہ کرے تو کیا کریں؟ ہال سینسر ٹربل شوٹنگ',
      excerpt: 'ہینڈل گھمانے پر موٹر کا حرکت نہ کرنا: بریک کٹ آف سوئچ، لوز کنکشن اور ایکسلریٹر گرفت کی مرمت کا طریقہ۔',
      intro: 'الیکٹرک بائیک کا ایکسلریٹر عام پیٹرول بائیک کی تار کی طرح نہیں بلکہ برقی ہال سینسر پر کام کرتا ہے۔ اکثر اوقات بریک لیور معمولی سا دبا رہنے سے بائیک کٹ آف موڈ میں چلی جاتی ہے اور ریس نہیں پکڑتی۔',
      takeaways: [
        'دونوں بریک لیورز کو آگے کی طرف جھٹکا دے کر چیک کریں تاکہ کٹ آف سوئچ آزاد ہو جائے۔',
        'ہینڈل کے نیچے تین تاروں والے ایکسلریٹر کنیکٹر کو چیک کریں۔',
        'تھروٹل خراب ہونے کی صورت میں یہ مارکیٹ سے باآسانی مناسب قیمت پر مل جاتا ہے۔'
      ]
    }
  },
  'lithium-ion-vs-lead-acid-battery': {
    roman: {
      title: 'Lithium-Ion vs Lead-Acid Battery: E-Bike K Liye Konsi Battery Behtar Hai?',
      excerpt: 'Wazan, charging time, mileage aur lambi muddat chalne ka mukammal hisab. Lead-acid sasti kiyun parta hai magar lambay arsay me mehnga?',
      intro: 'Aksar Pakistani log shuru me sasti lead-acid battery le letay hain. Lekin 1 saal k baad jab battery kamzor hoti hai to pachtate hain. Lithium battery wazan me 70% halki aur 3 guna lambi chalti hai.',
      takeaways: [
        'Lead-acid 30-40 kg bhari hoti hai jo bike k suspension aur tyres ko nuqsan deti hai.',
        'Lithium 3 se 4 saal sukoon se chalti hai aur jaldi charge hoti hai.',
        'Lambi muddat me lithium ka per kilometer kharcha lead-acid se aadha hai.'
      ]
    },
    urdu: {
      title: 'لیتھیم آئن بمقابلہ لیڈ ایسڈ بیٹری: الیکٹرک بائیک کے لیے کون سا انتخاب دانشمندانہ ہے؟',
      excerpt: 'وزن، چارجنگ اسپیڈ، مائلیج اور طویل مدتی لاگت کا غیر جانبدارانہ موازنہ۔ لیڈ ایسڈ شروع میں سستی مگر بعد میں کیوں مہنگی پڑتی ہے؟',
      intro: 'اکثر خریدار ابتدائی قیمت دیکھ کر پرانی ٹیکنالوجی والی لیڈ ایسڈ یا جیل بیٹری خرید لیتے ہیں۔ تاہم ایک سال کے اندر اس کی رینج آدھی رہ جاتی ہے جبکہ لیتھیم آئن بیٹری 70 فیصد ہلکی ہونے کے ساتھ 3 گنا طویل زندگی فراہم کرتی ہے۔',
      takeaways: [
        'لیڈ ایسڈ کا 35 کلو وزنی بوجھ بائیک کے فریم، ٹائروں اور موٹر کو تھکا دیتا ہے۔',
        'لیتھیم آئن بیٹری 3 سے 4 سال بلا تعطل تیز رفتار چارجنگ کی سہولت دیتی ہے۔',
        'طویل مدت میں فی کلومیٹر خرچ کے اعتبار سے لیتھیم بیٹری ہمیشہ سستی ثابت ہوتی ہے۔'
      ]
    }
  },
  '10ah-vs-20ah-vs-30ah-battery': {
    roman: {
      title: '10Ah vs 20Ah vs 30Ah Battery: Range Aur Mileage Me Kitna Farq Hai?',
      excerpt: 'Ampere-hour (Ah) ka aasan matlab bike ki petrol tanki ka size hai. Janiye aap k daily safar k liye kitne Ah ki battery kafi hogi.',
      intro: 'Ampere-Hour (Ah) battery ki capacity batata hai. Jaise petrol bike me 5 liter ya 9 liter ki tanki hoti hai, waise hi electric bike me 10Ah, 20Ah aur 30Ah hota hai.',
      takeaways: [
        '10Ah battery sirf 25-30 km deti hai (qaribi safar k liye).',
        '20Ah battery 55-65 km deti hai (office commute k liye behtareen).',
        '30Ah battery 85-105 km deti hai (Bykea aur lambay safar k liye zaroori).'
      ]
    },
    urdu: {
      title: '10Ah بمقابلہ 20Ah بمقابلہ 30Ah بیٹری: رینج اور مائلیج میں اصل فرق کیا ہے؟',
      excerpt: 'ایمپیئر آور (Ah) کا آسان مطلب پیٹرول ٹینکی کی گنجائش ہے۔ جانیے آپ کے روزمرہ سفر کے لیے کتنے ایمپیئر کی بیٹری کافی رہے گی۔',
      intro: 'بیٹری کے ساتھ لکھا ہوا Ah دراصل اس کی توانائی ذخیرہ کرنے کی صلاحیت ہے۔ جس طرح 70 سی سی بائیک میں 9 لیٹر کی ٹینکی ہوتی ہے، اسی طرح 20 یا 30 ایمپیئر آور کی بیٹری ایک چارج پر زیادہ کلومیٹر کا فاصلہ طے کرتی ہے۔',
      takeaways: [
        '10Ah بیٹری محض 25 تا 30 کلومیٹر رینج دیتی ہے (قریبی سودا سلف لانے کے لیے)۔',
        '20Ah بیٹری روزانہ 55 تا 65 کلومیٹر کا معیاری دفتری سفر بخوبی کراتی ہے۔',
        '30Ah بیٹری ڈلیوری رائیڈرز کے لیے 85 تا 105 کلومیٹر کی شاندار رینج فراہم کرتی ہے۔'
      ]
    }
  },
  'ebike-battery-price-in-pakistan': {
    roman: {
      title: 'Pakistan Me E-Bike Battery Ki Taza Tareen Qemat (2026 Price List)',
      excerpt: '48V, 60V aur 72V dry gel lead-acid aur lithium packs ki Hall Road Lahore aur Saddar Karachi ki market rates.',
      intro: 'Pakistan me battery ki qeemat dollar aur local demand par munhasir hai. 2026 me dry lead-acid Rs 40,000 se shuru hoti hai jabkay standard lithium pack Rs 90,000 se Rs 160,000 tak milta hai.',
      takeaways: [
        'Lead-acid set (60V 20Ah) taqreeban Rs 42,000 se Rs 52,000 me milta hai.',
        'LiFePO4 72V 30Ah pack smart BMS k sath Rs 135,000 se Rs 165,000 tak dastyab hai.',
        'Hamesha grade-A prismatic cells aur original warranty card ki tasdeeq karein.'
      ]
    },
    urdu: {
      title: 'پاکستان میں الیکٹرک بائیک بیٹری کی تازہ ترین قیمتیں (2026 مارکیٹ ریٹ لسٹ)',
      excerpt: '48 وولٹ، 60 وولٹ اور 72 وولٹ ڈرائی جیل اور لیتھیم پیکس کی ہال روڈ لاہور اور صدر کراچی کے مستند نرخ۔',
      intro: 'پاکستان میں الیکٹرک بائیک بیٹریوں کے نرخ بیٹری کی قسم، کیمسٹری اور بی ایم ایس کوالٹی پر منحصر ہیں۔ گریفین ڈرائی بیٹریاں 40 سے 55 ہزار روپے جبکہ جدید لیتھیم پیکس 90 ہزار سے ڈیڑھ لاکھ روپے تک دستیاب ہیں۔',
      takeaways: [
        'لیڈ ایسڈ 60 وولٹ 20 ایمپیئر سیٹ تقریباً 45 تا 52 ہزار روپے میں آتا ہے۔',
        'لیتھیم آئرن فاسفیٹ 72 وولٹ 30 ایمپیئر پیک سمارٹ بی ایم ایس کے ساتھ سوا لاکھ سے اوپر ہے۔',
        'ہمیشہ مستند سیلز اور امپورٹڈ فیکٹری پیک ہی خریدیں جن کی تحریری وارنٹی ہو۔'
      ]
    }
  },
  'ebike-motor-maintenance': {
    roman: {
      title: 'BLDC Hub Motor Ki Maintenance: Bearing, Paani Aur Awaz Ka Ilaj',
      excerpt: 'Pichlay pahiye me lagi motor ki saaf safai, rust se hifazat aur magnetic coil ki lambi umar k aasan tareeqay.',
      intro: 'Electric bike ki motor pichlay pahiye k hub me fit hoti hai. Is me koi carbon brush ya piston nahi hota, is liye yeh 10 saal tak chal sakti hai agar paani aur bearing jam hone se bachaya jaye.',
      takeaways: [
        'Motor bearing me har 6 mahine baad waterproof grease lagwayein.',
        'Agar motor se gar gar ki awaz aaye to pahiye ka nut foran check karein.',
        'Pani k andar se nikalne k baad motor hub ko kapray se saaf karein.'
      ]
    },
    urdu: {
      title: 'بی ایل ڈی سی ہب موٹر کی دیکھ بھال: بیرنگ، نمی اور عجیب آوازوں کا مکمل علاج',
      excerpt: 'پچھلے پہیے میں لگی ہب موٹر کی بیرونی صفائی، زنگ سے بچاؤ اور کوائل کی طویل زندگی کے سنہری اصول۔',
      intro: 'الیکٹرک بائیک کی موٹر پچھلے پہیے کے اندر سیل بند ہوتی ہے۔ اس میں کوئی کاربن برش، موبل آئل یا پسٹن نہیں ہوتا جس کے باعث اس کی قدرتی عمر 10 سال سے زائد ہوتی ہے بشرطیکہ اسے اندرونی نمی اور بیرنگ جام ہونے سے بچایا جائے۔',
      takeaways: [
        'موٹر کے دونوں سائیڈ بیرنگز پر ہر 6 ماہ بعد معیاری واٹر پروف گریس کروائیں۔',
        'موٹر سے گڑگڑاہٹ کی آواز آنے پر پچھلے ایکسل کے نٹ بولٹ فوری ٹائٹ کریں۔',
        'برساتی پانی سے گزرنے کے بعد موٹر کے حب کو خشک کپڑے سے صاف کریں۔'
      ]
    }
  },
  'ebike-battery-draining-quickly': {
    roman: {
      title: 'Electric Bike Ki Battery Jaldi Khatam Hone Ki Wajuhat Aur Hal',
      excerpt: 'Pehle 70 km deti thi ab sirf 35 km kiyun? Tyre PSI, brake rub, cell unbalance aur BMS setting ka test.',
      intro: 'Jab achhi khasi bike ki range achanak aadhi reh jaye to aksar log samajhte hain battery mar gayi. Lekin 70% cases me masla tyre me kam hawa ya pichlay brake k phansne ka hota hai jo motor ko kheenchta hai.',
      takeaways: [
        'Pehle bike ko double stand par khari kar k pichla pahiya haath se ghuma kar dekhein k jam to nahi.',
        'Tyres me 36-38 PSI hawa poori rakhein.',
        'Lithium pack me agar aik cell kamzor ho jaye to cell balancing karwayein.'
      ]
    },
    urdu: {
      title: 'الیکٹرک بائیک کی بیٹری تیزی سے ختم ہونے کی وجوہات اور مکمل سدباب',
      excerpt: 'پہلے 70 کلومیٹر چلتی تھی اب صرف 35 کلومیٹر کیوں؟ ٹائر پریشر، بریک رگڑ، سیل غیر متوازن ہونا اور بی ایم ایس جانچ۔',
      intro: 'جب چلتی ہوئی بائیک کی مائلیج اچانک کم ہو جائے تو گھبرانے کی ضرورت نہیں ہوتی۔ اکثر اوقات موٹر پر ٹائر کی کم ہوا یا ڈسک بریک کے چمٹے رہنے کا اضافی بوجھ ہوتا ہے جو بیٹری کا کرنٹ تیزی سے نچوڑ لیتا ہے۔',
      takeaways: [
        'ڈبل اسٹینڈ پر بائیک کھڑی کر کے پچھلے پہیے کو ہاتھ سے گھما کر چیک کریں کہ بریک پھنسا ہوا تو نہیں۔',
        'ٹائروں میں ہمیشہ 36 تا 38 پی ایس آئی ہوا کا دباؤ برقرار رکھیں۔',
        'لیتھیم بیٹری کے لیے کسی مستند ٹیکنیشن سے سیل بیلنسنگ ٹیسٹ کروائیں۔'
      ]
    }
  },
  'ebike-service-repair-guide-pakistan': {
    roman: {
      title: 'Pakistan Me Electric Bike Kahan Se Repair Karwayein? Mechanic Guide',
      excerpt: 'Aam 70cc mechanics vs EV specialists: Hall Road, Saddar aur local workshops me sahi spare parts aur service.',
      intro: 'Pakistan me har gali me CD70 ka mechanic to mil jata hai lekin electric bike ki controller wiring aur BMS ko har koi nahi samajhta. Galat mechanic se taarein jorwane par controller jalne ka khatra hota hai.',
      takeaways: [
        'Mechanical kaam (tyre, chimta, shock, brake) aam mechanic se karwayein.',
        'Electrical wiring, controller aur battery ka kaam sirf certified EV technician se karwayein.',
        'Hamare Dealership & Service Locator se apne shehr k verified centers talash karein.'
      ]
    },
    urdu: {
      title: 'پاکستان میں الیکٹرک بائیک کہاں سے ریپیئر کروائیں؟ مکینک اور ورکشاپ گائیڈ',
      excerpt: 'عام پیٹرول بائیک مکینک بمقابلہ مستند ای وی ایکسپرٹس: اسپیئر پارٹس، کنٹرولر کی وائرنگ اور بی ایم ایس مرمت۔',
      intro: 'پاکستان کے گلی کوچوں میں پیٹرول بائیک کا مستری تو باآسانی مل جاتا ہے لیکن الیکٹرک بائیک کے حساس کنٹرولر، تھروٹل اور لتھیم بی ایم ایس کی سمجھ بوجھ ہر کسی کے پاس نہیں ہوتی۔ اناڑی کاریگر سے وائرنگ چھڑوانے پر کنٹرولر جل سکتا ہے۔',
      takeaways: [
        'مکینیکل کام جیسے ٹائر پنکچر، جھولے اور بریک شو کسی بھی عام مستری سے کروائے جا سکتے ہیں۔',
        'کنٹرولر، بیٹری پیک اور برقی تاروں کا کام صرف مستند الیکٹرک بائیک ڈیلر سے کروائیں۔',
        'اپنے شہر کی قریبی تصدیق شدہ ورکشاپس کے لیے ہمارا ڈیلرشپ و سروس لوکیٹر استعمال کریں۔'
      ]
    }
  }
};

// Comprehensive vocabulary for automated translation of any other post
const ROMAN_TERMS: Record<string, string> = {
  'Battery': 'Battery',
  'Electric Bike': 'Electric Bike',
  'Maintenance': 'Dekhbhal',
  'Charging': 'Charging',
  'Troubleshooting': 'Maslay Ka Hal',
  'Guide': 'Rahnumai / Guide',
  'Lifespan': 'Umar / Life',
  'Capacity': 'Gunjayesh / Capacity',
  'Cost': 'Kharcha / Qeemat',
  'Price in Pakistan': 'Pakistan Me Qeemat',
  'Replacement': 'Tabdeeli / Replacement',
  'Motor': 'Motor',
  'Controller': 'Controller',
  'Throttle': 'Accelerator / Throttle',
  'Brakes': 'Brakes',
  'Tyre': 'Tyre',
  'Puncture': 'Puncture',
  'Summer': 'Garmi Ka Mausam',
  'Overheating': 'Ziada Garam Hona',
  'Range': 'Mileage / Range',
  'Decreased': 'Kam Hona',
  'Warranty': 'Warranty',
  'Problems': 'Masail / Kharabi',
  'Not Working': 'Kaam Na Karna',
  'Not Charging': 'Charge Na Hona',
  'Not Turning On': 'On Na Hona'
};

const URDU_TERMS: Record<string, string> = {
  'Battery': 'بیٹری',
  'Electric Bike': 'الیکٹرک بائیک',
  'Maintenance': 'دیکھ بھال و مرمت',
  'Charging': 'چارجنگ',
  'Troubleshooting': 'مسئلے کا حل',
  'Guide': 'مکمل گائیڈ',
  'Lifespan': 'مدت و لائف',
  'Capacity': 'گنجائش و صلاحیت',
  'Cost': 'لاگت و خرچ',
  'Price in Pakistan': 'پاکستان میں قیمت',
  'Replacement': 'تبدیلی کا خرچ',
  'Motor': 'موٹر',
  'Controller': 'کنٹرولر',
  'Throttle': 'ایکسلریٹر / تھروٹل',
  'Brakes': 'بریک سسٹم',
  'Tyre': 'ٹائر',
  'Puncture': 'پنکچر سے بچاؤ',
  'Summer': 'موسم گرما',
  'Overheating': 'شدید گرم ہونا',
  'Range': 'مائلیج و رینج',
  'Decreased': 'کمی واقع ہونا',
  'Warranty': 'وارنٹی کے اصول',
  'Problems': 'عام خرابیاں اور حل',
  'Not Working': 'کام نہ کرنا',
  'Not Charging': 'چارج نہ ہونا',
  'Not Turning On': 'آن نہ ہونا'
};

// Smart sentence translation helper for any blog post
export const getTranslatedPost = (post: BlogPost, lang: BlogLanguage): BlogPost => {
  if (lang === 'en') return post;

  const curated = CURATED_TRANSLATIONS[post.id];

  if (lang === 'roman') {
    const romanTitle = curated?.roman?.title || translateToRomanUrduTitle(post.title);
    const romanExcerpt = curated?.roman?.excerpt || translateToRomanUrduExcerpt(post.excerpt);
    const romanIntro = curated?.roman?.intro || post.content.introduction;
    const romanTakeaways = curated?.roman?.takeaways || post.content.takeaways;

    return {
      ...post,
      title: romanTitle,
      excerpt: romanExcerpt,
      category: CATEGORY_TRANSLATIONS[post.category]?.roman || post.category,
      content: {
        ...post.content,
        introduction: romanIntro,
        sections: post.content.sections.map((sec, idx) => ({
          ...sec,
          heading: curated?.roman?.headings?.[idx] || sec.heading,
          callout: curated?.roman?.callout && idx === 0 ? curated.roman.callout : sec.callout
        })),
        takeaways: romanTakeaways
      }
    };
  }

  // Urdu (Direct Urdu Fonts)
  const urduTitle = curated?.urdu?.title || translateToUrduTitle(post.title);
  const urduExcerpt = curated?.urdu?.excerpt || translateToUrduExcerpt(post.excerpt);
  const urduIntro = curated?.urdu?.intro || post.content.introduction;
  const urduTakeaways = curated?.urdu?.takeaways || post.content.takeaways;

  return {
    ...post,
    title: urduTitle,
    excerpt: urduExcerpt,
    category: CATEGORY_TRANSLATIONS[post.category]?.urdu || post.category,
    content: {
      ...post.content,
      introduction: urduIntro,
      sections: post.content.sections.map((sec, idx) => ({
        ...sec,
        heading: curated?.urdu?.headings?.[idx] || sec.heading,
        callout: curated?.urdu?.callout && idx === 0 ? curated.urdu.callout : sec.callout
      })),
      takeaways: urduTakeaways
    }
  };
};

function translateToRomanUrduTitle(title: string): string {
  let res = title;
  res = res.replace(/Guide/gi, 'Rahnumai');
  res = res.replace(/How to Maintain/gi, 'Dekhbhal Ka Sahi Tareeqa:');
  res = res.replace(/Common (.*) Problems/gi, '$1 K Aam Masail Aur Hal');
  res = res.replace(/Not Working/gi, 'Kaam Na Kare To Kya Karein');
  res = res.replace(/Replacement Cost in Pakistan/gi, 'Pakistan Me Tabdeeli Ka Kharcha');
  res = res.replace(/Price in Pakistan/gi, 'Pakistan Me Qeemat');
  res = res.replace(/How Long Does (.*) Last/gi, '$1 Kitne Saal Chalti Hai?');
  res = res.replace(/How to Increase (.*) Life/gi, '$1 Ki Life Barhane Ka Tareeqa');
  res = res.replace(/How to Properly Charge/gi, 'Charge Karne Ka Sahi Tareeqa');
  res = res.replace(/Charging Time/gi, 'Charging Time Aur Speed');
  res = res.replace(/Charging Cost/gi, 'Charging Ka Kharcha Aur Bill');
  res = res.replace(/How to Check (.*) Health/gi, '$1 Ki Sehat (Health) Kaise Check Karein?');
  res = res.replace(/Overheating Problems/gi, 'Overheating Aur Garmi Se Hifazat');
  res = res.replace(/Sudden Range Drop/gi, 'Range Kam Hone Ki Wajuhat');
  res = res.replace(/Draining Quickly/gi, 'Jaldi Khatam Hone Ka Hal');
  return res;
}

function translateToRomanUrduExcerpt(excerpt: string): string {
  let res = excerpt;
  res = res.replace(/A complete step-by-step troubleshooting guide/gi, 'Pakistan me electric bike k masail hal karne ki mukammal step-by-step guide.');
  res = res.replace(/Understand the differences in capacity/gi, 'Capacity, range aur kharchay ka aasan Pakistani mawazna.');
  return res;
}

function translateToUrduTitle(title: string): string {
  let res = title;
  res = res.replace(/Guide/gi, 'رہنمائی');
  res = res.replace(/How to Maintain/gi, 'دیکھ بھال اور حفاظت کا درست طریقہ:');
  res = res.replace(/Common (.*) Problems/gi, '$1 کے عام مسائل اور ان کا آسان حل');
  res = res.replace(/Not Working/gi, 'کام نہ کرے تو کیا کریں؟');
  res = res.replace(/Replacement Cost in Pakistan/gi, 'پاکستان میں تبدیلی کی اصل لاگت');
  res = res.replace(/Price in Pakistan/gi, 'پاکستان میں تازہ ترین قیمت');
  res = res.replace(/How Long Does (.*) Last/gi, '$1 کتنے سال ساتھ نبھاتی ہے؟');
  res = res.replace(/How to Increase (.*) Life/gi, '$1 کی لائف بڑھانے کا طریقہ');
  res = res.replace(/How to Properly Charge/gi, 'چارج کرنے کے سنہری اصول');
  res = res.replace(/Charging Time/gi, 'چارجنگ کا دورانیہ اور رفتار');
  res = res.replace(/Charging Cost/gi, 'چارجنگ کا ماہانہ خرچ اور بجلی کا بل');
  res = res.replace(/How to Check (.*) Health/gi, '$1 کی صحت و صلاحیت جانچنے کا طریقہ');
  res = res.replace(/Overheating Problems/gi, 'شدید گرمی اور اوور ہیٹنگ سے بچاؤ');
  res = res.replace(/Sudden Range Drop/gi, 'مائلیج اچانک کم ہونے کی وجوہات');
  res = res.replace(/Draining Quickly/gi, 'بیٹری تیزی سے ختم ہونے کا سدباب');
  res = res.replace(/Electric Bike/gi, 'الیکٹرک بائیک');
  res = res.replace(/Battery/gi, 'بیٹری');
  res = res.replace(/Motor/gi, 'موٹر');
  res = res.replace(/Controller/gi, 'کنٹرولر');
  res = res.replace(/Brake/gi, 'بریک');
  res = res.replace(/Tyre/gi, 'ٹائر');
  return res;
}

function translateToUrduExcerpt(excerpt: string): string {
  return 'پاکستانی سڑکوں، معاشی حقائق اور گرم موسم کے مطابق مکمل تفصیلی اور آسان رہنمائی۔';
}
