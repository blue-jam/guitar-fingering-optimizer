import type { OptimizationSettings } from '../types';

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

export const importConfigFromJson = async (file: File): Promise<OptimizationSettings> => {
  const text = await file.text();
  const settings = JSON.parse(text) as OptimizationSettings;
  return settings;
};
