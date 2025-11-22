import React from 'react';
import type { OptimizationSettings } from '../types';
import { exportConfigToJson, importConfigFromJson } from '../utils/configExport';

interface ConfigExporterProps {
  settings: OptimizationSettings;
  onImport: (settings: OptimizationSettings) => void;
}

const ConfigExporter: React.FC<ConfigExporterProps> = ({ settings, onImport }) => {
  const handleExport = () => {
    exportConfigToJson(settings);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedSettings = await importConfigFromJson(file);
      onImport(importedSettings);
    } catch (error) {
      alert('Failed to import configuration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="config-exporter">
      <h2>Configuration Management</h2>
      
      <div className="export-section">
        <button onClick={handleExport}>
          Export Configuration as JSON
        </button>
      </div>

      <div className="import-section">
        <label>
          Import Configuration:
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
};

export default ConfigExporter;
