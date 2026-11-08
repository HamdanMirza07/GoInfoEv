import React, { useState, useRef, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Info,
  Bike,
  Plus,
  ArrowRight,
  ShieldAlert,
  Pencil,
  Edit3,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { EVModel, formatPKR } from '../data/evModels';
import { parseEVModelsCSV, CSVParseResult } from '../utils/csvParser';
import { EditProductModal } from './EditProductModal';
import { SmartCSVConverterModal } from './SmartCSVConverterModal';
import { convertArbitraryCSVToEVModels } from '../utils/csvConverter';

export const AdminFleetManager: React.FC = () => {
  const {
    models,
    totalCount,
    brands,
    brandCounts,
    importModels,
    deleteModel,
    deleteBrand,
    resetToDefault,
    exportToCSV,
    downloadTemplate
  } = useCatalog();

  // Upload & parse state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [targetBrandOverride, setTargetBrandOverride] = useState<string>('auto');
  const [customBrandName, setCustomBrandName] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Parsed preview
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [stagedModels, setStagedModels] = useState<EVModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Edit & Single Product Modal state
  const [editingModel, setEditingModel] = useState<EVModel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Smart Universal CSV Converter state
  const [showSmartConverterModal, setShowSmartConverterModal] = useState<boolean>(false);

  // Database browser state
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Horizontal Brand Scrolling & Fleet Delete Modal state
  const brandsScrollRef = useRef<HTMLDivElement>(null);
  const [showBrandManagerModal, setShowBrandManagerModal] = useState<boolean>(false);
  const [brandManagerSearch, setBrandManagerSearch] = useState<string>('');

  // Scroll horizontal brand strip
  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      brandsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Comprehensive merged brand list for CSV Target Company dropdown
  const allAvailableUploadBrands = useMemo(() => {
    const popularPakistaniBrands = [
      'United',
      'Crown Electric',
      'Crown',
      'Jinpeng',
      'Metro',
      'Yadea',
      'Evee',
      'MS Jaguar',
      'Road Prince',
      'REVOO',
      'Vlektra',
      'Jolta',
      'Okla',
      'YJ Future',
      'Zhong Fa EV',
      'ELFA Electric',
      'Hi-Speed',
      'Super Power',
      'Super Star',
      'Unique',
      'Benelli EV',
      'OREVO'
    ];
    const combined = Array.from(new Set([...brands, ...popularPakistaniBrands]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return combined;
  }, [brands]);

  // In-app Delete Confirmation Modal state (never use window.confirm in iframe)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'model' | 'brand';
    id?: string;
    name: string;
    brand?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'model',
    name: ''
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Open confirmation to delete an individual product
  const requestDeleteModel = (model: EVModel) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'model',
      id: model.id,
      name: `${model.brand || ''} ${model.model || ''}${model.variant ? ` (${model.variant})` : ''}`.trim(),
      brand: model.brand
    });
  };

  // Open confirmation to delete an entire brand fleet
  const requestDeleteBrand = (brandNameToDelete: string) => {
    const count = brandCounts[brandNameToDelete] || 0;
    setDeleteConfirmation({
      isOpen: true,
      type: 'brand',
      name: brandNameToDelete,
      count
    });
  };

  // Execute the confirmed deletion
  const executeConfirmedDelete = async () => {
    if (!deleteConfirmation.isOpen) return;
    setIsDeleting(true);

    try {
      if (deleteConfirmation.type === 'model' && deleteConfirmation.id) {
        await deleteModel(deleteConfirmation.id);
        setStatusMessage({
          type: 'success',
          text: `🗑️ Product "${deleteConfirmation.name}" deleted successfully from catalog.`
        });
      } else if (deleteConfirmation.type === 'brand') {
        const brandToDelete = deleteConfirmation.name;
        const count = deleteConfirmation.count || 0;
        await deleteBrand(brandToDelete);
        if (selectedBrandFilter.toLowerCase() === brandToDelete.toLowerCase()) {
          setSelectedBrandFilter('all');
        }
        setStatusMessage({
          type: 'success',
          text: `🗑️ All ${count} models of brand fleet "${brandToDelete}" have been deleted.`
        });
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to delete: ${err?.message || 'Server error'}`
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation({ isOpen: false, type: 'model', name: '' });
    }
  };

  // Open edit modal for a product
  const handleOpenEdit = (model: EVModel) => {
    setEditingModel(model);
    setIsEditModalOpen(true);
  };

  // Open modal to add a brand new product
  const handleCreateNewProduct = () => {
    const brandName = selectedBrandFilter !== 'all' ? selectedBrandFilter : (brands[0] || 'United');
    const newBlankModel: EVModel = {
      id: `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`,
      brand: brandName,
      model: 'New EV Model',
      variant: 'Standard',
      category: 'Electric Motorcycle',
      price: 250000,
      voltage: 72,
      ampHours: 30,
      batteryWh: 2160,
      batteryLabel: 'Lithium 72V 30Ah',
      batteryType: 'Lithium',
      chemistry: 'lfp',
      motor: '1500W High Torque Motor',
      rangeMin: 70,
      rangeMax: 85,
      topSpeed: '65 km/h',
      chargeTime: '4 - 5 Hours',
      image: '',
      source: '',
      sourceName: 'Admin Created',
      note: 'Added via Admin Dashboard'
    };
    setEditingModel(newBlankModel);
    setIsEditModalOpen(true);
  };

  // Handle direct admin link copy
  const handleCopyAdminLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/admin`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Process and parse CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCSVFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setStatusMessage({ type: 'error', text: 'Please upload a valid .csv file.' });
      return;
    }
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    setSelectedFile(file);
    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);
      executeParse(text);
    };
    reader.readAsText(file);
  };

  const executeParse = (text: string) => {
    try {
      if (!text || !text.trim()) {
        setStatusMessage({ type: 'error', text: 'Uploaded CSV file appears to be empty.' });
        return;
      }

      const brandParam = targetBrandOverride === 'auto' ? undefined : (targetBrandOverride === 'custom' ? customBrandName : targetBrandOverride);
      const result = parseEVModelsCSV(text, brandParam);
      
      // Defensively check if result parsed successfully with meaningful model names
      const isQualityParse = Boolean(
        result.success && 
        result.models && 
        result.models.length > 0 && 
        result.models.some(m => m && typeof m.model === 'string' && !m.model.startsWith('Model '))
      );

      if (isQualityParse) {
        setParseResult(result);
        setStagedModels(result.models);
        setStatusMessage({
          type: 'success',
          text: `Parsed ${result.models.length} models successfully! Format detected: ${result.isScraperFormat ? 'Web Scraper / Raw Fleet' : 'Standard EV Schema'}.`
        });
      } else {
        // Smart Auto-Converter fallback for ANY non-matching or arbitrary CSV format
        const smartResult = convertArbitraryCSVToEVModels(text, {}, { defaultBrand: brandParam });
        if (smartResult.success && smartResult.models && smartResult.models.length > 0) {
          setStagedModels(smartResult.models);
          setParseResult({
            success: true,
            models: smartResult.models,
            detectedBrand: smartResult.models[0]?.brand || brandParam || 'Custom EV',
            totalRows: smartResult.totalRawRows,
            isScraperFormat: false
          });
          setStatusMessage({
            type: 'success',
            text: `⚡ Smart Auto-Converter successfully matched ${smartResult.models.length} models from your custom CSV format! Click "Smart CSV Converter" if you need to adjust any column mappings.`
          });
        } else {
          setParseResult(result);
          setStatusMessage({
            type: 'error',
            text: result.error || smartResult.error || 'Failed to parse CSV. Click "Smart CSV Converter" to map custom columns visually.'
          });
        }
      }
    } catch (err: any) {
      console.error('Error executing CSV parse:', err);
      setStatusMessage({
        type: 'error',
        text: `Error parsing CSV: ${err?.message || 'Unexpected parsing error'}. Click "Smart CSV Converter" to map custom columns.`
      });
    }
  };

  // Re-parse when brand override changes
  const handleBrandChange = (brand: string) => {
    setTargetBrandOverride(brand);
    if (csvRawText && csvRawText.trim()) {
      try {
        const brandParam = brand === 'auto' ? undefined : (brand === 'custom' ? customBrandName : brand);
        const result = parseEVModelsCSV(csvRawText, brandParam);
        setParseResult(result);
        if (result.success && result.models) {
          setStagedModels(result.models);
        }
      } catch (err: any) {
        console.error('Error re-parsing on brand change:', err);
      }
    }
  };

  // Remove single row from staged preview
  const handleRemoveStagedModel = (index: number) => {
    const next = [...stagedModels];
    next.splice(index, 1);
    setStagedModels(next);
  };

  // Commit staged models to database
  const handleCommitUpload = async () => {
    if (stagedModels.length === 0) return;
    setIsProcessing(true);
    try {
      const targetBrand = targetBrandOverride === 'auto'
        ? parseResult?.detectedBrand
        : (targetBrandOverride === 'custom' ? customBrandName : targetBrandOverride);

      const res = await importModels(stagedModels, importMode, targetBrand);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 Successfully published ${res.count} products to the live catalog (${importMode === 'replace' ? `Replaced existing ${targetBrand || ''} models` : 'Appended to catalog'})!`
        });
        // Clear staging
        setStagedModels([]);
        setParseResult(null);
        setSelectedFile(null);
        setCsvRawText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to save catalog: ${err?.message || 'Server error'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered active models for browser
  const filteredActiveModels = (models || []).filter(m => {
    if (!m) return false;
    const modelBrand = (m.brand || '').toLowerCase();
    const matchesBrand = selectedBrandFilter === 'all' || modelBrand === selectedBrandFilter.toLowerCase();
    const query = (searchQuery || '').toLowerCase().trim();
    const modelName = (m.model || '').toLowerCase();
    const variantName = (m.variant || '').toLowerCase();
    const batteryLabel = (m.batteryLabel || '').toLowerCase();
    const matchesSearch = !query || 
      modelName.includes(query) ||
      modelBrand.includes(query) ||
      variantName.includes(query) ||
      batteryLabel.includes(query);
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Direct Link */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Product Fleet Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              EV Products &amp; CSV Fleet Manager
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload and manage electric bike fleets directly from CSV files. Upload new scraped models, replace old company fleets with a single click, or export the live database.
            </p>
          </div>

          {/* Copy Direct Link Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Direct Admin Link
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Live URL
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl text-xs font-mono text-slate-200 truncate">
              <span className="truncate">/admin</span>
              <button
                onClick={handleCopyAdminLink}
                className="ml-auto px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Catalog KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Total Models</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Active Brands</div>
            <div className="text-2xl font-black text-white mt-0.5">{brands.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Crown Models</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{brandCounts['Crown'] || 0}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Metro Models</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{brandCounts['Metro'] || 0}</div>
          </div>
        </div>
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: UPLOAD CSV FLEET */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Step 1: Upload Products via CSV</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop any scraped or formatted CSV file (Crown, Jinpeng, Metro, Yadea, etc.)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSmartConverterModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Open Built-in Smart CSV Converter to auto-map any non-matching file"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart CSV Converter</span>
            </button>
            <button
              onClick={downloadTemplate}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download sample template CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download Template</span>
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export all current live models to CSV"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Live Fleet</span>
            </button>
          </div>
        </div>

        {/* Built-in Smart Converter Promotion Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-2">
                <span>Built-in Universal CSV Converter</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Universal Format Auto-Mapper
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Have a CSV file from a supplier, website scraper, or Excel with different column names? Our converter auto-detects and converts ANY file into official website format.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSmartConverterModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open CSV Converter Tool</span>
          </button>
        </div>

        {/* Upload Config Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {/* Target Brand Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Target Company / Brand:
              </label>
              <span className="text-[10px] text-blue-600 font-bold">
                {allAvailableUploadBrands.length} Brands Available
              </span>
            </div>
            <select
              value={targetBrandOverride}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="auto">✨ Auto-Detect from CSV (Recommended)</option>
              
              <optgroup label="Live Database Brands">
                {brands.map(b => (
                  <option key={`live-${b}`} value={b}>
                    {b} ({brandCounts[b] || 0} models live)
                  </option>
                ))}
              </optgroup>

              <optgroup label="Other Known EV Manufacturers">
                {allAvailableUploadBrands
                  .filter(b => !brands.includes(b))
                  .map(b => (
                    <option key={`other-${b}`} value={b}>
                      {b} (New Fleet)
                    </option>
                  ))}
              </optgroup>

              <option value="custom">+ New Custom Brand...</option>
            </select>
            {targetBrandOverride === 'custom' && (
              <input
                type="text"
                placeholder="Enter Brand Name (e.g. Road Prince)"
                value={customBrandName}
                onChange={(e) => {
                  setCustomBrandName(e.target.value);
                  if (csvRawText) executeParse(csvRawText);
                }}
                className="mt-2 w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            )}
          </div>

          {/* Import Strategy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upload Action Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex flex-col text-left transition-all cursor-pointer ${
                  importMode === 'replace'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-black text-rose-700">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Brand Fleet</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Deletes old models of this brand &amp; sets new CSV
                </span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex flex-col text-left transition-all cursor-pointer ${
                  importMode === 'append'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-black text-blue-700">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append / Merge</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Preserves existing models &amp; adds newly imported
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Drag & Drop File Upload Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            selectedFile
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-600">
            {selectedFile ? (
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 animate-bounce" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <div className="text-sm font-black text-slate-900">
                {selectedFile.name}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to choose another file
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm font-bold text-slate-800">
                Click to browse or drop your CSV file here
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Supports official scraped files (e.g. Crown, Jinpeng, Metro, Yadea) and standard CSVs
              </div>
            </div>
          )}
        </div>

        {/* Quick Paste CSV Raw Text Toggle */}
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={() => setShowPasteModal(!showPasteModal)}
            className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
          >
            {showPasteModal ? 'Hide Manual CSV Text Input' : 'Or Paste CSV Raw Text Directly'}
          </button>

          {stagedModels.length > 0 && (
            <span className="text-emerald-700 font-bold">
              {stagedModels.length} models ready for preview below
            </span>
          )}
        </div>

        {showPasteModal && (
          <div className="space-y-2 animate-fadeIn">
            <textarea
              rows={5}
              placeholder="Paste raw CSV text here..."
              value={csvRawText}
              onChange={(e) => {
                setCsvRawText(e.target.value);
                if (e.target.value.trim()) executeParse(e.target.value);
              }}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE PARSED PREVIEW & PUBLISH */}
      {stagedModels.length > 0 && (
        <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Staging &bull; {stagedModels.length} Products Detected</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Step 2: Review &amp; Confirm Import
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Action: <strong className="text-slate-800 uppercase">{importMode}</strong> &bull; Brand: <strong className="text-blue-600">{parseResult?.detectedBrand || 'Mixed/Detected'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStagedModels([]);
                  setParseResult(null);
                  setSelectedFile(null);
                  setCsvRawText('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCommitUpload}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Publish {stagedModels.length} Models to Catalog</span>
              </button>
            </div>
          </div>

          {/* Staged Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Brand &amp; Model</th>
                  <th className="p-3">Variant</th>
                  <th className="p-3">Price (PKR)</th>
                  <th className="p-3">Battery Spec</th>
                  <th className="p-3">Chemistry</th>
                  <th className="p-3">Range</th>
                  <th className="p-3">Speed</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stagedModels.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3">
                      {m?.image ? (
                        <img
                          src={m.image}
                          alt={m.model || 'EV Model'}
                          className="w-12 h-12 object-contain bg-slate-50 rounded-lg border border-slate-200"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Bike className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-black text-slate-900">{m?.model || `Model ${idx + 1}`}</div>
                      <div className="text-[10px] text-blue-600 font-bold uppercase">{m?.brand || 'Custom EV'}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{m?.variant || '-'}</td>
                    <td className="p-3 font-black text-emerald-600">
                      {m?.price ? formatPKR(m.price) : 'N/A'}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-bold">{m?.batteryLabel || `${m?.voltage || 72}V ${m?.ampHours || 30}Ah`}</div>
                      <div className="text-[10px] text-slate-400">{m?.batteryWh || ((m?.voltage || 72) * (m?.ampHours || 30))} Wh</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          m?.chemistry === 'lfp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m?.chemistry === 'nmc'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m?.chemistry || 'lfp'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">
                      {m?.rangeMin ?? 50}-{m?.rangeMax ?? 80} km
                    </td>
                    <td className="p-3 text-slate-700">{m?.topSpeed || '50 km/h'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveStagedModel(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove this row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: ACTIVE DATABASE BROWSER & FLEET MANAGER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Live Database Catalog ({totalCount} Models)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, search, or purge existing models and entire brand fleets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset catalog back to initial baseline code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Baseline</span>
            </button>
          </div>
        </div>

        {/* Brand Filter & Horizontal Scrolling Strip */}
        <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Filter by Brand Fleet:</span>
              <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {brands.length} Fleets Live
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                (Scroll horizontally or click arrows)
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Left & Right Scroll Buttons */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => scrollBrands('left')}
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Scroll brands left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBrands('right')}
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Scroll brands right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Manage / Delete Fleets Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowBrandManagerModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Manage and delete any company's entire fleet"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Fleet Brands</span>
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Track */}
          <div
            ref={brandsScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-0.5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300"
          >
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                selectedBrandFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Brands ({totalCount})
            </button>

            {brands.map(b => (
              <div
                key={b}
                className={`inline-flex items-center rounded-xl transition-all shrink-0 border ${
                  selectedBrandFilter === b
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedBrandFilter(b)}
                  className="px-3 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  title={`Filter database table to ${b}`}
                >
                  <span>{b}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedBrandFilter === b
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {brandCounts[b] || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDeleteBrand(b);
                  }}
                  className={`p-1 mr-1 rounded-lg transition-colors cursor-pointer ${
                    selectedBrandFilter === b
                      ? 'hover:bg-blue-700 text-blue-200 hover:text-white'
                      : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                  }`}
                  title={`Delete entire ${b} fleet (${brandCounts[b] || 0} models)`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by model, brand, or battery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateNewProduct}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              title="Add a new EV model manually"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          {selectedBrandFilter !== 'all' && (
            <button
              type="button"
              onClick={() => requestDeleteBrand(selectedBrandFilter)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
              title={`Delete all ${brandCounts[selectedBrandFilter] || 0} models of ${selectedBrandFilter}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All {selectedBrandFilter} Models ({brandCounts[selectedBrandFilter] || 0})</span>
            </button>
          )}
        </div>

        {/* Live Database Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Variant</th>
                <th className="p-3">Price</th>
                <th className="p-3">Battery Spec</th>
                <th className="p-3">Chemistry</th>
                <th className="p-3">Range</th>
                <th className="p-3">Speed</th>
                <th className="p-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActiveModels.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No models match the current filter or search query.
                  </td>
                </tr>
              ) : (
                filteredActiveModels.map((m, idx) => (
                  <tr key={m?.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {m?.image ? (
                          <img
                            src={m.image}
                            alt={m.model || 'EV'}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Bike className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-black text-slate-900">{m?.model || 'Unnamed Model'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{m?.id || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-blue-600">{m?.brand || 'EV'}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{m?.variant || '-'}</td>
                    <td className="p-3 font-black text-slate-900">
                      {m?.price ? formatPKR(m.price) : 'N/A'}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-bold">{m?.batteryLabel || `${m?.voltage || 72}V ${m?.ampHours || 30}Ah`}</div>
                      <div className="text-[10px] text-slate-400">{m?.batteryWh || ((m?.voltage || 72) * (m?.ampHours || 30))} Wh</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          m?.chemistry === 'lfp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m?.chemistry === 'nmc'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m?.chemistry || 'lfp'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">
                      {m?.rangeMin ?? 50}-{m?.rangeMax ?? 80} km
                    </td>
                    <td className="p-3 text-slate-700">{m?.topSpeed || '50 km/h'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Edit ${m.model} specs, price & image`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteModel(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Delete ${m?.brand || ''} ${m?.model || ''}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRODUCT & IMAGE MODAL */}
      <EditProductModal
        isOpen={isEditModalOpen}
        model={editingModel}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingModel(null);
        }}
        onSaved={(updated) => {
          setStatusMessage({
            type: 'success',
            text: `🎉 Product "${updated.brand} ${updated.model}" updated successfully! Changes are live across the catalog and website.`
          });
        }}
      />

      {/* MANAGE & DELETE FLEETS MODAL */}
      {showBrandManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Manage &amp; Delete Brand Fleets
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Delete any manufacturer's entire EV fleet from the live database
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBrandManagerModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter for Brands */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search brand to delete (e.g. Crown, Metro, United, Yadea)..."
                  value={brandManagerSearch}
                  onChange={(e) => setBrandManagerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Brands List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
              {brands
                .filter(b => !brandManagerSearch.trim() || b.toLowerCase().includes(brandManagerSearch.toLowerCase().trim()))
                .length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No matching brand fleet found.
                  </div>
                ) : (
                  brands
                    .filter(b => !brandManagerSearch.trim() || b.toLowerCase().includes(brandManagerSearch.toLowerCase().trim()))
                    .map(b => (
                      <div
                        key={b}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-4 transition-all"
                      >
                        <div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                            <span>{b}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {brandCounts[b] || 0} Models Live
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Clicking delete removes all {brandCounts[b] || 0} vehicle models of {b} from the database
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBrandFilter(b);
                              setShowBrandManagerModal(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              requestDeleteBrand(b);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                            title={`Delete all ${brandCounts[b] || 0} models of ${b}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Fleet</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-semibold">
                {brands.length} brand fleets currently active in catalog
              </span>
              <button
                type="button"
                onClick={() => setShowBrandManagerModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUILT-IN SMART CSV FLEET CONVERTER MODAL */}
      <SmartCSVConverterModal
        isOpen={showSmartConverterModal}
        onClose={() => setShowSmartConverterModal(false)}
        initialCSVText={csvRawText}
        onConvertedAndImported={(count) => {
          setStatusMessage({
            type: 'success',
            text: `🎉 Smart Converter: Successfully published ${count} converted products into live catalog!`
          });
        }}
      />

      {/* IN-APP DELETE CONFIRMATION MODAL (Reliable, never blocks or freezes in iframe) */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                {deleteConfirmation.type === 'model'
                  ? 'Delete Vehicle Product?'
                  : `Delete Entire ${deleteConfirmation.name} Fleet?`}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteConfirmation.type === 'model'
                  ? `Are you sure you want to permanently remove this vehicle from the live catalog?`
                  : `Are you sure you want to delete ALL ${deleteConfirmation.count || 0} models belonging to brand "${deleteConfirmation.name}"? This action will remove all their vehicles from the live website.`}
              </p>
            </div>

            {deleteConfirmation.type === 'model' ? (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="truncate text-left">
                  <div className="font-black text-slate-900 truncate">{deleteConfirmation.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{deleteConfirmation.id}</div>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 text-xs flex items-center justify-between text-left">
                <div>
                  <div className="font-black text-rose-950">{deleteConfirmation.name} Fleet</div>
                  <div className="text-[11px] text-rose-700">All company models will be deleted</div>
                </div>
                <span className="px-2.5 py-1 bg-rose-200 text-rose-900 font-black rounded-lg text-xs">
                  {deleteConfirmation.count || 0} models
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'model', name: '' })}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeConfirmedDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
