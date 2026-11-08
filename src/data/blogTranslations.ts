import { BlogPost } from '../components/BlogsPage';

export type BlogLanguage = 'en' | 'roman';

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
  }
];

export const CATEGORY_TRANSLATIONS: Record<string, { roman: string }> = {
  'All': {
    roman: 'Tamam Guides'
  },
  '🔋 Battery & Chemistry': {
    roman: '🔋 Battery & Chemistry'
  },
  '🔧 Maintenance & Repairs': {
    roman: '🔧 Dekhbhal & Repairs'
  },
  '⚡ Tariffs & Charging': {
    roman: '⚡ Bijli Tariffs & Charging'
  },
  '🛵 Buyer Guides': {
    roman: '🛵 Khareedari Guides'
  }
};

export const UI_TRANSLATIONS: Record<BlogLanguage, {
  badge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  backToArticles: string;
  relatedToolPrompt: string;
  shareBtn: string;
  keyTakeaways: string;
  articlesCount: string;
  showingCategory: string;
  copiedNotice: string;
  readArticle: string;
  closeBtn: string;
  authorLabel: string;
  takeawaysTitle: string;
}> = {
  en: {
    badge: 'Pakistan EV Intelligence & Knowledgebase',
    heroTitle: 'Electric Vehicle',
    heroHighlight: 'Expert Guides & Insights',
    heroSubtitle: 'In-depth analytical articles, battery maintenance walkthroughs, NEPRA tariff analysis, and range optimization tips for Pakistani EV owners.',
    searchPlaceholder: 'Search articles by topic, battery type, or repair guide...',
    backToArticles: '← Back to All Articles',
    relatedToolPrompt: 'Try Related Interactive Tool:',
    shareBtn: 'Share Guide',
    keyTakeaways: 'Key Takeaways & Summary',
    articlesCount: 'Articles Collection',
    showingCategory: 'Showing Category',
    copiedNotice: 'Link Copied!',
    readArticle: 'Read Full Guide',
    closeBtn: 'Close',
    authorLabel: 'Author',
    takeawaysTitle: 'Key Takeaways'
  },
  roman: {
    badge: 'Pakistan EV Intelligence & Knowledgebase',
    heroTitle: 'Electric Vehicle',
    heroHighlight: 'Expert Guides & Insights',
    heroSubtitle: 'Pakistan ki sarko, batteries, WAPDA charging aur maintenance par mukammal maloomati articles.',
    searchPlaceholder: 'Articles search karein (e.g. Battery, Charging, Maintenance)...',
    backToArticles: '← Wapas Tamam Articles Par',
    relatedToolPrompt: 'Mutalliqah Interactive Tool Istamal Karein:',
    shareBtn: 'Guide Share Karein',
    keyTakeaways: 'Ahem Nukaat (Key Takeaways)',
    articlesCount: 'Articles Collection',
    showingCategory: 'Showing Category',
    copiedNotice: 'Link Copied!',
    readArticle: 'Read Full Guide',
    closeBtn: 'Close',
    authorLabel: 'Author',
    takeawaysTitle: 'Key Takeaways'
  }
};

export function getTranslatedPost(post: BlogPost, lang: BlogLanguage): BlogPost {
  if (lang === 'en') return post;

  return {
    ...post,
    title: translateToRoman(post.title),
    excerpt: translateToRoman(post.excerpt),
    content: {
      introduction: translateToRoman(post.content.introduction),
      sections: post.content.sections.map(sec => ({
        heading: translateToRoman(sec.heading),
        body: sec.body.map(p => translateToRoman(p)),
        callout: sec.callout ? translateToRoman(sec.callout) : undefined,
        table: sec.table ? {
          headers: sec.table.headers.map(h => translateToRoman(h)),
          rows: sec.table.rows.map(row => row.map(cell => translateToRoman(cell)))
        } : undefined
      })),
      takeaways: post.content.takeaways.map(t => translateToRoman(t))
    }
  };
}

function translateToRoman(text: string): string {
  let res = text;
  res = res.replace(/Guide/gi, 'Rahnumai');
  res = res.replace(/How to Maintain/gi, 'Dekhbhal aur hifazat ka tareeqa:');
  res = res.replace(/Common (.*) Problems/gi, '$1 ke ahem masail aur hal');
  res = res.replace(/Not Working/gi, 'Kaam na kare to kya karein?');
  res = res.replace(/Replacement Cost in Pakistan/gi, 'Pakistan mein tabdeeli ki asal lagat');
  res = res.replace(/Price in Pakistan/gi, 'Pakistan mein taza tareen qeemat');
  res = res.replace(/How Long Does (.*) Last/gi, '$1 kitne saal chalti hai?');
  res = res.replace(/How to Increase (.*) Life/gi, '$1 ki life barhany ka tareeqa');
  res = res.replace(/How to Properly Charge/gi, 'Charge karne ke behtareen usool');
  res = res.replace(/Charging Time/gi, 'Charging ka waqt aur raftaar');
  res = res.replace(/Charging Cost/gi, 'Charging ka mahana kharch aur bijli ka bill');
  res = res.replace(/How to Check (.*) Health/gi, '$1 ki health check karne ka tareeqa');
  res = res.replace(/Overheating Problems/gi, 'Gharmi aur overheating se bachao');
  res = res.replace(/Sudden Range Drop/gi, 'Mileage achanak kam hone ki wajohat');
  res = res.replace(/Draining Quickly/gi, 'Battery tezi se khatam hone ka hal');
  res = res.replace(/Electric Bike/gi, 'Electric Bike');
  res = res.replace(/Battery/gi, 'Battery');
  res = res.replace(/Motor/gi, 'Motor');
  res = res.replace(/Controller/gi, 'Controller');
  res = res.replace(/Brake/gi, 'Brake');
  res = res.replace(/Tyre/gi, 'Tyre');
  return res;
}
