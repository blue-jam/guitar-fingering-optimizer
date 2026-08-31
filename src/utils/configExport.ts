import type { GuitarConfig, OptimizationSettings, StringConfig } from '../types';
import { createDefaultGuitarConfig } from './defaultConfig';

export const exportConfigToJson = (settings: OptimizationSettings): void => {
  const json = JSON.stringify(settings, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'guitar-config.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Merge an imported (possibly partial) GuitarConfig with the default config,
 * filling in any missing or malformed fields.
 */
const mergeWithDefaults = (raw: unknown): OptimizationSettings => {
  const defaults = createDefaultGuitarConfig();

  if (typeof raw !== 'object' || raw === null) {
    return { guitarConfig: defaults };
  }

  // Support both top-level guitarConfig wrapper and bare config objects
  const obj = raw as Record<string, unknown>;
  const rawConfig: Record<string, unknown> =
    (typeof obj.guitarConfig === 'object' && obj.guitarConfig !== null)
      ? (obj.guitarConfig as Record<string, unknown>)
      : obj;

  const fretCount: number =
    typeof rawConfig.fretCount === 'number' ? rawConfig.fretCount : defaults.fretCount;

  const stringCount: number =
    typeof rawConfig.stringCount === 'number' ? rawConfig.stringCount : defaults.stringCount;

  const fingerSpans: number[] =
    Array.isArray(rawConfig.fingerSpans) && rawConfig.fingerSpans.every(x => typeof x === 'number')
      ? (rawConfig.fingerSpans as number[])
      // Legacy key used in some exported configs
      : Array.isArray(rawConfig.fingerSpan) && (rawConfig.fingerSpan as unknown[]).every(x => typeof x === 'number')
        ? (rawConfig.fingerSpan as number[])
        : defaults.fingerSpans;

  const stringSpacings: number[] =
    Array.isArray(rawConfig.stringSpacings) && rawConfig.stringSpacings.every(x => typeof x === 'number')
      ? (rawConfig.stringSpacings as number[])
      : defaults.stringSpacings;

  // Build strings array, filling in missing per-string fields from defaults
  const rawStrings: unknown[] = Array.isArray(rawConfig.strings) ? rawConfig.strings : [];
  const strings: StringConfig[] = Array.from({ length: stringCount }, (_, i) => {
    const defStr = defaults.strings[i] ?? defaults.strings[defaults.strings.length - 1];
    const rawStr = rawStrings[i];
    if (typeof rawStr !== 'object' || rawStr === null) {
      return defStr;
    }
    const s = rawStr as Record<string, unknown>;
    const tuning: number = typeof s.tuning === 'number' ? s.tuning : defStr.tuning;
    const fretDistances: number[] =
      Array.isArray(s.fretDistances) && s.fretDistances.every((x: unknown) => typeof x === 'number')
        ? (s.fretDistances as number[]).slice(0, fretCount)
        : defStr.fretDistances.slice(0, fretCount);
    const difficulty: number[] =
      Array.isArray(s.difficulty) && s.difficulty.every((x: unknown) => typeof x === 'number')
        ? (s.difficulty as number[]).slice(0, fretCount)
        : defStr.difficulty.slice(0, fretCount);
    return { tuning, fretDistances, difficulty };
  });

  const guitarConfig: GuitarConfig = {
    fretCount,
    stringCount,
    strings,
    fingerSpans,
    stringSpacings,
  };

  return { guitarConfig };
};

export const importConfigFromJson = async (file: File): Promise<OptimizationSettings> => {
  const text = await file.text();
  const raw: unknown = JSON.parse(text);
  return mergeWithDefaults(raw);
};
