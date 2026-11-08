import React, { useState, useMemo, useRef } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { useCatalog } from '../context/CatalogContext';
import { AnimatedEVBikeSvg } from './EVSvgIllustrations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Zap, 
  Battery, 
  ShieldCheck, 
  Gauge, 
  DollarSign, 
  Award, 
  ArrowRight, 
  Share2, 
  Printer, 
  ArrowLeftRight, 
  Search, 
  RotateCcw,
  Bike,
  BarChart2,
  X,
  TrendingUp,
  Info,
  Layers,
  Download,
  Copy,
  MessageCircle,
  Mail,
  FileText,
  Loader2
} from 'lucide-react';

interface ProductComparisonProps {
  onSelectModelForTool?: (modelId: string, tool: string) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({ onSelectModelForTool }) => {
  const { models } = useCatalog();

  // Default to 2 bike selections
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(() => {
    const default1 = models[0]?.id || EV_MODELS[0]?.id || '';
    const default2 = models[1]?.id || EV_MODELS[1]?.id || '';
    return [default1, default2];
  });

  const [electricityRate, setElectricityRate] = useState<number>(50); // PKR / unit
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Modal states for bike selection picker, share & PDF generation
  const [pickerModalIndex, setPickerModalIndex] = useState<number | null>(null);
  const [pickerSearchTerm, setPickerSearchTerm] = useState<string>('');
  const [pickerBrandFilter, setPickerBrandFilter] = useState<string>('all');
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const matrixContainerRef = useRef<HTMLDivElement>(null);

  // Helper to change a slot
  const handleModelChange = (index: number, newId: string) => {
    const updated = [...selectedModelIds];
    updated[index] = newId;
    setSelectedModelIds(updated);
    setPickerModalIndex(null);
  };

  // Add a comparison slot
  const handleAddSlot = () => {
    if (selectedModelIds.length >= 6) return;
    const unused = models.find(m => !selectedModelIds.includes(m.id));
    const nextId = unused ? unused.id : models[selectedModelIds.length % models.length]?.id || '';
    setSelectedModelIds([...selectedModelIds, nextId]);
  };

  // Remove a comparison slot
  const handleRemoveSlot = (index: number) => {
    if (selectedModelIds.length <= 2) return;
    const updated = selectedModelIds.filter((_, i) => i !== index);
    setSelectedModelIds(updated);
  };

  // Clear all selections (resets to default 2)
  const handleClearAll = () => {
    const default1 = models[0]?.id || EV_MODELS[0]?.id || '';
    const default2 = models[1]?.id || EV_MODELS[1]?.id || '';
    setSelectedModelIds([default1, default2]);
  };

  // Swap positions of two adjacent slots
  const handleSwapSlots = (indexA: number, indexB: number) => {
    if (indexA < 0 || indexB < 0 || indexA >= selectedModelIds.length || indexB >= selectedModelIds.length) return;
    const updated = [...selectedModelIds];
    const temp = updated[indexA];
    updated[indexA] = updated[indexB];
    updated[indexB] = temp;
    setSelectedModelIds(updated);
  };

  // Selected Model Objects
  const selectedModels: EVModel[] = useMemo(() => {
    return selectedModelIds.map(id => {
      return models.find(m => m.id === id) || models[0] || EV_MODELS[0];
    });
  }, [selectedModelIds, models]);

  // Calculated Stats per model
  const modelStats = useMemo(() => {
    return selectedModels.map(m => {
      const avgRange = ((m.rangeMin || 0) + (m.rangeMax || m.rangeMin || 0)) / 2;
      const realRange = avgRange * 0.9; // 90% real world efficiency factor
      const unitsToFull = (m.batteryWh / 1000) / 0.85; // 85% charger efficiency
      const costPerFullCharge = unitsToFull * electricityRate;
      const costPerKm = realRange > 0 ? costPerFullCharge / realRange : 0;
      
      // Monthly 1,500km cost vs Petrol (Rs 280/L @ 45 km/L -> Rs 6.22/km -> Rs 9333/mo)
      const petrolMonthlyCost = (1500 / 45) * 280;
      const evMonthlyCost = 1500 * costPerKm;
      const monthlySavings = Math.max(0, petrolMonthlyCost - evMonthlyCost);
      const breakevenMonths = monthlySavings > 0 ? Math.ceil((m.price || 250000) / monthlySavings) : 999;

      // Extract numerical speed
      const speedMatch = m.topSpeed ? m.topSpeed.match(/(\d+)/) : null;
      const numericSpeed = speedMatch ? parseInt(speedMatch[1], 10) : 60;

      return {
        model: m,
        avgRange,
        realRange,
        unitsToFull,
        costPerFullCharge,
        costPerKm,
        monthlySavings,
        breakevenMonths,
        numericSpeed
      };
    });
  }, [selectedModels, electricityRate]);

  // Metric Winners
  const bestPrice = Math.min(...selectedModels.map(m => m.price || Infinity));
  const bestBattery = Math.max(...selectedModels.map(m => m.batteryWh));
  const bestRange = Math.max(...modelStats.map(s => s.realRange));
  const bestSpeed = Math.max(...modelStats.map(s => s.numericSpeed));
  const lowestCostPerKm = Math.min(...modelStats.map(s => s.costPerKm));

  // Buying Recommendations
  const bestBudgetModel = useMemo(() => {
    return modelStats.reduce((best, curr) => (curr.model.price || Infinity) < (best.model.price || Infinity) ? curr : best, modelStats[0]);
  }, [modelStats]);

  const bestRangeModel = useMemo(() => {
    return modelStats.reduce((best, curr) => curr.realRange > best.realRange ? curr : best, modelStats[0]);
  }, [modelStats]);

  const bestPerformanceModel = useMemo(() => {
    return modelStats.reduce((best, curr) => curr.numericSpeed > best.numericSpeed ? curr : best, modelStats[0]);
  }, [modelStats]);

  const bestBatteryModel = useMemo(() => {
    return modelStats.reduce((best, curr) => curr.model.batteryWh > best.model.batteryWh ? curr : best, modelStats[0]);
  }, [modelStats]);

  const bestCommuterModel = useMemo(() => {
    return modelStats.reduce((best, curr) => {
      const scoreCurr = (curr.realRange / Math.max(1, (curr.model.price || 250000) / 100000));
      const scoreBest = (best.realRange / Math.max(1, (best.model.price || 250000) / 100000));
      return scoreCurr > scoreBest ? curr : best;
    }, modelStats[0]);
  }, [modelStats]);

  const lowestCostModel = useMemo(() => {
    return modelStats.reduce((best, curr) => curr.costPerKm < best.costPerKm ? curr : best, modelStats[0]);
  }, [modelStats]);

  // Search & Filtered catalog for slot selection modal
  const pickerFilteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesBrand = pickerBrandFilter === 'all' || m.brand === pickerBrandFilter;
      const q = pickerSearchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        (m.variant && m.variant.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q));
      return matchesBrand && matchesSearch;
    });
  }, [models, pickerSearchTerm, pickerBrandFilter]);

  const uniqueBrands = useMemo(() => {
    return ['all', ...Array.from(new Set(models.map(m => m.brand)))].sort();
  }, [models]);

  // Direct High-Resolution PDF Download Function
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      // 1. Try capturing element via html2canvas if available
      if (matrixContainerRef.current) {
        const canvas = await html2canvas(matrixContainerRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Title Header
        pdf.setFillColor(7, 27, 43); // #071B2B
        pdf.rect(0, 0, pdfWidth, 22, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.text('GoInfoEV - Pakistan Electric Vehicle Comparison Report', 10, 14);

        let heightLeft = imgHeight;
        let position = 26;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 26);

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        const fileName = `GoInfoEV_Comparison_${selectedModels.map(m => m.brand).join('_')}.pdf`;
        pdf.save(fileName);
        setIsGeneratingPdf(false);
        return;
      }
    } catch (err) {
      console.warn('html2canvas capture failed, falling back to structured jsPDF generator:', err);
    }

    // 2. Structured jsPDF Document Generator Fallback
    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');
      const dateStr = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });

      // Title Banner
      doc.setFillColor(7, 27, 43); // #071B2B
      doc.rect(0, 0, 595, 70, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('goinfoEV Pakistan - EV Bike Comparison Report', 30, 40);

      doc.setFontSize(10);
      doc.setTextColor(22, 163, 106); // #16A36A
      doc.text(`Generated: ${dateStr} • Tariff Rate: PKR ${electricityRate}/kWh`, 30, 58);

      let yPos = 100;

      // Iterate models
      modelStats.forEach((st, idx) => {
        if (yPos > 750) {
          doc.addPage();
          yPos = 50;
        }

        doc.setFillColor(245, 248, 246);
        doc.rect(30, yPos, 535, 95, 'F');
        doc.setDrawColor(22, 163, 106);
        doc.rect(30, yPos, 535, 95, 'S');

        doc.setTextColor(7, 27, 43);
        doc.setFontSize(14);
        doc.text(`${idx + 1}. ${getFullName(st.model)} (${st.model.category || 'Electric Scooty'})`, 45, yPos + 22);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`• Price: ${formatPKR(st.model.price)}`, 45, yPos + 40);
        doc.text(`• Battery: ${st.model.batteryWh} Wh (${st.model.batteryType})`, 45, yPos + 55);
        doc.text(`• Real Range: ~${Math.round(st.realRange)} km`, 45, yPos + 70);

        doc.text(`• Top Speed: ${st.model.topSpeed || '60 km/h'}`, 280, yPos + 40);
        doc.text(`• Charge Cost: Rs ${Math.round(st.costPerFullCharge)} (${st.unitsToFull.toFixed(2)} units)`, 280, yPos + 55);
        doc.text(`• Monthly Savings: Rs ${Math.round(st.monthlySavings).toLocaleString('en-PK')}/mo`, 280, yPos + 70);

        yPos += 110;
      });

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Note: Real-world range depends on rider load, speed, terrain, and battery age. © 2026 GoInfoEV Pakistan.', 30, yPos + 20);

      doc.save(`GoInfoEV_Comparison_Matrix.pdf`);
    } catch (error) {
      console.error('PDF Generation error:', error);
      window.print(); // Fallback to print dialog
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getShareableText = () => {
    return `⚡ GoInfoEV Electric Bike Comparison Matrix:\n` +
      selectedModels.map(m => `• ${getFullName(m)}: ${formatPKR(m.price)} (${m.batteryWh}Wh, ~${m.rangeMin}-${m.rangeMax || m.rangeMin}km range)`).join('\n') +
      `\n\nCompare full specs live: ${window.location.href}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareableText());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GoInfoEV Bike Comparison',
          text: getShareableText(),
          url: window.location.href,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* ───────────────────────────────────────────────────────────
          1. HEADER & GLOBAL CONTROLS BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F8F6] text-[#071B2B] rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/90">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Side-by-Side Multi-Model Analytics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#071B2B]">
                EV Bike Comparison Matrix
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
                Compare verified specifications, real-world range simulations, battery chemistry, WAPDA charging bills, and petrol savings for up to 6 Pakistani electric bikes simultaneously.
              </p>
            </div>

            {/* Main Action Buttons Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 shadow-xs ${
                  highlightDifferences
                    ? 'bg-[#16A36A] text-white border-[#16A36A]'
                    : 'bg-white text-[#071B2B] hover:bg-slate-50 border-slate-300'
                }`}
                title="Toggle highlighting best metrics in each category"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>{highlightDifferences ? 'Highlight Best Specs ON' : 'Highlight Best Specs'}</span>
              </button>

              {selectedModelIds.length < 6 && (
                <button
                  onClick={handleAddSlot}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138e5b] text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bike ({selectedModelIds.length}/6)</span>
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Reset selections to default 2 bikes"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* ACTIVE SHARE BUTTON */}
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#071B2B] border border-slate-300 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                title="Open share options"
              >
                <Share2 className="w-4 h-4 text-[#16A36A]" />
                <span>Share</span>
              </button>

              {/* ACTIVE DIRECT PDF DOWNLOAD BUTTON */}
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                title="Download formatted comparison PDF document"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Config Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F0B429]" />
                <span>WAPDA Tariff Rate (PKR / Unit):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(Math.max(1, Number(e.target.value)))}
                  className="w-20 p-2 bg-[#172B3A] border border-slate-700 rounded-xl font-black text-white text-center outline-none focus:border-[#16A36A]"
                />
                <span className="text-slate-400 text-[11px]">PKR/kWh</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#16A36A] animate-pulse"></span>
              <span>Showing {selectedModels.length} models • Live 2026 NEPRA Tariff &amp; Vehicle Specs</span>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. VEHICLE SELECTION CARDS & ADD/REMOVE CONTROL BAR
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#071B2B] tracking-tight flex items-center gap-2">
            <Bike className="w-5 h-5 text-[#16A36A]" />
            <span>Selected Vehicles for Comparison</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {selectedModels.length} of 6 Slots Used
          </span>
        </div>

        <div className={`grid gap-4 ${
          selectedModels.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          selectedModels.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          selectedModels.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          selectedModels.length === 5 ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5' :
          'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6'
        }`}>
          {selectedModels.map((m, idx) => (
            <div 
              key={`vehicle-card-${idx}`}
              className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs relative flex flex-col justify-between group transition-all duration-200"
            >
              <div className="space-y-3">
                
                {/* Slot Header Bar */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#071B2B] text-white rounded-lg tracking-wide">
                    BIKE #{idx + 1}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Swap left/right buttons */}
                    {idx > 0 && (
                      <button
                        onClick={() => handleSwapSlots(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-[#071B2B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {idx < selectedModels.length - 1 && (
                      <button
                        onClick={() => handleSwapSlots(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-[#071B2B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
                        title="Move right"
                      >
                        →
                      </button>
                    )}

                    {/* Delete Slot Button */}
                    {selectedModels.length > 2 && (
                      <button
                        onClick={() => handleRemoveSlot(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove bike from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bike Image Banner */}
                <div className="relative w-full h-36 bg-[#F5F8F6] rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-3">
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={getFullName(m)}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.svg-bike-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div className={`svg-bike-fallback ${m.image ? 'hidden' : 'block'} w-full h-full flex items-center justify-center`}>
                    <AnimatedEVBikeSvg className="w-full h-24 text-[#16A36A]" />
                  </div>
                </div>

                {/* Vehicle Meta & Selector Button */}
                <div className="space-y-1.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#16A36A] tracking-wider">
                      {m.brand}
                    </span>
                    {m.category && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {m.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-[#071B2B] text-sm sm:text-base leading-snug line-clamp-1">
                    {getFullName(m)}
                  </h3>

                  {/* Clean Modern Boxed Price (Matching Image 2 with no hover effect) */}
                  <div className="pt-1">
                    <div className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-white border border-slate-300 shadow-2xs text-[#071B2B] font-extrabold text-sm sm:text-base cursor-default select-none">
                      {formatPKR(m.price)}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Replace Trigger */}
              <button
                onClick={() => setPickerModalIndex(idx)}
                className="mt-3.5 w-full py-2.5 px-3 bg-[#F5F8F6] hover:bg-slate-100 text-[#071B2B] rounded-2xl text-xs font-extrabold transition-colors border border-slate-200/90 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Swap Vehicle</span>
              </button>

            </div>
          ))}

          {/* Add Slot Card if < 6 */}
          {selectedModels.length < 6 && (
            <button
              onClick={handleAddSlot}
              className="border-2 border-dashed border-slate-300 hover:border-[#16A36A] hover:bg-[#16A36A]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#16A36A]/10 text-[#16A36A] flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-[#071B2B] text-sm">Add Another Bike</span>
              <span className="text-xs text-slate-400 font-medium">Compare up to 6 bikes</span>
            </button>
          )}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          3. DETAILED SIDE-BY-SIDE SPECIFICATION CATEGORY MATRIX
      ──────────────────────────────────────────────────────────── */}
      <section ref={matrixContainerRef} className="space-y-4">
        
        {/* Category Tab Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-extrabold text-[#071B2B] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#16A36A]" />
            <span>Detailed Specification Matrix</span>
          </h2>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Specifications' },
              { id: 'basic', label: 'Basic Info' },
              { id: 'performance', label: 'Performance' },
              { id: 'battery', label: 'Battery' },
              { id: 'charging', label: 'Charging' },
              { id: 'costs', label: 'Running Costs' },
              { id: 'warranty', label: 'Warranty' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#071B2B] text-white shadow-xs font-extrabold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table Container with Horizontal Scroll */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-x-auto">
          <div className="min-w-[760px] divide-y divide-slate-100">
            
            {/* Header Vehicles Title Row */}
            <div className="bg-[#F5F8F6] text-[#071B2B] p-4 border-b border-slate-200/90 sticky top-0 z-20 shadow-2xs backdrop-blur-md">
              <div className="grid grid-cols-12 gap-4 items-center text-xs font-black uppercase tracking-wider">
                <div className="col-span-3 text-slate-500 font-extrabold">Specification Field</div>
                <div className="col-span-9 grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                  {selectedModels.map((m, idx) => (
                    <div key={`header-title-${idx}`} className="text-center truncate font-black text-[#16A36A]">
                      {getFullName(m)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CATEGORY 1: BASIC INFORMATION */}
            {(activeCategory === 'all' || activeCategory === 'basic') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#16A36A]" /> 1. Basic Vehicle Information
                </div>

                {/* Brand */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Manufacturer Brand</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`brand-${idx}`} className="font-extrabold text-[#071B2B]">
                          {m.brand}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Model & Variant */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Model Name &amp; Variant</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`model-${idx}`} className="font-bold text-[#071B2B]">
                          {m.model} {m.variant ? `(${m.variant})` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Retail Price */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Official Retail Price</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => {
                        const isBest = m.price === bestPrice;
                        return (
                          <div key={`price-${idx}`} className={`p-2 rounded-xl border ${
                            highlightDifferences && isBest
                              ? 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A] font-black'
                              : 'bg-slate-50 border-slate-200 text-[#071B2B] font-extrabold'
                          }`}>
                            {formatPKR(m.price)}
                            {highlightDifferences && isBest && (
                              <span className="block text-[9px] font-black text-[#16A36A] mt-0.5">Lowest Price</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Vehicle Category</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`cat-${idx}`}>
                          <span className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-[#172B3A] text-white">
                            {m.category || 'Electric Scooty'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CATEGORY 2: PERFORMANCE */}
            {(activeCategory === 'all' || activeCategory === 'performance') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#16A36A]" /> 2. Performance &amp; Motor Specifications
                </div>

                {/* Top Speed */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Top Speed</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => {
                        const isBest = st.numericSpeed === bestSpeed;
                        return (
                          <div key={`speed-${idx}`} className={`p-2 rounded-xl border ${
                            highlightDifferences && isBest
                              ? 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A] font-black'
                              : 'bg-slate-50 border-slate-200 text-[#071B2B] font-bold'
                          }`}>
                            {st.model.topSpeed || '60 km/h'}
                            {highlightDifferences && isBest && (
                              <span className="block text-[9px] font-black text-[#16A36A] mt-0.5">Top Speed Winner</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Motor Type & Power */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Motor Type &amp; Wattage</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`motor-spec-${idx}`} className="font-bold text-[#071B2B] p-2 bg-slate-50 rounded-xl border border-slate-200">
                          {m.motor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Braking System */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Braking System</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`brakes-spec-${idx}`} className="font-semibold text-slate-700">
                          {m.brakes || 'Front Disc / Rear Drum'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CATEGORY 3: BATTERY SPECIFICATIONS */}
            {(activeCategory === 'all' || activeCategory === 'battery') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-[#16A36A]" /> 3. Battery Capacity &amp; Technology
                </div>

                {/* Battery Capacity Wh/kWh */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Battery Capacity (Wh / kWh)</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => {
                        const isBest = m.batteryWh === bestBattery;
                        return (
                          <div key={`batwh-${idx}`} className={`p-2 rounded-xl border ${
                            highlightDifferences && isBest
                              ? 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A] font-black'
                              : 'bg-slate-50 border-slate-200 text-[#071B2B] font-bold'
                          }`}>
                            <div>{m.batteryWh} Wh</div>
                            <div className="text-[10px] text-slate-500">({(m.batteryWh / 1000).toFixed(2)} kWh)</div>
                            {highlightDifferences && isBest && (
                              <span className="block text-[9px] font-black text-[#16A36A] mt-0.5">Largest Capacity</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chemistry & Type */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Battery Chemistry</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`chem-spec-${idx}`}>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#071B2B] text-white">
                            {m.chemistry}
                          </span>
                          <div className="text-[11px] text-slate-600 font-medium mt-1">{m.batteryType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-World Range */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Real-World Mileage Range</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => {
                        const isBest = Math.abs(st.realRange - bestRange) < 0.1;
                        return (
                          <div key={`range-spec-${idx}`} className={`p-2 rounded-xl border ${
                            highlightDifferences && isBest
                              ? 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A] font-black'
                              : 'bg-slate-50 border-slate-200 text-[#071B2B] font-extrabold'
                          }`}>
                            <div>~{Math.round(st.realRange)} km</div>
                            <div className="text-[10px] text-slate-500">Claimed: {st.model.rangeMin}-{st.model.rangeMax || st.model.rangeMin} km</div>
                            {highlightDifferences && isBest && (
                              <span className="block text-[9px] font-black text-[#16A36A] mt-0.5">Highest Range</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CATEGORY 4: CHARGING INFORMATION */}
            {(activeCategory === 'all' || activeCategory === 'charging') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F0B429]" /> 4. Charging &amp; Electricity Requirements
                </div>

                {/* Charge Time */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">0 - 100% Charge Duration</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`chgtime-${idx}`} className="font-bold text-[#071B2B]">
                          {m.chargeTime || '3 - 4 hours'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Units Consumed */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">WAPDA Units per Full Charge</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => (
                        <div key={`units-${idx}`} className="font-extrabold text-[#071B2B]">
                          {st.unitsToFull.toFixed(2)} kWh Units
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CATEGORY 5: RUNNING COSTS */}
            {(activeCategory === 'all' || activeCategory === 'costs') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#16A36A]" /> 5. Running Costs &amp; Financial Savings
                </div>

                {/* Full Charge Bill */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Cost for 1 Full Charge</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => (
                        <div key={`chgbill-${idx}`} className="font-extrabold text-[#16A36A] p-2 bg-[#16A36A]/10 rounded-xl border border-[#16A36A]/30">
                          Rs {Math.round(st.costPerFullCharge)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cost Per KM */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Cost Per KM</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => {
                        const isBest = Math.abs(st.costPerKm - lowestCostPerKm) < 0.01;
                        return (
                          <div key={`costkm-spec-${idx}`} className={`p-2 rounded-xl border ${
                            highlightDifferences && isBest
                              ? 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A] font-black'
                              : 'bg-slate-50 border-slate-200 text-[#071B2B] font-bold'
                          }`}>
                            <div>Rs {st.costPerKm.toFixed(2)} / km</div>
                            <div className="text-[10px] text-slate-500">vs Petrol ~Rs 6.22/km</div>
                            {highlightDifferences && isBest && (
                              <span className="block text-[9px] font-black text-[#16A36A] mt-0.5">Cheapest per KM</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monthly Savings */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Monthly Savings (1,500 km)</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => (
                        <div key={`sav-spec-${idx}`} className="p-2 bg-[#16A36A]/10 border border-[#16A36A]/30 rounded-xl text-[#16A36A] font-black">
                          Rs {Math.round(st.monthlySavings).toLocaleString('en-PK')}/mo
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Breakeven Timeline */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Investment Breakeven Period</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {modelStats.map((st, idx) => (
                        <div key={`be-spec-${idx}`} className="font-extrabold text-[#071B2B]">
                          {st.breakevenMonths} Months
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CATEGORY 6: WARRANTY & AFTER-SALES */}
            {(activeCategory === 'all' || activeCategory === 'warranty') && (
              <>
                <div className="bg-[#F5F8F6] px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#071B2B] border-b border-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A36A]" /> 6. Warranty &amp; After-Sales Coverage
                </div>

                {/* Warranty Terms */}
                <div className="p-4 hover:bg-[#F5F8F6]/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-600">Official Warranty</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`warranty-${idx}`} className="font-bold text-[#071B2B] p-2 bg-slate-50 rounded-xl border border-slate-200">
                          {m.warranty || 'Official Manufacturer Warranty'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulation Launcher Action */}
                <div className="p-4 bg-slate-50">
                  <div className="grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-700">Detailed Simulator</div>
                    <div className="col-span-9 grid gap-4 text-center" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))` }}>
                      {selectedModels.map((m, idx) => (
                        <div key={`sim-act-${idx}`}>
                          {onSelectModelForTool && (
                            <button
                              onClick={() => onSelectModelForTool(m.id, 'range')}
                              className="w-full py-2 bg-[#16A36A] hover:bg-[#138e5b] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <span>Simulate Range</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          4. BUYING RECOMMENDATIONS CARDS
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#071B2B] tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#16A36A]" />
            <span>Smart Buying Recommendations</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Based on current comparison selection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Best Budget Option */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/20">
                💵 Best Budget Option
              </span>
              <DollarSign className="w-4 h-4 text-[#16A36A]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(bestBudgetModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#071B2B]">{formatPKR(bestBudgetModel.model.price)}</span>
              <span className="text-xs text-slate-500 font-medium">Lowest purchase price</span>
            </div>
          </div>

          {/* Best Range */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/20">
                ⚡ Longest Mileage Range
              </span>
              <Gauge className="w-4 h-4 text-[#16A36A]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(bestRangeModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#16A36A]">~{Math.round(bestRangeModel.realRange)} km</span>
              <span className="text-xs text-slate-500 font-medium">Real-world per charge</span>
            </div>
          </div>

          {/* Best Performance */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#071B2B] bg-[#F0B429]/20 border border-[#F0B429]/40 px-3 py-1 rounded-full font-extrabold">
                🚀 Top Performance &amp; Speed
              </span>
              <Zap className="w-4 h-4 text-[#F0B429]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(bestPerformanceModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#071B2B]">{bestPerformanceModel.model.topSpeed}</span>
              <span className="text-xs text-slate-500 font-medium">{bestPerformanceModel.model.motor}</span>
            </div>
          </div>

          {/* Best Battery */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/20">
                🔋 Largest Battery Pack
              </span>
              <Battery className="w-4 h-4 text-[#16A36A]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(bestBatteryModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#071B2B]">{bestBatteryModel.model.batteryWh} Wh</span>
              <span className="text-xs text-slate-500 font-medium">({bestBatteryModel.model.batteryType})</span>
            </div>
          </div>

          {/* Best Daily Commuter */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#071B2B] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                🛵 Best Daily Commuter
              </span>
              <Bike className="w-4 h-4 text-[#071B2B]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(bestCommuterModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#16A36A]">High ROI</span>
              <span className="text-xs text-slate-500 font-medium">Optimal Range to Price ratio</span>
            </div>
          </div>

          {/* Lowest Running Cost */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/20">
                💰 Lowest Running Cost
              </span>
              <TrendingUp className="w-4 h-4 text-[#16A36A]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071B2B]">
              {getFullName(lowestCostModel.model)}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-black text-[#16A36A]">Rs {lowestCostModel.costPerKm.toFixed(2)} / km</span>
              <span className="text-xs text-slate-500 font-medium">vs Petrol Rs 6.22/km</span>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          5. COMPARISON CHARTS (VISUAL BARS)
      ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-[#071B2B] tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#16A36A]" />
            <span>Visual Specification Comparison Charts</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Relative benchmark across selected bikes
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Retail Price Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#071B2B] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#16A36A]" /> Retail Price (PKR)
            </h3>
            <div className="space-y-3 bg-[#F5F8F6] p-5 rounded-2xl border border-slate-200/90">
              {modelStats.map((s, i) => {
                const maxVal = Math.max(...selectedModels.map(m => m.price || 1));
                const pct = Math.max(10, Math.round(((s.model.price || 0) / maxVal) * 100));
                const isBest = s.model.price === bestPrice;

                return (
                  <div key={`chart-price-${i}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#071B2B]">
                      <span className="truncate max-w-[200px]">{getFullName(s.model)}</span>
                      <span className={isBest ? 'text-[#16A36A] font-black' : ''}>{formatPKR(s.model.price)}</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isBest ? 'bg-[#16A36A]' : 'bg-[#071B2B]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Real-World Range Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#071B2B] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#16A36A]" /> Real-World Range (KM)
            </h3>
            <div className="space-y-3 bg-[#F5F8F6] p-5 rounded-2xl border border-slate-200/90">
              {modelStats.map((s, i) => {
                const maxVal = Math.max(...modelStats.map(st => st.realRange));
                const pct = Math.max(10, Math.round((s.realRange / Math.max(1, maxVal)) * 100));
                const isBest = Math.abs(s.realRange - bestRange) < 0.1;

                return (
                  <div key={`chart-range-${i}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#071B2B]">
                      <span className="truncate max-w-[200px]">{getFullName(s.model)}</span>
                      <span className={isBest ? 'text-[#16A36A] font-black' : ''}>~{Math.round(s.realRange)} km</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isBest ? 'bg-[#16A36A]' : 'bg-[#071B2B]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Battery Capacity Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#071B2B] flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-[#16A36A]" /> Battery Capacity (Watt-Hours)
            </h3>
            <div className="space-y-3 bg-[#F5F8F6] p-5 rounded-2xl border border-slate-200/90">
              {modelStats.map((s, i) => {
                const maxVal = Math.max(...selectedModels.map(m => m.batteryWh));
                const pct = Math.max(10, Math.round((s.model.batteryWh / Math.max(1, maxVal)) * 100));
                const isBest = s.model.batteryWh === bestBattery;

                return (
                  <div key={`chart-bat-${i}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#071B2B]">
                      <span className="truncate max-w-[200px]">{getFullName(s.model)}</span>
                      <span className={isBest ? 'text-[#16A36A] font-black' : ''}>{s.model.batteryWh} Wh</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isBest ? 'bg-[#16A36A]' : 'bg-[#071B2B]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 4: Cost Per KM Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#071B2B] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#16A36A]" /> Electricity Cost Per KM (PKR/KM)
            </h3>
            <div className="space-y-3 bg-[#F5F8F6] p-5 rounded-2xl border border-slate-200/90">
              {modelStats.map((s, i) => {
                const maxVal = Math.max(...modelStats.map(st => st.costPerKm));
                const pct = Math.max(10, Math.round((s.costPerKm / Math.max(0.1, maxVal)) * 100));
                const isBest = Math.abs(s.costPerKm - lowestCostPerKm) < 0.01;

                return (
                  <div key={`chart-cost-${i}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#071B2B]">
                      <span className="truncate max-w-[200px]">{getFullName(s.model)}</span>
                      <span className={isBest ? 'text-[#16A36A] font-black' : ''}>Rs {s.costPerKm.toFixed(2)}/km</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isBest ? 'bg-[#16A36A]' : 'bg-[#071B2B]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          MODAL 1: SEARCHABLE VEHICLE SELECTOR
      ──────────────────────────────────────────────────────────── */}
      {pickerModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-[#071B2B]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#071B2B] text-white p-5 flex items-center justify-between border-b border-[#172B3A]">
              <div>
                <h3 className="font-extrabold text-lg">Select Bike for Slot #{pickerModalIndex + 1}</h3>
                <p className="text-xs text-slate-300">Browse verified EV models in Pakistan</p>
              </div>
              <button
                onClick={() => setPickerModalIndex(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-[#172B3A] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Toolbar */}
            <div className="p-4 bg-[#F5F8F6] border-b border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search brand, model..."
                    value={pickerSearchTerm}
                    onChange={(e) => setPickerSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl outline-none focus:border-[#16A36A] bg-white text-slate-900"
                  />
                </div>

                <select
                  value={pickerBrandFilter}
                  onChange={(e) => setPickerBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:border-[#16A36A] bg-white text-slate-900 cursor-pointer"
                >
                  <option value="all">🏢 All Manufacturers</option>
                  {uniqueBrands.filter(b => b !== 'all').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Vehicle Grid Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pickerFilteredModels.map(m => {
                const isSelectedInSlot = selectedModelIds.includes(m.id);
                return (
                  <button
                    key={`modal-item-${m.id}`}
                    onClick={() => handleModelChange(pickerModalIndex, m.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelectedInSlot
                        ? 'bg-[#16A36A]/10 border-[#16A36A] ring-1 ring-[#16A36A]'
                        : 'bg-white hover:bg-[#F5F8F6] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0 border border-slate-200">
                        {m.image ? (
                          <img src={m.image} alt={getFullName(m)} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Bike className="w-6 h-6 text-[#16A36A]" />
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-[#16A36A]">{m.brand}</div>
                        <div className="text-xs font-extrabold text-[#071B2B]">{m.model} {m.variant ? `(${m.variant})` : ''}</div>
                        <div className="text-[11px] text-slate-500">{m.batteryWh} Wh • Range ~{m.rangeMin}-{m.rangeMax || m.rangeMin} km</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-[#071B2B]">{formatPKR(m.price)}</div>
                      {isSelectedInSlot ? (
                        <span className="text-[10px] font-bold text-[#16A36A] flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-400 group-hover:text-[#16A36A]">Select →</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {pickerFilteredModels.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No EV models found matching "{pickerSearchTerm}".
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL 2: INTERACTIVE SHARE OPTIONS
      ──────────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#071B2B]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#16A36A] text-white">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#071B2B]">Share Comparison</h3>
                  <p className="text-xs text-slate-500">Send summary to WhatsApp or copy link</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-slate-400 hover:text-[#071B2B] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareableText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Share via WhatsApp</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </a>

              {/* Native Mobile Share if supported */}
              {typeof navigator !== 'undefined' && (navigator as any).share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 rounded-xl bg-[#071B2B] hover:bg-[#172B3A] text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-[#16A36A]" />
                    <span>Native Device Share</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              )}

              {/* Email Share */}
              <a
                href={`mailto:?subject=${encodeURIComponent('GoInfoEV Bike Comparison')}&body=${encodeURIComponent(getShareableText())}`}
                className="w-full py-3 px-4 rounded-xl bg-[#F5F8F6] hover:bg-slate-200 text-[#071B2B] font-extrabold text-xs flex items-center justify-between border border-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#071B2B]" />
                  <span>Send via Email</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </a>

            </div>

            {/* Copy Link Box */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Comparison Link &amp; Text</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 p-2.5 bg-[#F5F8F6] border border-slate-300 rounded-xl text-xs font-semibold text-[#071B2B] outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-[#071B2B] hover:bg-[#172B3A] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#16A36A]" />
                      <span className="text-[#16A36A]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductComparison;
