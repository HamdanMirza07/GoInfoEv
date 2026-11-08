import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Zap, 
  Calculator, 
  ShieldAlert, 
  Sun, 
  Bike,
  ExternalLink,
  Languages,
  Type,
  Filter,
  Check
} from 'lucide-react';
import { TabType } from './Navbar';
import { ALL_BLOG_POSTS, BLOG_CATEGORIES, getCategoryCount } from '../data/allBlogPosts';
import { 
  BlogLanguage, 
  BLOG_LANGUAGES, 
  CATEGORY_TRANSLATIONS, 
  UI_TRANSLATIONS, 
  getTranslatedPost 
} from '../data/blogTranslations';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  relatedTool: TabType;
  relatedToolLabel: string;
  featured?: boolean;
  content: {
    introduction: string;
    sections: {
      heading: string;
      body: string[];
      table?: {
        headers: string[];
        rows: string[][];
      };
      callout?: string;
    }[];
    takeaways: string[];
  };
}

interface BlogsPageProps {
  onNavigate: (tab: TabType) => void;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large'>('normal');

  // Reading language state: 'en' | 'roman' | 'urdu'
  const [selectedLanguage, setSelectedLanguage] = useState<BlogLanguage>(() => {
    try {
      const saved = localStorage.getItem('goinfoev_blog_language');
      if (saved === 'roman' || saved === 'urdu' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const handleLanguageChange = (lang: BlogLanguage) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem('goinfoev_blog_language', lang);
    } catch {
      // ignore
    }
  };

  const categories = BLOG_CATEGORIES;
  const articles = ALL_BLOG_POSTS;
  const ui = UI_TRANSLATIONS[selectedLanguage];
  const isUrdu = selectedLanguage === 'urdu';
  const isRoman = selectedLanguage === 'roman';

  const getCategoryBadgeClass = (category: string) => {
    if (category.includes('Battery') || category.includes('بیٹری')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (category.includes('Maintenance') || category.includes('دیکھ بھال') || category.includes('Dekhbhal')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (category.includes('Tariffs') || category.includes('ٹیرف') || category.includes('Bijli')) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    if (category.includes('Gig') || category.includes('رائیڈرز') || category.includes('Delivery')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (category.includes('Buyer') || category.includes('خریداری') || category.includes('Khareedari')) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (category.includes('Solar') || category.includes('سولر')) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  const getCategoryLabel = (cat: string) => {
    if (selectedLanguage === 'en') return cat;
    const trans = CATEGORY_TRANSLATIONS[cat];
    if (!trans) return cat;
    return selectedLanguage === 'urdu' ? trans.urdu : trans.roman;
  };

  // Translate all articles for display according to active language
  const translatedArticles = useMemo(() => {
    return articles.map((post) => getTranslatedPost(post, selectedLanguage));
  }, [articles, selectedLanguage]);

  // Comprehensive 7-category cards with full translations and counts
  const categoryCards = [
    {
      id: 'All',
      icon: '🌟',
      titleEn: 'All Guides',
      titleRoman: 'Tamam Guides',
      titleUrdu: 'تمام مضامین',
      descEn: 'All 40 In-Depth Guides',
      descRoman: 'Tamam 40 Guides',
      descUrdu: 'تمام 40 تفصیلی گائیڈز',
      bgGradient: 'from-blue-50 via-indigo-50 to-blue-50 border-blue-200 text-blue-950',
      activeRing: 'ring-4 ring-blue-600 border-blue-600 bg-blue-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-blue-700',
      badgeBg: 'bg-blue-100 text-blue-800',
      count: getCategoryCount('All')
    },
    {
      id: '🔋 Battery & Chemistry',
      icon: '🔋',
      titleEn: 'Battery & Chemistry',
      titleRoman: 'Battery & Chemistry',
      titleUrdu: 'بیٹری اور کیمسٹری',
      descEn: '15 In-Depth Tech Guides',
      descRoman: '15 Battery Guides',
      descUrdu: '15 معلوماتی مضامین',
      bgGradient: 'from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-950',
      activeRing: 'ring-4 ring-emerald-600 border-emerald-600 bg-emerald-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      count: getCategoryCount('🔋 Battery & Chemistry')
    },
    {
      id: '🔧 Maintenance & Repairs',
      icon: '🔧',
      titleEn: 'Maintenance & Repairs',
      titleRoman: 'Dekhbhal aur Repairs',
      titleUrdu: 'دیکھ بھال اور مرمت',
      descEn: '20 Troubleshooting Guides',
      descRoman: '20 Fault Hal Guides',
      descUrdu: '20 فالٹ حل گائیڈز',
      bgGradient: 'from-amber-50 via-orange-50 to-amber-50 border-amber-200 text-amber-950',
      activeRing: 'ring-4 ring-amber-600 border-amber-600 bg-amber-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800',
      count: getCategoryCount('🔧 Maintenance & Repairs')
    },
    {
      id: '⚡ Tariffs & Charging',
      icon: '⚡',
      titleEn: 'Tariffs & Charging',
      titleRoman: 'Bijli Tariffs aur Charging',
      titleUrdu: 'بجلی ٹیرف اور چارجنگ',
      descEn: 'WAPDA & K-Electric Slabs',
      descRoman: 'Peak vs Off-Peak Slabs',
      descUrdu: 'واپڈا و کے-الیکٹرک سلیبس',
      bgGradient: 'from-cyan-50 via-sky-50 to-cyan-50 border-cyan-200 text-cyan-950',
      activeRing: 'ring-4 ring-cyan-600 border-cyan-600 bg-cyan-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-cyan-700',
      badgeBg: 'bg-cyan-100 text-cyan-800',
      count: getCategoryCount('⚡ Tariffs & Charging')
    },
    {
      id: '🛵 Buyer Guides',
      icon: '🛵',
      titleEn: 'Buyer Guides',
      titleRoman: 'Khareedari Guides',
      titleUrdu: 'خریداری گائیڈز',
      descEn: 'Top Models & Specs Checklist',
      descRoman: 'Bikes Checklists & Specs',
      descUrdu: 'بہترین ماڈلز اور چیک لسٹ',
      bgGradient: 'from-indigo-50 via-violet-50 to-indigo-50 border-indigo-200 text-indigo-950',
      activeRing: 'ring-4 ring-indigo-600 border-indigo-600 bg-indigo-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      count: getCategoryCount('🛵 Buyer Guides')
    },
    {
      id: '📦 Gig Economy',
      icon: '📦',
      titleEn: 'Gig Economy',
      titleRoman: 'Delivery Riders Bachat',
      titleUrdu: 'رائیڈرز اور روزگار',
      descEn: 'Bykea & Delivery Savings',
      descRoman: 'Bykea & Foodpanda Profit',
      descUrdu: 'بائیکیا و ان ڈرائیو منافع',
      bgGradient: 'from-purple-50 via-fuchsia-50 to-purple-50 border-purple-200 text-purple-950',
      activeRing: 'ring-4 ring-purple-600 border-purple-600 bg-purple-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800',
      count: getCategoryCount('📦 Gig Economy')
    },
    {
      id: '☀️ Solar & Green',
      icon: '☀️',
      titleEn: 'Solar & Green',
      titleRoman: 'Solar Panel & Free Charging',
      titleUrdu: 'سولر اور ماحول دوست',
      descEn: 'Zero-Cost Free Charging',
      descRoman: 'Zero Rupay Charging',
      descUrdu: 'مفت سولر چارجنگ فارمولا',
      bgGradient: 'from-yellow-50 via-amber-50 to-yellow-50 border-yellow-200 text-yellow-950',
      activeRing: 'ring-4 ring-yellow-600 border-yellow-600 bg-yellow-100/90 shadow-lg scale-[1.02]',
      accentColor: 'text-yellow-700',
      badgeBg: 'bg-yellow-100 text-yellow-800',
      count: getCategoryCount('☀️ Solar & Green')
    }
  ];

  const filteredArticles = useMemo(() => {
    return translatedArticles.filter((article) => {
      const q = searchQuery.toLowerCase().trim();
      const origPost = articles.find((a) => a.id === article.id);

      const matchesSearch = 
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        (origPost && origPost.title.toLowerCase().includes(q));
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        (origPost && origPost.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [translatedArticles, articles, searchQuery, selectedCategory]);

  // Active article translated dynamically so changing language inside modal updates immediately
  const activeArticle = useMemo(() => {
    if (!activeArticleId) return null;
    const orig = articles.find((a) => a.id === activeArticleId);
    if (!orig) return null;
    return getTranslatedPost(orig, selectedLanguage);
  }, [activeArticleId, articles, selectedLanguage]);

  const handleShareArticle = (article: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────
          BRIGHT EYE-CATCHING LANGUAGE SELECTOR BAR (HIGH VISIBILITY)
      ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 p-0.5 sm:p-1 shadow-xl shadow-emerald-500/15">
        <div className="rounded-[22px] bg-slate-950 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Glowing Label & Feature Highlight */}
          <div className={`flex items-center gap-3 w-full md:w-auto ${isUrdu ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className={`flex flex-wrap items-center gap-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-950 fill-amber-950" />
                  <span>{isUrdu ? 'زبان تبدیل کریں' : isRoman ? 'Zuban Chunein' : 'Reading Language'}</span>
                </span>
                <span className={`text-xs sm:text-sm font-black text-white ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu 
                    ? 'تمام مضامین و گائیڈز اپنی پسندیدہ زبان میں پڑھیں:' 
                    : isRoman 
                    ? 'Guides Apni Zuban Mein Parhein:' 
                    : 'Choose your preferred reading language:'}
                </span>
              </div>
              <p className={`text-[11px] text-slate-300 mt-0.5 ${isUrdu ? 'font-urdu text-emerald-300' : ''}`}>
                {isUrdu 
                  ? 'خالص اردو نستعلیق فونٹ، رومن اردو اور انگلش ایک کلک پر منتخب کریں' 
                  : isRoman 
                  ? 'English, Roman Urdu aur Asli Urdu Nastaliq font aik click per tabdeel karein' 
                  : 'Switch instantly between English, Roman Urdu, and authentic Urdu Nastaliq.'}
              </p>
            </div>
          </div>

          {/* Bright, Vibrant Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            {BLOG_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 transform active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/40 ring-4 ring-white/90 scale-105'
                      : 'bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border-2 border-slate-700/90 hover:border-emerald-400'
                  }`}
                >
                  <span className="text-base sm:text-lg">{lang.flag}</span>
                  <div className="text-left flex flex-col">
                    <span className={`leading-tight ${lang.id === 'urdu' ? 'font-urdu text-sm font-bold' : ''}`}>
                      {lang.label}
                    </span>
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-900/80' : 'text-slate-400'}`}>
                      {lang.sublabel}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="ml-1 bg-slate-950 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Active</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          HERO BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
        
        {/* Top Bar: Mode & Language Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold w-fit">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className={isUrdu ? 'font-urdu' : ''}>{ui.badge}</span>
          </div>

          {/* Bright Header Language Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-300 font-bold mr-1">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'زبان منتخب کریں:' : 'Reading Mode:'}</span>
            </div>
            <div className="inline-flex p-1 bg-slate-900 border-2 border-emerald-500/40 rounded-2xl gap-1 shadow-md shadow-emerald-500/10">
              {BLOG_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md font-black ring-1 ring-white' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span className={lang.id === 'urdu' ? 'font-urdu text-sm font-semibold' : ''}>
                      {lang.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className={`max-w-3xl space-y-4 pt-6 ${isUrdu ? 'text-right' : 'text-left'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
          <h1 className={`font-black tracking-tight ${isUrdu ? 'font-urdu text-3xl sm:text-4xl lg:text-5xl leading-[1.8]' : 'text-3xl sm:text-4xl lg:text-5xl leading-tight'}`}>
            <span>{ui.heroTitle} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              {ui.heroHighlight}
            </span>
          </h1>
          <p className={`text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl ${isUrdu ? 'font-urdu leading-[2.2] text-slate-200' : ''}`}>
            {ui.heroSubtitle}
          </p>

          {/* Active Font / Reading Mode Pill */}
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isUrdu ? 'خالص اردو نستعلیق فونٹ فعال ہے' : isRoman ? 'Roman Urdu Reading Mode Active' : 'English Edition Active'}</span>
            </span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="relative max-w-xl">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isUrdu ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ui.searchPlaceholder}
              dir={isUrdu ? 'rtl' : 'ltr'}
              className={`w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none ${
                isUrdu ? 'pr-10 pl-4 font-urdu text-right' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${isUrdu ? 'left-3' : 'right-3'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          BLOG CATEGORIES SECTION (FULL 7 CATEGORIES)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4" dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isUrdu ? 'text-right' : 'text-left'}`}>
          <div>
            <div className={`flex items-center gap-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
              <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                <Tag className="w-4 h-4" />
              </span>
              <h2 className={`text-xl sm:text-2xl font-black text-slate-900 tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'بلاگ زمرہ جات (Blog Categories)' : isRoman ? 'Blog Categories (Zarre)' : 'Blog Categories'}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {isUrdu ? '7 اہم زمرے' : '7 Categories / 40 Guides'}
              </span>
            </div>
            <p className={`text-xs text-slate-600 mt-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu 
                ? 'کسی بھی زمرے پر کلک کر کے اس موضوع کے تمام مضامین دیکھیں:' 
                : isRoman 
                ? 'Kisi bhi category per click karein aur us topic k guides filter karein:' 
                : 'Click any category below to instantly filter all 40 in-depth editorial guides:'}
            </p>
          </div>

          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer w-fit ${isUrdu ? 'font-urdu' : ''}`}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'تمام گائیڈز دیکھیں (Show All)' : isRoman ? 'Tamam Guides Dekhein (All)' : 'Show All 40 Guides'}</span>
            </button>
          )}
        </div>

        {/* 7 Interactive Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {categoryCards.map((card) => {
            const isSelected = selectedCategory === card.id;
            const title = isUrdu ? card.titleUrdu : isRoman ? card.titleRoman : card.titleEn;
            const desc = isUrdu ? card.descUrdu : isRoman ? card.descRoman : card.descEn;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedCategory(card.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
                  isSelected
                    ? `${card.activeRing} bg-gradient-to-br ${card.bgGradient}`
                    : `bg-gradient-to-br ${card.bgGradient} hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-2xl p-1 rounded-xl bg-white/80 shadow-xs border border-slate-100">
                      {card.icon}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950 text-white shadow-xs">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'منتخب' : 'Active'}</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${card.badgeBg}`}>
                        {card.count}
                      </span>
                    )}
                  </div>
                  
                  <div className={`font-black text-xs text-slate-900 group-hover:text-blue-700 leading-snug ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                    {title}
                  </div>
                </div>

                <div className={`text-[11px] font-semibold mt-2.5 pt-2 border-t border-slate-200/60 ${card.accentColor} ${isUrdu ? 'font-urdu' : ''}`}>
                  {desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className={`flex flex-wrap items-center gap-2 pt-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'فوری فلٹر:' : 'Quick Filter:'}</span>
          </span>
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            const isSelected = selectedCategory === cat;
            const label = getCategoryLabel(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-2xs'
                }`}
              >
                <span className={isUrdu ? 'font-urdu' : ''}>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-blue-950/60 text-blue-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          ARTICLES LISTING
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isUrdu ? 'sm:flex-row-reverse text-right' : ''}`}>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className={isUrdu ? 'font-urdu' : ''}>{ui.articlesCount}</span>
              <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-black">
                {filteredArticles.length}
              </span>
            </h2>
            <p className={`text-xs text-slate-500 mt-0.5 ${isUrdu ? 'font-urdu' : ''}`}>
              {ui.showingCategory}: <span className="font-bold text-slate-800">{getCategoryLabel(selectedCategory)}</span>
            </p>
          </div>

          {copiedLink && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
              {ui.copiedNotice}
            </span>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700">No articles matched your query</h3>
            <p className="text-xs text-slate-500">Try searching for broader terms like "battery", "solar", or "tariff".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={isUrdu ? 'rtl' : 'ltr'}>
            {filteredArticles.map((article) => (
              <article 
                key={article.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className={`flex items-center justify-between text-xs ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${getCategoryBadgeClass(article.category)} ${isUrdu ? 'font-urdu' : ''}`}>
                      {article.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span className={isUrdu ? 'font-urdu' : ''}>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 
                    onClick={() => setActiveArticleId(article.id)}
                    className={`font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer ${
                      isUrdu ? 'font-urdu text-xl leading-[1.8] text-right font-bold' : 'text-lg leading-snug'
                    }`}
                  >
                    {article.title}
                  </h3>

                  <p className={`text-slate-600 line-clamp-3 ${
                    isUrdu ? 'font-urdu text-sm leading-[2.1] text-right' : 'text-xs leading-relaxed'
                  }`}>
                    {article.excerpt}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs ${isUrdu ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400 text-[11px] font-medium">{article.date}</span>
                  
                  <button
                    onClick={() => setActiveArticleId(article.id)}
                    className={`inline-flex items-center gap-1.5 font-bold text-blue-600 group-hover:text-blue-700 cursor-pointer ${isUrdu ? 'font-urdu text-sm' : ''}`}
                  >
                    <span>{ui.readArticle}</span>
                    <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${isUrdu ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────
          MODAL: FULL ARTICLE READER WITH MULTI-LANGUAGE TOGGLE
      ──────────────────────────────────────────────────────────── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header: Category, Quick Language Switcher & Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-bold border text-xs ${getCategoryBadgeClass(activeArticle.category)} ${isUrdu ? 'font-urdu' : ''}`}>
                  {activeArticle.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{activeArticle.readTime}</span>
              </div>

              {/* Language Switcher inside reader modal */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-white border-2 border-emerald-500/50 shadow-xs rounded-xl gap-1">
                  {BLOG_LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={`Switch to ${lang.label}`}
                      >
                        <span>{lang.flag}</span>
                        <span className={lang.id === 'urdu' ? 'font-urdu font-bold' : ''}>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Font Size Adjuster */}
                <div className="hidden sm:inline-flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
                  <button
                    onClick={() => setReaderFontSize('normal')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${readerFontSize === 'normal' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'}`}
                    title="Normal Font Size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setReaderFontSize('large')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${readerFontSize === 'large' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'}`}
                    title="Large Font Size"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => handleShareArticle(activeArticle)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  title={ui.shareBtn}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveArticleId(null)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  title={ui.closeBtn}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div 
              className={`p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 ${
                isUrdu 
                  ? 'dir-rtl text-right font-urdu urdu-reading' 
                  : 'text-left text-sm leading-relaxed'
              } ${
                readerFontSize === 'large' 
                  ? isUrdu ? 'text-lg leading-[2.5]' : 'text-base leading-relaxed' 
                  : isUrdu ? 'text-base leading-[2.3]' : 'text-sm leading-relaxed'
              }`}
              dir={isUrdu ? 'rtl' : 'ltr'}
            >
              <div>
                <h1 className={`font-black text-slate-950 tracking-tight ${
                  isUrdu 
                    ? 'font-urdu text-2xl sm:text-3xl lg:text-4xl leading-[1.8] font-bold' 
                    : 'text-2xl sm:text-3xl leading-snug'
                }`}>
                  {activeArticle.title}
                </h1>
                <div className={`mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-3 ${isUrdu ? 'flex-row-reverse font-urdu text-sm' : ''}`}>
                  <span>{ui.authorLabel}: <strong>{activeArticle.author}</strong></span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                </div>
              </div>

              {/* Intro Box */}
              <div className={`p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-800 ${
                isUrdu ? 'font-urdu urdu-reading border-r-4 border-r-blue-600' : 'border-l-4 border-l-blue-600'
              }`}>
                {activeArticle.content.introduction}
              </div>

              {/* Sections */}
              {activeArticle.content.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3 pt-2">
                  <h3 className={`font-black text-slate-950 tracking-tight ${
                    isUrdu ? 'font-urdu urdu-heading text-xl sm:text-2xl font-bold pt-2' : 'text-lg'
                  }`}>
                    {sec.heading}
                  </h3>
                  
                  {sec.body.map((p, pIdx) => (
                    <p key={pIdx} className="text-slate-700">
                      {p}
                    </p>
                  ))}

                  {/* Table if exists */}
                  {sec.table && (
                    <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                      <table className="w-full text-xs border-collapse" dir={isUrdu ? 'rtl' : 'ltr'}>
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className={`p-3.5 ${isUrdu ? 'text-right font-urdu text-sm' : 'text-left'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={`p-3.5 text-slate-800 font-medium ${isUrdu ? 'text-right font-urdu text-sm' : 'text-left'}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Callout box */}
                  {sec.callout && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className={isUrdu ? 'font-urdu text-sm leading-[2.1]' : ''}>{sec.callout}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Key Takeaways */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className={`flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider ${isUrdu ? 'flex-row-reverse font-urdu text-sm' : ''}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{ui.takeawaysTitle}</span>
                </div>
                <ul className="space-y-2.5 text-slate-300">
                  {activeArticle.content.takeaways.map((point, ptIdx) => (
                    <li key={ptIdx} className={`flex items-start gap-2.5 ${isUrdu ? 'flex-row-reverse font-urdu text-sm leading-[2.2]' : 'text-xs'}`}>
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Launch Related Calculator */}
              <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 ${isUrdu ? 'sm:flex-row-reverse' : ''}`}>
                <div className={`space-y-0.5 ${isUrdu ? 'text-right' : 'text-left'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider text-blue-200 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'اپنی گاڑی کے مطابق حساب لگائیں' : 'Calculate For Your Setup'}
                  </div>
                  <div className={`text-sm font-black ${isUrdu ? 'font-urdu text-base' : ''}`}>
                    {isUrdu ? 'کیا آپ اپنی بائیک کا صحیح خرچ معلوم کرنا چاہتے ہیں؟' : 'Want to run the exact math for your electric vehicle?'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const tool = activeArticle.relatedTool;
                    setActiveArticleId(null);
                    onNavigate(tool);
                  }}
                  className={`px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs transition-all shadow-md cursor-pointer shrink-0 ${isUrdu ? 'font-urdu text-sm' : ''}`}
                >
                  {isUrdu ? 'متعلقہ ٹول کھولیں' : activeArticle.relatedToolLabel}
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0 ${isUrdu ? 'flex-row-reverse' : ''}`}>
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? 'گو انفو ای وی پاکستان' : 'goinfoEV Pakistan Editorial'}
              </span>
              <button
                onClick={() => setActiveArticleId(null)}
                className={`px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer ${isUrdu ? 'font-urdu' : ''}`}
              >
                {ui.closeBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
