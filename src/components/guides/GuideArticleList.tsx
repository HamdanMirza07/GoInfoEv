import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Motorbike, 
  Share2, 
  Check, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { GuideArticle } from '../../data/batteryGuidesData';

interface GuideArticleListProps {
  articles: GuideArticle[];
  categoryTitle: string;
  categoryDescription: string;
  icon: React.ReactNode;
  accentColor?: 'emerald' | 'amber' | 'blue';
}

export const GuideArticleList: React.FC<GuideArticleListProps> = ({
  articles,
  categoryTitle,
  categoryDescription,
  icon,
  accentColor = 'emerald',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(articles[0]?.id || null);
  const [copied, setCopied] = useState(false);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.highlights.some((h) => h.toLowerCase().includes(q)) ||
        a.sections.some(
          (s) =>
            s.heading.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q) ||
            s.bullets?.some((b) => b.toLowerCase().includes(q))
        )
    );
  }, [articles, searchQuery]);

  const activeArticle = useMemo(() => {
    return articles.find((a) => a.id === selectedArticleId) || filteredArticles[0] || articles[0];
  }, [articles, selectedArticleId, filteredArticles]);

  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskBot = (articleTitle: string) => {
    window.dispatchEvent(
      new CustomEvent('open-ev-bot', {
        detail: { query: `Can you explain more about: ${articleTitle}?` },
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-900 text-emerald-400 shadow-sm shrink-0">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {categoryTitle}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {articles.length} In-Depth Articles
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {categoryDescription}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, fixes & specs..."
              className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Article Index */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No matching guides found for "{searchQuery}".
            </div>
          ) : (
            filteredArticles.map((article, idx) => {
              const isSelected = article.id === activeArticle?.id;
              return (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md scale-[1.01]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {article.title}
                    </h3>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {article.summary}
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                    isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-300'
                  }`} />
                </button>
              );
            })
          )}
        </div>

        {/* Right Main Panel: Full Article Reader */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          {activeArticle && (
            <article className="space-y-6">
              
              {/* Top Meta & Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80">
                    <BookOpen className="w-3 h-3" />
                    Verified Guide
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {activeArticle.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyTitle(activeArticle.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy Article Title"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Share'}</span>
                  </button>

                  <button
                    onClick={() => handleAskBot(activeArticle.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Motorbike className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Ask EV Scooty Bot</span>
                  </button>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeArticle.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {activeArticle.summary}
                </p>
              </div>

              {/* Key Highlights Callout */}
              {activeArticle.highlights && activeArticle.highlights.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-emerald-100 space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Takeaways &amp; Quick Summary
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {activeArticle.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Table if Available */}
              {activeArticle.specsTable && activeArticle.specsTable.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Specification Parameter</th>
                        <th className="p-3">Rating / Verified Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeArticle.specsTable.map((spec, i) => (
                        <tr key={i} className="hover:bg-slate-50/70">
                          <td className="p-3 font-semibold text-slate-800">{spec.label}</td>
                          <td className="p-3 text-slate-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* In-depth Content Sections */}
              <div className="space-y-6 pt-2">
                {activeArticle.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {sec.heading}
                    </h3>
                    {sec.content && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {sec.content}
                      </p>
                    )}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="space-y-2 pl-2">
                        {sec.bullets.map((b, bi) => (
                          <li key={bi} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Tip Footer */}
              {activeArticle.quickTip && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="font-bold text-amber-950">Expert Pro-Tip: </strong>
                    {activeArticle.quickTip}
                  </div>
                </div>
              )}

              {/* Footer Interactive Help */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs text-slate-600 text-center sm:text-left">
                  Have a specific question about this topic? Ask our 24/7 AI Assistant.
                </div>
                <button
                  onClick={() => handleAskBot(activeArticle.title)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Ask EV Scooty Bot Now</span>
                </button>
              </div>

            </article>
          )}
        </div>

      </div>
    </div>
  );
};
