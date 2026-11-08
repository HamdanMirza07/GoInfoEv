import { EVModel } from '../data/evModels';
import { parseCSVToRows, extractPrice, extractVoltage, extractAh, detectChemistry, exportModelsToCSV } from './csvParser';

export interface ColumnMappingConfig {
  modelCol: string;
  brandCol: string;
  variantCol: string;
  priceCol: string;
  batteryCol: string;
  voltageCol: string;
  ahCol: string;
  chemistryCol: string;
  motorCol: string;
  rangeMinCol: string;
  rangeMaxCol: string;
  speedCol: string;
  chargeTimeCol: string;
  imageCol: string;
  categoryCol: string;
  sourceCol: string;
  noteCol: string;
}

export interface SmartConversionResult {
  success: boolean;
  models: EVModel[];
  standardCSV: string;
  detectedHeaders: string[];
  mappings: ColumnMappingConfig;
  totalRawRows: number;
  warnings: string[];
  error?: string;
}

// Target fields definition for mapping UI
export interface TargetFieldDef {
  key: keyof ColumnMappingConfig;
  label: string;
  required: boolean;
  description: string;
  aliases: string[];
}

export const TARGET_FIELDS: TargetFieldDef[] = [
  {
    key: 'modelCol',
    label: 'Model / Vehicle Name',
    required: true,
    description: 'Name of the electric bike/scooter (e.g. Electric Bullet, Raftaar, T9)',
    aliases: ['model', 'model_name', 'modelname', 'title', 'title1', 'name', 'bike_name', 'product_name', 'product', 'item', 'item_name', 'vehicle', 'bike']
  },
  {
    key: 'brandCol',
    label: 'Brand / Manufacturer',
    required: false,
    description: 'Company name (e.g. United, Crown, Metro, Yadea, Jinpeng)',
    aliases: ['brand', 'brand_name', 'company', 'company_name', 'make', 'manufacturer', 'vendor']
  },
  {
    key: 'priceCol',
    label: 'Price in PKR',
    required: false,
    description: 'Official price or price string (e.g. 285000, PKR 189,900, Rs. 250,000)',
    aliases: ['price', 'price_pkr', 'cost', 'pkr', 'rs', 'rate', 'amount', 'msrp', 'regular_price', 'sale_price', 'price1', 'title3', 'title4']
  },
  {
    key: 'batteryCol',
    label: 'Combined Battery Spec',
    required: false,
    description: 'Full battery string if V and Ah are combined (e.g. 72V 30Ah Lithium LFP, 60V 26Ah)',
    aliases: ['battery', 'battery_spec', 'battery_label', 'batterylabel', 'battery_type', 'batterytype', 'pack', 'power_pack', 'accumulator']
  },
  {
    key: 'voltageCol',
    label: 'System Voltage (V)',
    required: false,
    description: 'Voltage in volts (e.g. 72, 60, 48, 73.6, 76.8)',
    aliases: ['voltage', 'volts', 'volt', 'v', 'system_voltage', 'battery_voltage']
  },
  {
    key: 'ahCol',
    label: 'Battery Capacity (Ah)',
    required: false,
    description: 'Ampere hours (e.g. 30, 40, 26, 32, 20)',
    aliases: ['amphours', 'amp_hours', 'ah', 'amphour', 'capacity', 'battery_ah', 'ampere']
  },
  {
    key: 'rangeMinCol',
    label: 'Range / Mileage (KM)',
    required: false,
    description: 'Single distance or range span (e.g. 80-90 km, 100 km, 75)',
    aliases: ['range', 'rangemin', 'range_min', 'mileage', 'km', 'distance', 'travel_distance', 'km_per_charge']
  },
  {
    key: 'rangeMaxCol',
    label: 'Max Range (KM)',
    required: false,
    description: 'Upper range limit if separate (e.g. 90, 120)',
    aliases: ['rangemax', 'range_max', 'max_range', 'top_range', 'max_km']
  },
  {
    key: 'speedCol',
    label: 'Top Speed',
    required: false,
    description: 'Maximum speed (e.g. 90 - 95 KM/H, 65 km/h, 50)',
    aliases: ['topspeed', 'top_speed', 'speed', 'max_speed', 'velocity', 'kmh', 'max_velocity']
  },
  {
    key: 'motorCol',
    label: 'Motor Power',
    required: false,
    description: 'Motor rating in watts (e.g. 2000W Motor Power, 1500W, 1200W)',
    aliases: ['motor', 'motor_power', 'motor_watts', 'watts', 'power', 'motor_type', 'engine']
  },
  {
    key: 'imageCol',
    label: 'Product Photo / Image URL',
    required: false,
    description: 'Web link or path to product image (e.g. https://... or /assets/...)',
    aliases: ['image', 'image_url', 'img', 'photo', 'pic', 'picture', 'thumbnail', 'featured_image', 'images', 'image_src']
  },
  {
    key: 'chemistryCol',
    label: 'Battery Chemistry',
    required: false,
    description: 'Chemistry type: LFP, NMC, Graphene, or Lead-Acid',
    aliases: ['chemistry', 'battery_chemistry', 'cell_type', 'chem']
  },
  {
    key: 'variantCol',
    label: 'Variant / Trim',
    required: false,
    description: 'Sub-model, color edition, or motor edition (e.g. 2000W, Pro, Standard)',
    aliases: ['variant', 'version', 'edition', 'trim', 'type', 'sub_model']
  },
  {
    key: 'chargeTimeCol',
    label: 'Charging Time',
    required: false,
    description: 'Time to full charge (e.g. 4 - 5 Hours, 3-4h)',
    aliases: ['chargetime', 'charge_time', 'charging_time', 'charging', 'hours']
  },
  {
    key: 'categoryCol',
    label: 'Category',
    required: false,
    description: 'Vehicle class: Electric Motorcycle, Scooty, 3-Wheeler Trike',
    aliases: ['category', 'vehicle_type', 'body_type', 'class']
  },
  {
    key: 'sourceCol',
    label: 'Website Source Link',
    required: false,
    description: 'Product page link or manufacturer website',
    aliases: ['source', 'url', 'link', 'item_page_link', 'website', 'web_link']
  },
  {
    key: 'noteCol',
    label: 'Notes / Description',
    required: false,
    description: 'Features list, warranty details, or extra notes',
    aliases: ['note', 'notes', 'description', 'desc', 'details', 'specifications', 'specs', 'keyfeatures']
  }
];

/**
 * Automatically maps raw headers from an uploaded file to standard target fields.
 */
export function autoDetectColumnMappings(
  rawHeaders: string[],
  sampleRows: string[][] = []
): ColumnMappingConfig {
  const cleanHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_').trim());
  const mapping: ColumnMappingConfig = {
    modelCol: '',
    brandCol: '',
    variantCol: '',
    priceCol: '',
    batteryCol: '',
    voltageCol: '',
    ahCol: '',
    chemistryCol: '',
    motorCol: '',
    rangeMinCol: '',
    rangeMaxCol: '',
    speedCol: '',
    chargeTimeCol: '',
    imageCol: '',
    categoryCol: '',
    sourceCol: '',
    noteCol: ''
  };

  const usedHeaderIndices = new Set<number>();

  // 1. First Pass: Exact or close alias match on header name
  for (const field of TARGET_FIELDS) {
    let matchedIdx = -1;

    for (let i = 0; i < cleanHeaders.length; i++) {
      if (usedHeaderIndices.has(i)) continue;
      const h = cleanHeaders[i];
      if (field.aliases.includes(h)) {
        matchedIdx = i;
        break;
      }
    }

    // Secondary match: substring match if not matched
    if (matchedIdx === -1) {
      for (let i = 0; i < cleanHeaders.length; i++) {
        if (usedHeaderIndices.has(i)) continue;
        const h = cleanHeaders[i];
        if (field.aliases.some(alias => h.includes(alias) || alias.includes(h))) {
          matchedIdx = i;
          break;
        }
      }
    }

    if (matchedIdx !== -1) {
      mapping[field.key] = rawHeaders[matchedIdx];
      usedHeaderIndices.add(matchedIdx);
    }
  }

  // 2. Second Pass: Sample Data Inspection (Heuristic Sniffing)
  if (sampleRows.length > 0) {
    for (let c = 0; c < rawHeaders.length; c++) {
      if (usedHeaderIndices.has(c)) continue;
      const rawHeaderName = rawHeaders[c];
      const samples = sampleRows.map(r => r[c] || '').filter(Boolean);
      if (samples.length === 0) continue;

      // Check if image URL
      if (!mapping.imageCol && samples.some(s => s.startsWith('http') && (s.includes('.jpg') || s.includes('.png') || s.includes('.webp') || s.includes('.svg') || s.includes('/upload')))) {
        mapping.imageCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }

      // Check if price
      if (!mapping.priceCol && samples.some(s => /PKR|\d{5,}/i.test(s) && extractPrice(s) !== null)) {
        mapping.priceCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }

      // Check if battery spec
      if (!mapping.batteryCol && samples.some(s => /\d+\s*V/i.test(s) && /\d+\s*Ah/i.test(s))) {
        mapping.batteryCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }

      // Check if motor watts
      if (!mapping.motorCol && samples.some(s => /\d+\s*W(?:att)?/i.test(s))) {
        mapping.motorCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }

      // Check if range or speed
      if (!mapping.rangeMinCol && samples.some(s => /\d+\s*-\s*\d+\s*km/i.test(s) || (/\d+\s*km/i.test(s) && !s.includes('/h')))) {
        mapping.rangeMinCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }

      if (!mapping.speedCol && samples.some(s => /km\/h|kmph|\d+\s*km\s*speed/i.test(s))) {
        mapping.speedCol = rawHeaderName;
        usedHeaderIndices.add(c);
        continue;
      }
    }
  }

  // Fallback for model column if empty: take first available text column
  if (!mapping.modelCol && rawHeaders.length > 0) {
    mapping.modelCol = rawHeaders[0];
  }

  return mapping;
}

export interface SmartConversionOptions {
  defaultBrand?: string;
  defaultCategory?: string;
  defaultPrice?: number;
  defaultVoltage?: number;
  defaultAh?: number;
  defaultMotor?: string;
}

/**
 * Universal conversion engine: converts any arbitrary CSV content into standardized EVModel array and standard CSV.
 */
export function convertArbitraryCSVToEVModels(
  csvContent: string,
  userMappings?: Partial<ColumnMappingConfig>,
  options: SmartConversionOptions = {}
): SmartConversionResult {
  const warnings: string[] = [];

  if (!csvContent || !csvContent.trim()) {
    return {
      success: false,
      models: [],
      standardCSV: '',
      detectedHeaders: [],
      mappings: {} as any,
      totalRawRows: 0,
      warnings,
      error: 'CSV content is empty.'
    };
  }

  const rows = parseCSVToRows(csvContent);
  if (rows.length < 2) {
    return {
      success: false,
      models: [],
      standardCSV: '',
      detectedHeaders: [],
      mappings: {} as any,
      totalRawRows: rows.length,
      warnings,
      error: 'CSV file must have a header row and at least one data row.'
    };
  }

  const rawHeaders = rows[0];
  const dataRows = rows.slice(1);
  const sampleRows = dataRows.slice(0, 5);

  // Auto-detect mappings, merged with user overrides
  const autoMappings = autoDetectColumnMappings(rawHeaders, sampleRows);
  const mappings: ColumnMappingConfig = {
    ...autoMappings,
    ...(userMappings || {})
  };

  const headerIndexMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerIndexMap[h] = idx;
  });

  const getVal = (row: string[], colName: string): string => {
    if (!colName || !(colName in headerIndexMap)) return '';
    const idx = headerIndexMap[colName];
    return row[idx] ? row[idx].trim() : '';
  };

  const parsedModels: EVModel[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];

    // 1. Model Name
    let rawModel = getVal(row, mappings.modelCol);
    if (!rawModel) {
      rawModel = `EV Vehicle ${i + 1}`;
    }

    // 2. Brand
    let brand = getVal(row, mappings.brandCol);
    if (!brand) {
      brand = options.defaultBrand || 'Custom EV';
    }

    // Auto-detect brand from model string if model starts with brand name (e.g. "United Electric Bullet" -> Brand: United)
    const brandTokens = ['United', 'Crown', 'Metro', 'Jinpeng', 'Yadea', 'Evee', 'MS Jaguar', 'Road Prince', 'REVOO', 'Vlektra', 'Jolta', 'Okla'];
    for (const b of brandTokens) {
      if (rawModel.toLowerCase().startsWith(b.toLowerCase())) {
        if (!brand || brand === 'Custom EV') {
          brand = b;
        }
        // Clean model name
        rawModel = rawModel.replace(new RegExp(`^${b}\\s*`, 'i'), '').trim();
        break;
      }
    }

    // 3. Variant
    let variant = getVal(row, mappings.variantCol);

    // 4. Battery, Voltage, Ah, Wh
    const batteryStr = getVal(row, mappings.batteryCol);
    const voltStr = getVal(row, mappings.voltageCol);
    const ahStr = getVal(row, mappings.ahCol);
    const fullSpecsText = `${batteryStr} ${rawModel} ${variant} ${getVal(row, mappings.noteCol)}`;

    let voltage = voltStr ? parseFloat(voltStr.replace(/[^\d.]/g, '')) : extractVoltage(fullSpecsText);
    if (!voltage || isNaN(voltage)) voltage = options.defaultVoltage || 72;

    let ampHours = ahStr ? parseFloat(ahStr.replace(/[^\d.]/g, '')) : extractAh(fullSpecsText);
    if (!ampHours || isNaN(ampHours)) ampHours = options.defaultAh || 30;

    const batteryWh = Math.round(voltage * ampHours);

    // 5. Chemistry
    let chemistry: 'lfp' | 'nmc' | 'graphene' | 'lead-acid' = 'lfp';
    const chemStr = getVal(row, mappings.chemistryCol).toLowerCase();
    if (chemStr.includes('lfp') || chemStr.includes('lifepo4') || chemStr.includes('phosphate')) {
      chemistry = 'lfp';
    } else if (chemStr.includes('nmc') || chemStr.includes('lithium') || chemStr.includes('ncm')) {
      chemistry = 'nmc';
    } else if (chemStr.includes('graphene') || chemStr.includes('ttfar') || chemStr.includes('ncf')) {
      chemistry = 'graphene';
    } else if (chemStr.includes('lead') || chemStr.includes('acid') || chemStr.includes('dry')) {
      chemistry = 'lead-acid';
    } else {
      chemistry = detectChemistry(fullSpecsText);
    }

    // Auto variant detection if empty
    if (!variant) {
      if (chemistry === 'lfp') variant = 'Lithium LFP';
      else if (chemistry === 'graphene') variant = 'Graphene';
      else if (chemistry === 'nmc') variant = 'Ternary Lithium';
      else variant = 'Standard';
    }

    // 6. Price
    const priceRaw = getVal(row, mappings.priceCol);
    const parsedPrice = extractPrice(priceRaw);
    const price = parsedPrice !== null ? parsedPrice : (options.defaultPrice || 250000);

    // 7. Motor
    let motor = getVal(row, mappings.motorCol);
    if (!motor) {
      const matchMotor = fullSpecsText.match(/(\d{3,5})\s*W(?:att)?/i);
      if (matchMotor) {
        motor = `${matchMotor[1]}W Motor Power`;
      } else {
        motor = options.defaultMotor || (voltage >= 72 ? '1500W-2000W Motor' : '1000W-1200W Motor');
      }
    }

    // 8. Range
    let rangeMin = 70;
    let rangeMax = 90;
    const rMinStr = getVal(row, mappings.rangeMinCol);
    const rMaxStr = getVal(row, mappings.rangeMaxCol);

    if (rMinStr) {
      const rangeMatch = rMinStr.match(/(\d+)\s*(?:-|to)?\s*(\d+)?/i);
      if (rangeMatch) {
        const val1 = parseInt(rangeMatch[1], 10);
        const val2 = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : val1 + 15;
        rangeMin = val1;
        rangeMax = val2;
      } else {
        const single = parseFloat(rMinStr.replace(/[^\d.]/g, ''));
        if (!isNaN(single) && single > 0) {
          rangeMin = Math.round(single * 0.9);
          rangeMax = Math.round(single);
        }
      }
    } else {
      // Heuristic from battery energy
      rangeMin = Math.max(50, Math.round(batteryWh / 28));
      rangeMax = Math.max(65, Math.round(batteryWh / 22));
    }

    if (rMaxStr) {
      const parsedMax = parseFloat(rMaxStr.replace(/[^\d.]/g, ''));
      if (!isNaN(parsedMax) && parsedMax > 0) {
        rangeMax = parsedMax;
      }
    }

    // 9. Top Speed
    let topSpeed = getVal(row, mappings.speedCol);
    if (!topSpeed) {
      const matchSpeed = fullSpecsText.match(/(\d{2,3})\s*(?:km\/h|kmh|km)/i);
      if (matchSpeed) {
        topSpeed = `${matchSpeed[1]} km/h`;
      } else {
        topSpeed = voltage >= 72 ? '70 - 75 km/h' : '50 - 55 km/h';
      }
    }

    // 10. Charging Time
    let chargeTime = getVal(row, mappings.chargeTimeCol);
    if (!chargeTime) {
      const matchCharge = fullSpecsText.match(/(\d+(?:\s*-\s*\d+)?)\s*(?:hours|hrs|h)/i);
      if (matchCharge) {
        chargeTime = `${matchCharge[1]} Hours`;
      } else {
        chargeTime = chemistry === 'lfp' ? '4 - 5 Hours' : '5 - 6 Hours';
      }
    }

    // 11. Image URL
    let image = getVal(row, mappings.imageCol);
    if (image && !image.startsWith('http') && !image.startsWith('/')) {
      image = '';
    }

    // 12. ID generation
    const cleanBrandSlug = brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanModelSlug = rawModel.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
    const id = `${cleanBrandSlug}-${cleanModelSlug}-${Date.now().toString(36).slice(-4)}${i}`;

    const modelObj: EVModel = {
      id,
      brand,
      model: rawModel,
      variant,
      category: getVal(row, mappings.categoryCol) || options.defaultCategory || 'Electric Motorcycle',
      price,
      voltage,
      ampHours,
      batteryWh,
      batteryLabel: `${voltage}V ${ampHours}Ah ${chemistry.toUpperCase()}`,
      batteryType: chemistry === 'lfp' ? 'Lithium Iron Phosphate (LFP)' : chemistry === 'nmc' ? 'Ternary Lithium NMC' : 'Nano Carbon Graphene',
      chemistry,
      motor,
      rangeMin,
      rangeMax,
      topSpeed,
      chargeTime,
      image: image || undefined,
      source: getVal(row, mappings.sourceCol) || 'Converted CSV Fleet Import',
      sourceName: `${brand} Official`,
      note: getVal(row, mappings.noteCol) || `Converted automatically into standardized goinfoEV fleet schema`
    };

    parsedModels.push(modelObj);
  }

  // Generate standardized CSV string
  const standardCSV = exportModelsToCSV(parsedModels);

  return {
    success: parsedModels.length > 0,
    models: parsedModels,
    standardCSV,
    detectedHeaders: rawHeaders,
    mappings,
    totalRawRows: dataRows.length,
    warnings
  };
}

/**
 * Provides a ready-to-test non-standard scraped CSV sample to demonstrate auto-conversion.
 */
export function getSampleArbitraryCSV(): string {
  return `Product Title,Company Name,Cost_PKR,Battery_Pack,Motor_Watts,Estimated_Range,Max_Velocity,Bike_Photo_Link,Extra_Details
United Electric Bullet 2000W,United,285000,Lithium 72V 30AH,2000W Motor,80 - 90 KM,90 - 95 KM/H,/assets/aistudio/Bullet-1024x683_fa90dce1.webp,High torque performance electric bike with disc brakes
Metro Metrix Carbon Pro,Metro,335000,76.8V 45Ah LFP,3000W Brushless,140-160 KM,65 km/h,https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300,Lithium Iron Phosphate battery pack with 4-year warranty
Crown Champion Sports,Crown,285000,73.6V 40Ah LFP,2200W,100-120 km,75 km/h,https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300,Dual disc brakes and regenerative stopping
Yadea Ruibin Graphene,Yadea,209000,72V 26Ah TTFAR Graphene,1500W,90-100 km,55 km/h,https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=300,Fast charging TTFAR graphene power system`;
}
