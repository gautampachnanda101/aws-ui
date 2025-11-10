import { useState } from 'react';
import { Plus, Trash2, Save, Upload, RotateCcw } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { LocalStackConfig } from '../types';
import { logger } from '../services';

export function ConfigPage() {
  const { config, currentInstance, addInstance, removeInstance, setCurrentInstance, loadConfig, resetToDefaults } =
    useConfigStore();

  const [newInstance, setNewInstance] = useState<LocalStackConfig>({
    name: '',
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test',
  });

  const [jsonConfig, setJsonConfig] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);

  const handleAddInstance = () => {
    if (!newInstance.name.trim()) {
      alert('Instance name is required');
      return;
    }

    logger.info('Adding new LocalStack instance', { name: newInstance.name });
    addInstance(newInstance);
    setNewInstance({
      name: '',
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
      accessKeyId: 'test',
      secretAccessKey: 'test',
    });
    logger.info('Instance added successfully', { name: newInstance.name });
  };

  const handleRemoveInstance = (name: string) => {
    if (!confirm(`Remove instance ${name}?`)) return;

    logger.info('Removing LocalStack instance', { name });
    removeInstance(name);
    logger.info('Instance removed successfully', { name });
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      logger.info('Importing configuration from JSON');
      loadConfig(parsed);
      setJsonConfig('');
      setShowJsonImport(false);
      logger.info('Configuration imported successfully');
      alert('Configuration imported successfully!');
    } catch (err) {
      logger.error('Failed to import configuration', err as Error);
      alert('Invalid JSON configuration');
    }
  };

  const handleExportJson = () => {
    logger.info('Exporting configuration to JSON');
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localstack-config.json';
    a.click();
    URL.revokeObjectURL(url);
    logger.info('Configuration exported successfully');
  };

  const handleResetToDefaults = () => {
    if (!confirm('Reset to default configuration? This will clear all custom instances and settings.')) {
      return;
    }
    logger.info('Resetting configuration to defaults');
    resetToDefaults();
    logger.info('Configuration reset successfully');
    alert('Configuration reset to defaults. Please refresh the page.');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Configuration</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Current Instances */}
        <div className="card">
          <h2>LocalStack Instances</h2>

          <div style={{ marginTop: '1rem' }}>
            {config.localstackInstances.map((instance) => (
              <div
                key={instance.name}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: currentInstance?.name === instance.name ? '#646cff33' : '#2a2a2a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentInstance(instance.name)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {instance.name}
                      {currentInstance?.name === instance.name && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85em', opacity: 0.7 }}>
                          (Current)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                      <div>Endpoint: {instance.endpoint}</div>
                      <div>Region: {instance.region}</div>
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInstance(instance.name);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportJson}>
              <Save size={16} /> Export Config
            </button>
            <button onClick={() => setShowJsonImport(!showJsonImport)}>
              <Upload size={16} /> Import Config
            </button>
            <button className="btn-danger" onClick={handleResetToDefaults}>
              <RotateCcw size={16} /> Reset to Defaults
            </button>
          </div>
        </div>

        {/* Add New Instance */}
        <div className="card">
          <h2>Add New Instance</h2>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Instance Name"
              value={newInstance.name}
              onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Endpoint (e.g., http://localhost:4566)"
              value={newInstance.endpoint}
              onChange={(e) => setNewInstance({ ...newInstance, endpoint: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Region (e.g., us-east-1)"
              value={newInstance.region}
              onChange={(e) => setNewInstance({ ...newInstance, region: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Access Key ID"
              value={newInstance.accessKeyId}
              onChange={(e) => setNewInstance({ ...newInstance, accessKeyId: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="password"
              placeholder="Secret Access Key"
              value={newInstance.secretAccessKey}
              onChange={(e) =>
                setNewInstance({ ...newInstance, secretAccessKey: e.target.value })
              }
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <button
              className="btn-primary"
              onClick={handleAddInstance}
              style={{ width: '100%' }}
            >
              <Plus size={16} /> Add Instance
            </button>
          </div>
        </div>
      </div>

      {/* JSON Import */}
      {showJsonImport && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Import Configuration from JSON</h2>
          <textarea
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
            placeholder='Paste your JSON configuration here...'
            rows={10}
            style={{ width: '100%', marginTop: '1rem' }}
          />
          <button
            className="btn-success"
            onClick={handleImportJson}
            style={{ marginTop: '1rem' }}
          >
            Import
          </button>
        </div>
      )}
    </div>
  );
}
