import { EVModel } from '../data/evModels';

export interface CSVParseResult {
  success: boolean;
  models: EVModel[];
  detectedBrand?: string;
  totalRows: number;
  error?: string;
  isScraperFormat: boolean;
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, newlines inside quotes, and commas.
 */
export function parseCSVToRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let curVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      curVal += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(curVal.trim());
      curVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(curVal.trim());
      if (row.some(c => c.length > 0)) {
        rows.push(row);
      }
      row = [];
      curVal = '';
    } else {
      curVal += char;
    }
  }
  if (curVal.length > 0 || row.length > 0) {
    row.push(curVal.trim());
    if (row.some(c => c.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

/**
 * Extracts a numeric price from a string like "PKR 184,000 (NCF)" or "250,000".
 */
export function extractPrice(text?: string): number | null {
  if (!text) return null;
  const match = text.match(/[\d,]+/);
  if (!match) return null;
  const num = parseInt(match[0].replace(/,/g, ''), 10);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Extracts voltage from strings like "72V 38Ah" or descriptions.
 */
export function extractVoltage(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)\s*v(?:olts?)?/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 24 && val <= 120) return val;
  }
  return 72; // Standard default in Pakistan
}

/**
 * Extracts ampere-hours from strings like "72V 30Ah".
 */
export function extractAh(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)\s*ah/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 10 && val <= 120) return val;
  }
  return 30; // Standard default
}

/**
 * Detects battery chemistry from text.
 */
export function detectChemistry(text: string): 'lfp' | 'nmc' | 'graphene' | 'lead-acid' {
  const lower = text.toLowerCase();
  if (lower.includes('iron phosphate') || lower.includes('lfp') || lower.includes('lifepo4')) {
    return 'lfp';
  }
  if (lower.includes('lithium') || lower.includes('ncm') || lower.includes('nmc') || lower.includes('ternary')) {
    return 'nmc';
  }
  if (lower.includes('graphene') || lower.includes('nano carbon') || lower.includes('ncf') || lower.includes('ttfar')) {
    return 'graphene';
  }
  if (lower.includes('lead acid') || lower.includes('dry battery') || lower.includes('gel')) {
    return 'lead-acid';
  }
  return 'graphene';
}

/**
 * Smartly parse any CSV content into EVModel array.
 */
export function parseEVModelsCSV(
  csvContent: string,
  targetBrandOverride?: string
): CSVParseResult {
  if (!csvContent || !csvContent.trim()) {
    return {
      success: false,
      models: [],
      totalRows: 0,
      error: 'CSV file is empty.',
      isScraperFormat: false
    };
  }

  const rows = parseCSVToRows(csvContent);
  if (rows.length < 2) {
    return {
      success: false,
      models: [],
      totalRows: rows.length,
      error: 'CSV file must contain a header and at least one data row.',
      isScraperFormat: false
    };
  }

  const rawHeader = rows[0].map(h => h.replace(/^﻿/, '').trim().toLowerCase());
  const dataRows = rows.slice(1);

  // Check if standard EV schema
  const isStandard =
    rawHeader.includes('brand') ||
    (rawHeader.includes('model') && rawHeader.includes('price'));

  // Detect WebScraper format
  const isScraper =
    rawHeader.includes('web_scraper_order') ||
    rawHeader.includes('item_page_link') ||
    (rawHeader.includes('title') && rawHeader.includes('title2'));

  const parsedModels: EVModel[] = [];
  let detectedBrand = targetBrandOverride || '';

  if (isStandard) {
    // STANDARD CSV PARSING - Flexible alias mapping
    const brandIdx = rawHeader.findIndex(h => h === 'brand' || h === 'brand_name' || h === 'manufacturer' || h === 'company');
    const modelIdx = rawHeader.findIndex(h => h === 'model' || h === 'model_name' || h === 'product_name' || h === 'product' || h === 'vehicle_name' || h === 'name');
    const variantIdx = rawHeader.findIndex(h => h === 'variant' || h === 'version' || h === 'trim');
    const priceIdx = rawHeader.findIndex(h => h === 'price' || h === 'product_price' || h === 'cost' || h === 'price_pkr');
    const voltIdx = rawHeader.findIndex(h => h === 'voltage' || h === 'volts' || h === 'battery_voltage');
    const ahIdx = rawHeader.findIndex(h => h === 'amphours' || h === 'ah' || h === 'capacity' || h === 'battery_capacity_ah' || h === 'battery_capacity');
    const whIdx = rawHeader.findIndex(h => h === 'batterywh' || h === 'wh' || h === 'energy');
    const chemIdx = rawHeader.findIndex(h => h === 'chemistry' || h === 'battery_chemistry');
    const bTypeIdx = rawHeader.findIndex(h => h === 'batterytype' || h === 'battery_type' || h === 'battery');
    const bLabelIdx = rawHeader.findIndex(h => h === 'batterylabel' || h === 'battery_label' || h === 'battery_spec');
    const motorIdx = rawHeader.findIndex(h => h === 'motor' || h === 'motor_power' || h === 'motor_power_w' || h === 'motor_watts');
    const rMinIdx = rawHeader.findIndex(h => h === 'rangemin' || h === 'range_min' || h === 'range' || h === 'range_km');
    const rMaxIdx = rawHeader.findIndex(h => h === 'rangemax' || h === 'range_max');
    const speedIdx = rawHeader.findIndex(h => h === 'topspeed' || h === 'top_speed' || h === 'speed' || h === 'max_speed' || h === 'top_speed_kmh');
    const imgIdx = rawHeader.findIndex(h => h === 'image' || h === 'image_url' || h === 'image2' || h === 'image_2' || h === 'photo');
    const noteIdx = rawHeader.findIndex(h => h === 'note' || h === 'description' || h === 'notes');
    const featIdx = rawHeader.findIndex(h => h === 'keyfeatures' || h === 'features' || h === 'key_features');
    const srcIdx = rawHeader.findIndex(h => h === 'source' || h === 'product_url' || h === 'item_page_link' || h === 'link' || h === 'url');
    const chargerIdx = rawHeader.findIndex(h => h === 'charger');
    const warrantyIdx = rawHeader.findIndex(h => h === 'warranty' || h === 'battery_warranty_months' || h === 'warranty_months');
    const brakesIdx = rawHeader.findIndex(h => h === 'brakes');
    const controllerIdx = rawHeader.findIndex(h => h === 'controller_ah' || h === 'controller');
    const fBrakeIdx = rawHeader.findIndex(h => h === 'front_brake' || h.includes('front_brake'));
    const rBrakeIdx = rawHeader.findIndex(h => h === 'rear_brake' || h.includes('rear_brake'));

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rawModelVal = modelIdx >= 0 && row[modelIdx] ? row[modelIdx].trim() : '';
      const rawBrandVal = brandIdx >= 0 && row[brandIdx] ? row[brandIdx].trim() : '';
      const brand = targetBrandOverride || rawBrandVal || 'Custom EV';
      if (!detectedBrand && brand) detectedBrand = brand;

      let modelName = rawModelVal || `Model ${i + 1}`;
      if (brand && modelName.toLowerCase().startsWith(brand.toLowerCase())) {
        modelName = modelName.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim();
      }
      if (!modelName) modelName = rawModelVal || `Model ${i + 1}`;
      if (!detectedBrand && brand) detectedBrand = brand;

      const price = extractPrice(row[priceIdx]) || 200000;
      const rawVolt = voltIdx >= 0 && row[voltIdx] ? String(row[voltIdx]).replace(/[^0-9.]/g, '') : '';
      const voltage = rawVolt ? parseFloat(rawVolt) || 72 : 72;
      const rawAh = ahIdx >= 0 && row[ahIdx] ? String(row[ahIdx]).replace(/[^0-9.]/g, '') : '';
      const ampHours = rawAh ? parseFloat(rawAh) || 30 : 30;
      const batteryWh =
        whIdx >= 0 && row[whIdx]
          ? parseFloat(row[whIdx]) || Math.round(voltage * ampHours)
          : Math.round(voltage * ampHours);

      const chemVal = chemIdx >= 0 && row[chemIdx] ? row[chemIdx].toLowerCase() : '';
      const chemistry: 'lfp' | 'nmc' | 'graphene' | 'lead-acid' =
        chemVal === 'lfp' || chemVal === 'nmc' || chemVal === 'graphene' || chemVal === 'lead-acid'
          ? (chemVal as any)
          : detectChemistry(`${row[bTypeIdx] || ''} ${row[bLabelIdx] || ''}`);

      const variant = variantIdx >= 0 && row[variantIdx] ? row[variantIdx].trim() : '';
      const id = `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${variant ? `-${variant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}-${Date.now().toString().slice(-4)}${i}`;

      const keyFeatures =
        featIdx >= 0 && row[featIdx]
          ? row[featIdx].split(/[,|;]/).map(s => s.trim()).filter(Boolean)
          : undefined;

      let parsedRMin = 75;
      let parsedRMax = 95;
      if (rMinIdx >= 0 && row[rMinIdx]) {
        const rawRange = row[rMinIdx];
        const match = rawRange.match(/(\d+)(?:\s*(?:-|–|—|to)\s*(\d+))?/i);
        if (match) {
          parsedRMin = parseInt(match[1], 10);
          parsedRMax = match[2] ? parseInt(match[2], 10) : Math.round(parsedRMin * 1.15);
        }
      }
      if (rMaxIdx >= 0 && row[rMaxIdx]) {
        const val = parseFloat(row[rMaxIdx]);
        if (!isNaN(val) && val > 0) parsedRMax = val;
      }

      const charger = chargerIdx >= 0 && row[chargerIdx] ? row[chargerIdx].trim() : undefined;
      let warranty = warrantyIdx >= 0 && row[warrantyIdx] ? row[warrantyIdx].trim() : undefined;
      if (warranty && /^\d+$/.test(warranty)) {
        warranty = `${warranty} Months (Battery Only)`;
      }

      let brakes = brakesIdx >= 0 && row[brakesIdx] ? row[brakesIdx].trim() : undefined;
      if (!brakes) {
        const frontBrake = fBrakeIdx >= 0 && row[fBrakeIdx] ? row[fBrakeIdx].trim() : '';
        const rearBrake = rBrakeIdx >= 0 && row[rBrakeIdx] ? row[rBrakeIdx].trim() : '';
        brakes = [frontBrake, rearBrake].filter(Boolean).join(' / ') || undefined;
      }

      let motor = motorIdx >= 0 && row[motorIdx] ? row[motorIdx].trim() : '1200W Multi-Mode Motor';
      if (/^\d+$/.test(motor)) {
        motor = `${motor}W Electric Motor`;
      }

      let topSpeed = (speedIdx >= 0 && row[speedIdx]) ? row[speedIdx].trim() : '50 km/h';
      if (/^\d+$/.test(topSpeed)) {
        topSpeed = `${topSpeed} km/h`;
      }

      parsedModels.push({
        id,
        brand,
        model: modelName,
        variant: variant || undefined,
        price,
        voltage,
        ampHours,
        batteryWh,
        batteryLabel: (bLabelIdx >= 0 && row[bLabelIdx]) || `${voltage}V ${ampHours}Ah`,
        batteryType: (bTypeIdx >= 0 && row[bTypeIdx]) || (chemistry === 'lfp' ? 'Lithium Iron Phosphate' : chemistry === 'nmc' ? 'Lithium NMC' : 'Nano Carbon Graphene'),
        chemistry,
        motor,
        rangeMin: parsedRMin,
        rangeMax: parsedRMax,
        topSpeed,
        chargeTime: '4-6 hours',
        charger,
        warranty,
        brakes,
        image: (imgIdx >= 0 && row[imgIdx]) || undefined,
        keyFeatures,
        source: (srcIdx >= 0 && row[srcIdx]) || 'Admin CSV Import',
        sourceName: `${brand} Official`,
        note: (noteIdx >= 0 && row[noteIdx]) || `Imported via Admin Dashboard`
      });
    }
  } else {
    // SCRAPER / RAW FORMAT PARSER
    // Handles formats like WebScraper / Octoparse CSVs (Metro, Jinpeng, Crown, Yadea)
    const titleIdx = rawHeader.indexOf('title');
    const title2Idx = rawHeader.indexOf('title2');
    const descIdx = rawHeader.indexOf('name_1') !== -1 ? rawHeader.indexOf('name_1') : rawHeader.indexOf('product_description_paragraph_1');
    const linkIdx = rawHeader.indexOf('item_page_link');

    // Collect all price & image column indices
    const priceColIndices = rawHeader
      .map((h, idx) => (h.includes('price') || h.includes('title3') || h.includes('title4') || h.includes('title5') || h.includes('title6') || h.includes('title7') || h.includes('title8') ? idx : -1))
      .filter(idx => idx !== -1);

    const imageColIndices = rawHeader
      .map((h, idx) => ((h.includes('image') || h.includes('url')) && !h.includes('start_url') && !h.includes('item_page_link') ? idx : -1))
      .filter(idx => idx !== -1);

    // Specific feature column lookups
    const speedColIdx = rawHeader.findIndex(h => h.includes('feature_speed') || h.includes('topspeed') || h.includes('speed'));
    const rangeColIdx = rawHeader.findIndex(h => h.includes('feature_range') || h.includes('range'));
    const motorColIdx = rawHeader.findIndex(h => h.includes('motor_power') || h.includes('motor'));
    const batteryColIdx = rawHeader.findIndex(h => h.includes('battery_type') || h.includes('battery') || h.includes('specification'));
    const priceGrapheneIdx = rawHeader.findIndex(h => h.includes('price_graphene'));
    const priceLithiumIdx = rawHeader.findIndex(h => h.includes('price_lithium'));
    const priceProductIdx = rawHeader.findIndex(h => h.includes('product_price') || h === 'price');

    for (let r = 0; r < dataRows.length; r++) {
      const row = dataRows[r];
      const title1 = titleIdx >= 0 ? row[titleIdx] : '';
      const title2 = title2Idx >= 0 ? row[title2Idx] : '';
      const link = linkIdx >= 0 ? row[linkIdx] : '';
      const desc = descIdx >= 0 ? row[descIdx] : '';

      const speedStr = speedColIdx >= 0 ? row[speedColIdx] || '' : '';
      const rangeStr = rangeColIdx >= 0 ? row[rangeColIdx] || '' : '';
      const motorStr = motorColIdx >= 0 ? row[motorColIdx] || '' : '';
      const batteryStr = batteryColIdx >= 0 ? row[batteryColIdx] || '' : '';
      const pGrapheneRaw = priceGrapheneIdx >= 0 ? row[priceGrapheneIdx] || '' : '';
      const pLithiumRaw = priceLithiumIdx >= 0 ? row[priceLithiumIdx] || '' : '';
      const pProductRaw = priceProductIdx >= 0 ? row[priceProductIdx] || '' : '';

      const fullText = `${title1} ${title2} ${desc} ${speedStr} ${rangeStr} ${motorStr} ${batteryStr}`;

      // Extract prices
      const pGraphene = extractPrice(pGrapheneRaw);
      const pLithium = extractPrice(pLithiumRaw);
      let detectedPrice = extractPrice(pProductRaw);

      if (!detectedPrice) {
        for (const pIdx of priceColIndices) {
          const val = row[pIdx];
          if (val && (/PKR|Rs|₨/i.test(val) || /[\d,]{4,}/.test(val))) {
            const p = extractPrice(val);
            if (p && p >= 35000 && p <= 5000000) {
              detectedPrice = p;
              break;
            }
          }
        }
      }

      // Find best image (support image_2, image_1, image, url)
      let detectedImage: string | undefined = undefined;
      for (const iIdx of imageColIndices) {
        const val = row[iIdx];
        if (val && val.startsWith('http') && !val.includes('/icon_') && !val.includes('download') && (val.includes('.webp') || val.includes('.png') || val.includes('.jpg') || val.includes('.jpeg'))) {
          detectedImage = val.split('\n')[0].trim();
          break;
        }
      }

      // Determine model name
      let rawName = (title1 || title2 || `Model ${r + 1}`).trim() || `Model ${r + 1}`;
      let brand = (targetBrandOverride || '').trim();

      // Auto-detect brand if not provided
      if (!brand) {
        const combined = `${rawName} ${link} ${desc}`.toLowerCase();
        if (combined.includes('crown')) brand = 'Crown';
        else if (combined.includes('jinpeng')) brand = 'Jinpeng';
        else if (combined.includes('metro')) brand = 'Metro';
        else if (combined.includes('yadea')) brand = 'Yadea';
        else if (combined.includes('evee')) brand = 'Evee';
        else if (combined.includes('jaguar')) brand = 'MS Jaguar';
        else if (combined.includes('revoo')) brand = 'REVOO';
        else if (combined.includes('vlektra')) brand = 'Vlektra';
        else brand = 'Custom EV';
      }
      if (!brand) brand = 'Custom EV';
      if (!detectedBrand) detectedBrand = brand;

      // Clean model name
      let cleanModel = rawName.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim();
      if (!cleanModel) cleanModel = rawName || `Model ${r + 1}`;

      // Extract speeds
      let topSpeed = '50 km/h';
      const speedMatch = `${speedStr} ${fullText}`.match(/(\d+(?:\s*-\s*\d+)?)\s*km(?:\/|\s*per\s*)?h/i);
      if (speedMatch) {
        topSpeed = `${speedMatch[1].replace(/\s+/g, '')} km/h`;
      }

      // Extract ranges
      let rangeMin = 65;
      let rangeMax = 85;
      const rangeMatch = `${rangeStr} ${fullText}`.match(/(\d+)(?:\s*(?:-|to)\s*(\d+))?\s*km/i);
      if (rangeMatch) {
        rangeMin = parseInt(rangeMatch[1], 10);
        rangeMax = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : rangeMin;
      }

      // Extract motor
      let motor = '1000W Electric Motor';
      const motorMatch = `${motorStr} ${fullText}`.match(/(\d{3,4})\s*w(?:atts?)?/i);
      if (motorMatch) {
        motor = `${motorMatch[1]}W Electric Motor`;
      }

      // If both Graphene and Lithium prices exist, produce two distinct realistic options
      if (pGraphene && pLithium) {
        // Variant 1: Graphene
        const vGraphene = extractVoltage(fullText) || 72;
        const ahGraphene = extractAh(fullText) || 32;
        const whGraphene = Math.round(vGraphene * ahGraphene);
        const gId = `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cleanModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-graphene-${r + 1}`;

        parsedModels.push({
          id: gId,
          brand,
          model: cleanModel,
          variant: 'Graphene',
          category: cleanModel.toLowerCase().includes('3w') ? 'trike' : 'scooter',
          price: pGraphene,
          voltage: vGraphene,
          ampHours: ahGraphene,
          batteryWh: whGraphene,
          batteryLabel: `${vGraphene}V ${ahGraphene}Ah Graphene`,
          batteryType: 'Chilwee Graphene Battery',
          chemistry: 'graphene',
          motor,
          rangeMin,
          rangeMax,
          topSpeed,
          chargeTime: '7-8 Hours',
          image: detectedImage,
          source: link || 'https://pakev.pk',
          sourceName: `${brand} Official`,
          note: desc || `Official ${brand} ${cleanModel} Graphene edition.`
        });

        // Variant 2: Lithium LFP
        const vLithium = 76.8;
        const ahLithium = 30;
        const whLithium = Math.round(vLithium * ahLithium);
        const lId = `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cleanModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-lithium-${r + 1}`;

        parsedModels.push({
          id: lId,
          brand,
          model: cleanModel,
          variant: 'Phylion Lithium LFP',
          category: cleanModel.toLowerCase().includes('3w') ? 'trike' : 'scooter',
          price: pLithium,
          voltage: vLithium,
          ampHours: ahLithium,
          batteryWh: whLithium,
          batteryLabel: `${vLithium}V ${ahLithium}Ah Lithium LFP`,
          batteryType: 'Phylion Lithium Iron Phosphate (LFP)',
          chemistry: 'lfp',
          motor: motor.includes('1000') ? '1500W High Torque Motor' : motor,
          rangeMin: rangeMin + 10,
          rangeMax: rangeMax + 15,
          topSpeed,
          chargeTime: '4-5 Hours',
          image: detectedImage,
          source: link || 'https://pakev.pk',
          sourceName: `${brand} Official`,
          note: desc || `Official ${brand} ${cleanModel} Phylion Lithium LFP edition.`
        });
      } else {
        // Single model
        const chemistry = detectChemistry(fullText);
        const voltage = extractVoltage(fullText);
        const ampHours = extractAh(fullText);
        const batteryWh = Math.round(voltage * ampHours);
        const isLithium = chemistry === 'lfp' || chemistry === 'nmc';

        let variant = '';
        if (/LFP|Lithium Iron Phosphate/i.test(fullText)) variant = 'LFP';
        else if (/NCF|Nano Carbon/i.test(fullText)) variant = 'NCF';
        else if (/Graphene|TTFAR/i.test(fullText)) variant = 'Graphene';
        else if (/Lithium|NCM/i.test(fullText)) variant = 'Lithium';

        const id = `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cleanModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${r + 1}`;

        parsedModels.push({
          id,
          brand,
          model: cleanModel,
          variant: variant || (isLithium ? 'Lithium' : 'Graphene'),
          category: cleanModel.toLowerCase().includes('3w') ? 'trike' : 'scooter',
          price: detectedPrice || pGraphene || pLithium || 185000,
          voltage,
          ampHours,
          batteryWh,
          batteryLabel: `${voltage}V ${ampHours}Ah ${variant || ''}`.trim(),
          batteryType: chemistry === 'lfp' ? 'Lithium Iron Phosphate (LFP)' : chemistry === 'nmc' ? 'Lithium Battery' : 'Nano Carbon Graphene',
          chemistry,
          motor,
          rangeMin,
          rangeMax,
          topSpeed,
          chargeTime: isLithium ? '4-5 Hours' : '7-8 Hours',
          image: detectedImage,
          source: link || 'https://pakev.pk',
          sourceName: `${brand} Official`,
          note: desc || `Official ${brand} electric vehicle model.`
        });
      }
    }
  }

  return {
    success: parsedModels.length > 0,
    models: parsedModels,
    detectedBrand,
    totalRows: dataRows.length,
    isScraperFormat: isScraper
  };
}

/**
 * Generates CSV string for exporting current models.
 */
export function exportModelsToCSV(models: EVModel[]): string {
  const headers = [
    'brand',
    'model',
    'variant',
    'category',
    'price',
    'voltage',
    'ampHours',
    'batteryWh',
    'batteryLabel',
    'batteryType',
    'chemistry',
    'motor',
    'rangeMin',
    'rangeMax',
    'topSpeed',
    'chargeTime',
    'image',
    'keyFeatures',
    'source',
    'sourceName',
    'note'
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = models.map(m => [
    m.brand,
    m.model,
    m.variant || '',
    m.category || 'bike',
    m.price ?? '',
    m.voltage,
    m.ampHours,
    m.batteryWh,
    m.batteryLabel,
    m.batteryType,
    m.chemistry,
    m.motor,
    m.rangeMin,
    m.rangeMax,
    m.topSpeed,
    m.chargeTime,
    m.image || '',
    m.keyFeatures ? m.keyFeatures.join(' | ') : '',
    m.source,
    m.sourceName,
    m.note
  ]);

  return [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
}

/**
 * Returns a ready-to-fill sample CSV template.
 */
export function getSampleCSVTemplate(): string {
  return `brand,model,variant,category,price,voltage,ampHours,batteryWh,batteryLabel,batteryType,chemistry,motor,rangeMin,rangeMax,topSpeed,chargeTime,image,keyFeatures,source,sourceName,note
Crown,Flash,Pro,bike,285000,73.6,40,2944,73.6V 40Ah LFP,Lithium Iron Phosphate,lfp,1500-2200W Multi-Mode Motor,100,120,60 km/h,4-5 hours,https://example.com/bike.webp,Keyless NFC | Reverse Drive | Alloy Rim,https://crownelectricmobility.com,Crown Official,Sample Crown model entry
Metro,Metrix,LFP,scooter,335000,76.8,45,3456,76.8V 45Ah LFP,Lithium Iron Phosphate,lfp,2000-3800W Motor,140,160,65 km/h,4-5 hours,https://example.com/metrix.webp,Matrix LED | Cruise Control | NFC Ignition,https://metroev.pk,Metro Official,Sample Metro model entry`;
}
