import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  Bike, 
  Layers, 
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { EVModel, formatPKR } from '../data/evModels';
import { useCatalog } from '../context/CatalogContext';
import { 
  TARGET_FIELDS, 
  ColumnMappingConfig, 
  convertArbitraryCSVToEVModels, 
  getSampleArbitraryCSV,
  TargetFieldDef
} from '../utils/csvConverter';
import { parseCSVToRows } from '../utils/csvParser';

interface SmartCSVConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCSVText?: string;
  onConvertedAndImported?: (count: number) => void;
}

export const SmartCSVConverterModal: React.FC<SmartCSVConverterModalProps> = ({
  isOpen,
  onClose,
  initialCSVText = '',
  onConvertedAndImported
}) => {
  const { importModels, brands } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawCSVText, setRawCSVText] = useState<string>(initialCSVText);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ColumnMappingConfig>({} as any);

  // Default fallbacks
  const [defaultBrand, setDefaultBrand] = useState<string>('auto');
  const [customBrand, setCustomBrand] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Results
  const [convertedModels, setConvertedModels] = useState<EVModel[]>([]);
  const [standardCSVResult, setStandardCSVResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedCSV, setCopiedCSV] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Active step
  const [activeStep, setActiveStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  // Trigger conversion when initial text is provided AND modal is open
  useEffect(() => {
    if (isOpen && initialCSVText && initialCSVText.trim()) {
      setRawCSVText(initialCSVText);
      try {
        processCSVContent(initialCSVText);
      } catch (err) {
        console.error('Error auto-processing CSV in modal:', err);
      }
    }
  }, [isOpen, initialCSVText]);

  if (!isOpen) return null;

  // Process raw CSV string
  const processCSVContent = (content: string, customMappings?: Partial<ColumnMappingConfig>) => {
    if (!content.trim()) return;

    try {
      const rows = parseCSVToRows(content);
      if (rows.length < 2) {
        setStatusMessage({
          type: 'error',
          text: 'CSV file must have at least 1 header line and 1 data row.'
        });
        return;
      }

      const headers = rows[0];
      setDetectedHeaders(headers);
      setSampleRows(rows.slice(1, 4));

      const brandToUse = defaultBrand === 'auto' ? undefined : (defaultBrand === 'custom' ? customBrand : defaultBrand);

      const result = convertArbitraryCSVToEVModels(content, customMappings || mappings, {
        defaultBrand: brandToUse
      });

      if (result.success) {
        setMappings(result.mappings);
        setConvertedModels(result.models);
        setStandardCSVResult(result.standardCSV);
        setActiveStep('mapping');
        setStatusMessage({
          type: 'success',
          text: `🎉 Auto-mapped ${result.models.length} products successfully from ${headers.length} detected columns!`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Could not parse CSV content. Check format.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error reading CSV: ${err?.message || 'Invalid format'}`
      });
    }
  };

  // Handle file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCSVText(text);
      processCSVContent(text);
    };
    reader.readAsText(file);
  };

  // Re-run conversion when user updates a column mapping
  const handleMappingChange = (fieldKey: keyof ColumnMappingConfig, selectedHeader: string) => {
    const nextMappings = {
      ...mappings,
      [fieldKey]: selectedHeader === '__none__' ? '' : selectedHeader
    };
    setMappings(nextMappings);

    if (rawCSVText) {
      const brandToUse = defaultBrand === 'auto' ? undefined : (defaultBrand === 'custom' ? customBrand : defaultBrand);
      const res = convertArbitraryCSVToEVModels(rawCSVText, nextMappings, {
        defaultBrand: brandToUse
      });
      if (res.success) {
        setConvertedModels(res.models);
        setStandardCSVResult(res.standardCSV);
      }
    }
  };

  // Load sample arbitrary CSV
  const handleLoadSample = () => {
    const sample = getSampleArbitraryCSV();
    setRawCSVText(sample);
    setSelectedFileName('sample_unstandardized_ev_fleet.csv');
    processCSVContent(sample);
  };

  // Download converted standardized CSV file
  const handleDownloadStandardCSV = () => {
    if (!standardCSVResult) return;
    const blob = new Blob([standardCSVResult], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `converted_standard_pakev_fleet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy standard CSV text to clipboard
  const handleCopyStandardCSV = () => {
    if (!standardCSVResult) return;
    navigator.clipboard.writeText(standardCSVResult);
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2500);
  };

  // Publish directly into catalog
  const handleCommitToCatalog = async () => {
    if (convertedModels.length === 0) return;
    setIsProcessing(true);
    try {
      const targetBrand = defaultBrand === 'auto'
        ? convertedModels[0]?.brand
        : (defaultBrand === 'custom' ? customBrand : defaultBrand);

      const res = await importModels(convertedModels, importMode, targetBrand);
      if (res.success) {
        if (onConvertedAndImported) onConvertedAndImported(res.count);
        setStatusMessage({
          type: 'success',
          text: `🎉 Successfully published ${res.count} converted products into the live catalog!`
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to publish to catalog: ${err?.message || 'Server error'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample cell value for mapping row preview
  const getSampleValueForHeader = (headerName: string): string => {
    if (!headerName || sampleRows.length === 0) return '';
    const idx = detectedHeaders.indexOf(headerName);
    if (idx === -1) return '';
    return sampleRows[0]?.[idx] || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Built-in Smart CSV Converter
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Universal Format Auto-Mapper
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically convert ANY non-matching or scraped CSV into official goinfoEV catalog format
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close converter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK STATUS BANNER */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="ml-auto text-[11px] underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP TABS */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStep('upload')}
              className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeStep === 'upload'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>1. Upload File / Paste Text</span>
            </button>

            <button
              type="button"
              disabled={detectedHeaders.length === 0}
              onClick={() => setActiveStep('mapping')}
              className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeStep === 'mapping'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Review Column Mappings ({detectedHeaders.length} Detected)</span>
            </button>

            <button
              type="button"
              disabled={convertedModels.length === 0}
              onClick={() => setActiveStep('preview')}
              className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeStep === 'preview'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Converted Preview ({convertedModels.length} Products)</span>
            </button>
          </div>

          {convertedModels.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadStandardCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Download formatted standard CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Standard CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: UPLOAD / PASTE */}
          {activeStep === 'upload' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/20 rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-600">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>

                <div className="text-base font-black text-slate-900">
                  {selectedFileName ? selectedFileName : 'Drop ANY non-standard or scraped CSV file here'}
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                  Works with all files: scraped datasets, e-commerce exports, custom Excel sheets, or vendor lists with any column headers.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-500 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose File from Computer</span>
                </div>
              </div>

              {/* Quick Sample Button */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Want to test the converter right now?</span>
                  </div>
                  <div className="text-xs text-blue-800/80 mt-0.5">
                    Load a sample non-standard fleet file (with columns like Product Title, Cost_PKR, Battery_Pack, Max_Velocity)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  ⚡ Load Test CSV Sample
                </button>
              </div>

              {/* Raw CSV Textarea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Or Paste CSV Raw Text Directly:
                  </label>
                  {rawCSVText && (
                    <button
                      type="button"
                      onClick={() => processCSVContent(rawCSVText)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      Process Text
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  placeholder="Paste raw CSV content here with any column headers (e.g. Title, Price, Battery, Range, Motor)..."
                  value={rawCSVText}
                  onChange={(e) => {
                    setRawCSVText(e.target.value);
                    if (e.target.value.trim().length > 30) {
                      processCSVContent(e.target.value);
                    }
                  }}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING BOARD */}
          {activeStep === 'mapping' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Configuration Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* Brand Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fleet Brand / Manufacturer:
                  </label>
                  <select
                    value={defaultBrand}
                    onChange={(e) => {
                      setDefaultBrand(e.target.value);
                      if (rawCSVText) {
                        const b = e.target.value === 'auto' ? undefined : (e.target.value === 'custom' ? customBrand : e.target.value);
                        const res = convertArbitraryCSVToEVModels(rawCSVText, mappings, { defaultBrand: b });
                        if (res.success) setConvertedModels(res.models);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="auto">✨ Auto-Detect from Rows</option>
                    <option value="United">United</option>
                    <option value="Crown Electric">Crown Electric</option>
                    <option value="Metro">Metro</option>
                    <option value="Jinpeng">Jinpeng</option>
                    <option value="Yadea">Yadea</option>
                    <option value="Evee">Evee</option>
                    <option value="MS Jaguar">MS Jaguar</option>
                    <option value="Road Prince">Road Prince</option>
                    <option value="custom">+ Custom Brand Name...</option>
                  </select>
                  {defaultBrand === 'custom' && (
                    <input
                      type="text"
                      placeholder="Type brand name..."
                      value={customBrand}
                      onChange={(e) => {
                        setCustomBrand(e.target.value);
                        if (rawCSVText) {
                          const res = convertArbitraryCSVToEVModels(rawCSVText, mappings, { defaultBrand: e.target.value });
                          if (res.success) setConvertedModels(res.models);
                        }
                      }}
                      className="mt-2 w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    />
                  )}
                </div>

                {/* Import Strategy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Target Mode:
                  </label>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="replace">Replace Existing Brand Fleet</option>
                    <option value="append">Append / Merge into Catalog</option>
                  </select>
                </div>

                {/* Status Summary */}
                <div className="flex flex-col justify-center">
                  <div className="text-xs text-slate-500">Detected Columns:</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {detectedHeaders.length} Available in Your CSV
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    ✓ {convertedModels.length} models parsed and ready
                  </div>
                </div>
              </div>

              {/* Column Mapping Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Interactive Column Mapping Table
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      We matched columns automatically. You can change any mapping using the dropdowns below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStep('preview')}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Converted Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200 shadow-2xs">
                      <tr>
                        <th className="p-3 w-48">Standard Catalog Field</th>
                        <th className="p-3 w-64">Map to Your CSV Column</th>
                        <th className="p-3">Sample Value from Row 1</th>
                        <th className="p-3 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TARGET_FIELDS.map((field) => {
                        const currentMappedCol = mappings[field.key] || '';
                        const sampleVal = getSampleValueForHeader(currentMappedCol);
                        const isMapped = Boolean(currentMappedCol);

                        return (
                          <tr key={field.key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{field.label}</span>
                                {field.required && (
                                  <span className="text-[10px] text-rose-600 font-black">*</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1" title={field.description}>
                                {field.description}
                              </div>
                            </td>

                            <td className="p-3">
                              <select
                                value={currentMappedCol || '__none__'}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                  isMapped
                                    ? 'bg-blue-50/50 border-blue-300 text-blue-900'
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                <option value="__none__">-- None / Auto-Calculate --</option>
                                {detectedHeaders.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-3 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                              {sampleVal ? (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                  {sampleVal.length > 45 ? `${sampleVal.slice(0, 45)}...` : sampleVal}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">None or Auto</span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              {isMapped ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" />
                                  <span>Mapped</span>
                                </span>
                              ) : field.required ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                  <span>Required</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  Auto Default
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONVERTED LIVE PREVIEW */}
          {activeStep === 'preview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{convertedModels.length} Models Successfully Converted</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Preview the converted vehicles. All specifications have been formatted to goinfoEV standard schema.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyStandardCSV}
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCSV ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCSV ? 'Copied CSV!' : 'Copy Standard CSV'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadStandardCSV}
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Converted Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[50vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-black sticky top-0 border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Photo</th>
                      <th className="p-3">Brand &amp; Model</th>
                      <th className="p-3">Variant</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Battery Spec</th>
                      <th className="p-3">Chemistry</th>
                      <th className="p-3">Motor</th>
                      <th className="p-3">Range</th>
                      <th className="p-3">Top Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {convertedModels.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3">
                          {m.image ? (
                            <img
                              src={m.image}
                              alt={m.model}
                              className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=100';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <Bike className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-black text-slate-900">{m.model}</div>
                          <div className="text-[10px] text-blue-600 font-bold uppercase">{m.brand}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{m.variant || '-'}</td>
                        <td className="p-3 font-black text-emerald-600">
                          {m.price ? formatPKR(m.price) : 'N/A'}
                        </td>
                        <td className="p-3 text-slate-700">
                          <div className="font-bold">{m.batteryLabel}</div>
                          <div className="text-[10px] text-slate-400">{m.batteryWh} Wh ({(m.batteryWh / 1000).toFixed(2)} kWh)</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              m.chemistry === 'lfp'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.chemistry === 'nmc'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.chemistry}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{m.motor}</td>
                        <td className="p-3 text-slate-700 font-semibold">{m.rangeMin}-{m.rangeMax} km</td>
                        <td className="p-3 text-slate-700">{m.topSpeed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeStep !== 'upload' && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep === 'preview' ? 'mapping' : 'upload')}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            {activeStep === 'upload' && detectedHeaders.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep('mapping')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Continue to Column Mapping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {activeStep === 'mapping' && (
              <button
                type="button"
                onClick={() => setActiveStep('preview')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Review Converted Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {convertedModels.length > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCommitToCatalog}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Publish {convertedModels.length} Models to Catalog</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
