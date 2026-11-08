import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Bike, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Layers,
  BatteryCharging,
  Gauge,
  FileText
} from 'lucide-react';
import { EVModel, formatPKR } from '../data/evModels';
import { useCatalog } from '../context/CatalogContext';

interface EditProductModalProps {
  isOpen: boolean;
  model: EVModel | null;
  onClose: () => void;
  onSaved?: (updated: EVModel) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  model,
  onClose,
  onSaved
}) => {
  const { updateModel, uploadImageFile, brands, deleteModel } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EVModel | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'specs' | 'performance' | 'details'>('image');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  useEffect(() => {
    if (model) {
      setFormData({ ...model });
      setImageLoadError(false);
      setErrorMsg(null);
      setSuccessToast(null);
      setShowDeleteConfirm(false);
    }
  }, [model]);

  if (!isOpen || !formData) return null;

  // Handle direct text/number input changes
  const handleChange = (field: keyof EVModel, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };

      // Auto-compute batteryWh if voltage or ampHours is updated
      if (field === 'voltage' || field === 'ampHours') {
        const v = field === 'voltage' ? Number(value) : prev.voltage;
        const ah = field === 'ampHours' ? Number(value) : prev.ampHours;
        if (v && ah && (!prev.batteryWh || prev.batteryWh === prev.voltage * prev.ampHours)) {
          next.batteryWh = Math.round(v * ah);
        }
      }
      return next;
    });
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        setFormData(prev => prev ? { ...prev, image: res.url } : null);
        setImageLoadError(false);
        setSuccessToast('Image uploaded and linked successfully!');
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        setErrorMsg(res.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error uploading image file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Quick Preset Sample Images
  const presetImages = [
    {
      label: 'United Electric Bullet',
      url: '/assets/aistudio/Bullet-1024x683_fa90dce1.webp'
    },
    {
      label: 'Performance Sport Bike',
      url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80'
    },
    {
      label: 'Modern Electric Scooty',
      url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80'
    },
    {
      label: 'Commuter Classic',
      url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop&q=80'
    }
  ];

  // Submit and save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model.trim()) {
      setErrorMsg('Model name cannot be empty.');
      return;
    }
    if (!formData.brand.trim()) {
      setErrorMsg('Brand name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const prepared: EVModel = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        voltage: Number(formData.voltage) || 72,
        ampHours: Number(formData.ampHours) || 30,
        batteryWh: Number(formData.batteryWh) || Math.round((Number(formData.voltage) || 72) * (Number(formData.ampHours) || 30)),
        rangeMin: Number(formData.rangeMin) || 0,
        rangeMax: Number(formData.rangeMax) || 0
      };

      const result = await updateModel(prepared);
      if (result.success) {
        setSuccessToast(`Product "${prepared.brand} ${prepared.model}" saved successfully!`);
        if (onSaved) onSaved(prepared);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(result.error || 'Failed to save product changes.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData?.id) return;
    setIsDeleting(true);
    try {
      await deleteModel(formData.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server error while deleting product.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Edit EV Product Details
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Update specifications, pricing, battery setup, and change/upload product photos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successToast && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TABS STRIP */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`py-3 px-3 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Product Photo &amp; Image</span>
            {formData.image && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Model &amp; Battery Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-3 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Range &amp; Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes &amp; Warranty</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRODUCT IMAGE & PHOTO */}
          {activeTab === 'image' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Live Image Preview Card */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5 self-start">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Photo Preview</span>
                  </div>

                  <div className="w-full aspect-[4/3] rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-xs p-2">
                    {formData.image && !imageLoadError ? (
                      <img
                        src={formData.image}
                        alt={formData.model}
                        className="w-full h-full object-contain"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                        <Bike className="w-16 h-16 stroke-1 mb-2 text-slate-300" />
                        <span className="text-xs font-bold text-slate-500">
                          {imageLoadError ? 'Image could not be loaded' : 'No photo uploaded'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Upload a photo or enter a valid image URL
                        </span>
                      </div>
                    )}

                    {formData.image && !imageLoadError && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                        Active
                      </span>
                    )}
                  </div>

                  {formData.image && (
                    <div className="w-full mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-500 truncate max-w-[170px]" title={formData.image}>
                        {formData.image}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => prev ? { ...prev, image: '' } : null);
                          setImageLoadError(false);
                        }}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload & URL Controls */}
                <div className="md:col-span-7 space-y-5">
                  {/* Option A: Local File Upload */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Image File</span>
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        From Computer
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Upload a clean transparent PNG, WebP, or JPG photo of the electric bike. It will be stored securely on the server.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Choose Image from Device</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option B: Direct Image URL */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-2">
                    <label className="block text-xs font-black text-slate-800">
                      Or Paste Image URL / Public Path:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /assets/aistudio/... or https://..."
                      value={formData.image || ''}
                      onChange={(e) => {
                        handleChange('image', e.target.value);
                        setImageLoadError(false);
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Tip: Local assets like <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">/assets/aistudio/Bullet-1024x683_fa90dce1.webp</code> can be directly specified.
                    </p>
                  </div>

                  {/* Preset Library Suggestions */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Quick Preset Suggestions:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {presetImages.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handleChange('image', p.url);
                            setImageLoadError(false);
                          }}
                          className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            formData.image === p.url
                              ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.label}
                            className="w-7 h-7 rounded object-contain bg-slate-100 shrink-0"
                          />
                          <span className="truncate text-[11px]">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODEL & BATTERY SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand / Manufacturer:
                  </label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. United, Crown, Metro, Yadea"
                  />
                  <datalist id="brand-suggestions">
                    {brands.map(b => (
                      <option key={b} value={b} />
                    ))}
                    <option value="United" />
                    <option value="Crown Electric" />
                    <option value="Metro" />
                    <option value="Yadea" />
                    <option value="Jinpeng" />
                    <option value="Evee" />
                    <option value="Road Prince" />
                  </datalist>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Model Name:
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Electric Bullet, Raftaar, T9"
                  />
                </div>

                {/* Variant */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Variant / Edition:
                  </label>
                  <input
                    type="text"
                    value={formData.variant || ''}
                    onChange={(e) => handleChange('variant', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2000W Motor Power, Pro, LFP"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Price (PKR):
                  </label>
                  <input
                    type="number"
                    value={formData.price !== null ? formData.price : ''}
                    onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 285000"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formData.price ? formatPKR(formData.price) : 'Call for Price / TBA'}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category:
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Electric Motorcycle, Modern Scooty"
                  />
                </div>

                {/* Chemistry */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Battery Chemistry:
                  </label>
                  <select
                    value={formData.chemistry}
                    onChange={(e) => handleChange('chemistry', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lfp">Lithium Iron Phosphate (LFP) - 3000+ Cycles</option>
                    <option value="nmc">Ternary Lithium / NMC - High Performance</option>
                    <option value="graphene">Graphene / TTFAR - Affordable Replacement</option>
                    <option value="lead-acid">Lead-Acid / Dry Battery</option>
                  </select>
                </div>
              </div>

              {/* BATTERY POWERTRAIN ROW */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-600" />
                  <span>Battery Capacity &amp; Motor Power</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Voltage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      System Voltage (V):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.voltage}
                      onChange={(e) => handleChange('voltage', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      placeholder="e.g. 72"
                    />
                  </div>

                  {/* Amp Hours */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Capacity (Ah):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.ampHours}
                      onChange={(e) => handleChange('ampHours', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      placeholder="e.g. 30"
                    />
                  </div>

                  {/* Battery Wh */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Energy (Wh):
                    </label>
                    <input
                      type="number"
                      value={formData.batteryWh}
                      onChange={(e) => handleChange('batteryWh', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      placeholder="e.g. 2160"
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ~{(formData.batteryWh / 1000).toFixed(2)} kWh
                    </div>
                  </div>

                  {/* Motor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Motor Power:
                    </label>
                    <input
                      type="text"
                      value={formData.motor}
                      onChange={(e) => handleChange('motor', e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      placeholder="e.g. 2000W Motor Power"
                    />
                  </div>
                </div>

                {/* Battery Label */}
                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Battery Label:
                  </label>
                  <input
                    type="text"
                    value={formData.batteryLabel}
                    onChange={(e) => handleChange('batteryLabel', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. Lithium 72V 30Ah"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RANGE & PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Min Range */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Range (KM):
                  </label>
                  <input
                    type="number"
                    value={formData.rangeMin}
                    onChange={(e) => handleChange('rangeMin', Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    placeholder="e.g. 80"
                  />
                </div>

                {/* Max Range */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Range (KM):
                  </label>
                  <input
                    type="number"
                    value={formData.rangeMax}
                    onChange={(e) => handleChange('rangeMax', Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    placeholder="e.g. 90"
                  />
                </div>

                {/* Top Speed */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Top Speed:
                  </label>
                  <input
                    type="text"
                    value={formData.topSpeed}
                    onChange={(e) => handleChange('topSpeed', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    placeholder="e.g. 90 - 95 KM / 90 km/h"
                  />
                </div>

                {/* Charging Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Charging Time:
                  </label>
                  <input
                    type="text"
                    value={formData.chargeTime}
                    onChange={(e) => handleChange('chargeTime', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    placeholder="e.g. 4 - 5 Hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                {/* Charger Spec */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Charger Specification:
                  </label>
                  <input
                    type="text"
                    value={formData.charger || ''}
                    onChange={(e) => handleChange('charger', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. 72V 6A Smart Cutoff Charger"
                  />
                </div>

                {/* Brakes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brake System:
                  </label>
                  <input
                    type="text"
                    value={formData.brakes || ''}
                    onChange={(e) => handleChange('brakes', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. Front &amp; Rear Disc CBS"
                  />
                </div>

                {/* Security */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security / Remote:
                  </label>
                  <input
                    type="text"
                    value={formData.security || ''}
                    onChange={(e) => handleChange('security', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. Smart Key, Remote Lock, Anti-Theft"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTES, SOURCE & WARRANTY */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warranty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Warranty Terms:
                  </label>
                  <input
                    type="text"
                    value={formData.warranty || ''}
                    onChange={(e) => handleChange('warranty', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. 30-Month Battery Warranty, 1-Year Motor"
                  />
                </div>

                {/* Source Website URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Source URL:
                  </label>
                  <input
                    type="text"
                    value={formData.source || ''}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. https://unitedmotorcycles.com.pk"
                  />
                </div>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Notes / Description:
                </label>
                <textarea
                  rows={4}
                  value={formData.note || ''}
                  onChange={(e) => handleChange('note', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  placeholder="Additional notes about features, top speed, or battery specifications..."
                />
              </div>
            </div>
          )}
        </form>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Delete this product from catalog"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-200 text-xs animate-fadeIn">
                <span className="font-bold text-rose-900 text-xs px-1">Delete product permanently?</span>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Product Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
