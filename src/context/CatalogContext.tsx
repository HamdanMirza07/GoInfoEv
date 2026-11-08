import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { EV_MODELS, EVModel } from '../data/evModels';
import { exportModelsToCSV, getSampleCSVTemplate } from '../utils/csvParser';

const STORAGE_KEY = 'pakev_custom_catalog_v1';

export interface CatalogContextType {
  models: EVModel[];
  loading: boolean;
  refreshCatalog: () => Promise<void>;
  totalCount: number;
  brands: string[];
  brandCounts: Record<string, number>;
  importModels: (
    newModels: EVModel[],
    mode: 'replace' | 'append',
    targetBrand?: string
  ) => Promise<{ success: boolean; count: number }>;
  updateModel: (updatedModel: EVModel) => Promise<{ success: boolean; error?: string }>;
  uploadImageFile: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteModel: (id: string) => Promise<boolean>;
  deleteBrand: (brandName: string) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  exportToCSV: () => void;
  downloadTemplate: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with localStorage cached catalog if available, or factory default EV_MODELS
  const [models, setModels] = useState<EVModel[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached catalog from localStorage:', e);
    }
    return EV_MODELS;
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Sync with backend API on mount
  const refreshCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.models));
          } catch (e) {
            console.warn('Failed to cache models in localStorage:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Catalog backend sync failed, using client storage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  // Save models to both localStorage and backend
  const persistModels = async (updatedList: EVModel[]): Promise<boolean> => {
    setModels(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save models to localStorage:', e);
    }

    try {
      await fetch('/api/admin/catalog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: updatedList })
      });
      return true;
    } catch (e) {
      console.warn('Backend save failed, saved in client storage:', e);
      return true;
    }
  };

  // Import models: mode 'replace' deletes existing models of targetBrand and inserts new ones
  const importModels = async (
    newModels: EVModel[],
    mode: 'replace' | 'append',
    targetBrand?: string
  ): Promise<{ success: boolean; count: number }> => {
    if (!newModels || newModels.length === 0) {
      return { success: false, count: 0 };
    }

    let updatedList: EVModel[] = [];

    if (mode === 'replace') {
      const brandToReplace = (targetBrand || newModels[0]?.brand || '').toLowerCase().trim();
      if (brandToReplace) {
        // Filter out all models belonging to this brand
        const remaining = (models || []).filter(
          m => (m?.brand || '').toLowerCase().trim() !== brandToReplace
        );
        updatedList = [...remaining, ...newModels];
      } else {
        updatedList = [...(models || []), ...newModels];
      }
    } else {
      // Append mode: update if matching id exists, otherwise append
      const existingIds = new Set(newModels.map(m => m?.id).filter(Boolean));
      const remaining = (models || []).filter(m => m && !existingIds.has(m.id));
      updatedList = [...remaining, ...newModels];
    }

    await persistModels(updatedList);
    return { success: true, count: newModels.length };
  };

  // Update individual product model
  const updateModel = async (updatedModel: EVModel): Promise<{ success: boolean; error?: string }> => {
    try {
      const index = models.findIndex(m => m.id === updatedModel.id);
      if (index === -1) {
        return { success: false, error: 'Product not found in current catalog' };
      }
      const updatedList = [...models];
      updatedList[index] = { ...updatedModel };

      // Update local state and localStorage immediately
      setModels(updatedList);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to save models to localStorage:', e);
      }

      // Sync with backend API
      try {
        const res = await fetch(`/api/catalog/models/${encodeURIComponent(updatedModel.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedModel)
        });

        if (!res.ok) {
          // Fallback to full list save
          await persistModels(updatedList);
        }
      } catch (apiErr) {
        console.warn('PUT API failed, falling back to full persist:', apiErr);
        await persistModels(updatedList);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Update model failed:', err);
      return { success: false, error: err?.message || 'Failed to update model' };
    }
  };

  // Upload image file to server (or client fallback)
  const uploadImageFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve({ success: false, error: 'Failed to read image file' });
          return;
        }

        try {
          const res = await fetch('/api/catalog/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl,
              filename: file.name
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              resolve({ success: true, url: data.url });
              return;
            }
          }
          // Server returned non-ok or no url, use dataUrl fallback
          resolve({ success: true, url: dataUrl });
        } catch (err) {
          // Fallback to dataUrl in offline/local situations
          resolve({ success: true, url: dataUrl });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, error: 'Error reading file from disk' });
      };

      reader.readAsDataURL(file);
    });
  };

  // Delete individual model
  const deleteModel = async (id: string): Promise<boolean> => {
    const targetId = String(id).trim();
    const updated = (models || []).filter(m => String(m?.id || '').trim() !== targetId);
    
    // Immediate state & local storage update
    setModels(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save models to localStorage:', e);
    }

    try {
      const res = await fetch(`/api/catalog/models/${encodeURIComponent(targetId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await persistModels(updated);
      }
    } catch (err) {
      console.warn('Backend DELETE route failed, falling back to full save:', err);
      await persistModels(updated);
    }
    return true;
  };

  // Delete entire brand fleet
  const deleteBrand = async (brandName: string): Promise<boolean> => {
    const cleanBrand = String(brandName || '').toLowerCase().trim();
    const updated = (models || []).filter(m => (m?.brand || '').toLowerCase().trim() !== cleanBrand);
    
    // Immediate state & local storage update
    setModels(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save models to localStorage:', e);
    }

    try {
      const res = await fetch(`/api/catalog/brands/${encodeURIComponent(brandName.trim())}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await persistModels(updated);
      }
    } catch (err) {
      console.warn('Backend DELETE brand route failed, falling back to full save:', err);
      await persistModels(updated);
    }
    return true;
  };

  // Reset to default baseline EV_MODELS
  const resetToDefault = async (): Promise<boolean> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setModels(EV_MODELS);
    try {
      await fetch('/api/admin/catalog/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Backend reset failed:', e);
    }
    return true;
  };

  // Export current catalog to downloadable CSV
  const exportToCSV = () => {
    const csvContent = exportModelsToCSV(models || []);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pakev_fleet_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download template CSV
  const downloadTemplate = () => {
    const templateContent = getSampleCSVTemplate();
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pakev_sample_product_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Computed brand statistics
  const { brands, brandCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    (models || []).forEach(m => {
      if (!m) return;
      const b = (m.brand && m.brand.trim()) || 'Other';
      counts[b] = (counts[b] || 0) + 1;
    });
    const uniqueBrands = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    return { brands: uniqueBrands, brandCounts: counts };
  }, [models]);

  return (
    <CatalogContext.Provider
      value={{
        models,
        loading,
        refreshCatalog,
        totalCount: models.length,
        brands,
        brandCounts,
        importModels,
        updateModel,
        uploadImageFile,
        deleteModel,
        deleteBrand,
        resetToDefault,
        exportToCSV,
        downloadTemplate
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    return {
      models: EV_MODELS,
      loading: false,
      refreshCatalog: async () => {},
      totalCount: EV_MODELS.length,
      brands: ['Crown', 'Jinpeng', 'Metro', 'Yadea'],
      brandCounts: {},
      importModels: async () => ({ success: false, count: 0 }),
      updateModel: async () => ({ success: false, error: 'Context not found' }),
      uploadImageFile: async () => ({ success: false, error: 'Context not found' }),
      deleteModel: async () => false,
      deleteBrand: async () => false,
      resetToDefault: async () => false,
      exportToCSV: () => {},
      downloadTemplate: () => {}
    };
  }
  return context;
};
