import { useState, useEffect } from 'react';
import { Input, TextArea, InfoBox, FormActions } from '../../../../../components/widgets';

const ProcessNodeConfig = ({ node, onUpdate }) => {
  const [config, setConfig] = useState({
    label: node.label || 'Process',
    externalLabel: node.externalLabel || '',
    description: node.config?.description || '',
  });

  useEffect(() => {
    loadConfig();
  }, [node.id]);

  const loadConfig = () => {
    setConfig({
      label: node.label || 'Process',
      externalLabel: node.externalLabel || '',
      description: node.config?.description || '',
    });
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const validateConfig = () => {
    const errors = [];
    if (!config.label || config.label.trim() === '') {
      errors.push('Label is required');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  };

  const saveConfig = () => {
    const validation = validateConfig();
    if (!validation.valid) {
      alert('Validation errors: ' + validation.errors.join(', '));
      return;
    }

    onUpdate({
      ...node,
      label: config.label,
      externalLabel: config.externalLabel,
      config: {
        ...node.config,
        description: config.description,
      }
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Label (Inside Node)"
        value={config.label}
        onChange={(e) => updateConfig('label', e.target.value)}
        required
      />

      <Input
        label="Label (Below Node)"
        value={config.externalLabel}
        onChange={(e) => updateConfig('externalLabel', e.target.value)}
        placeholder="Optional description..."
      />

      <TextArea
        label="Description"
        value={config.description}
        onChange={(e) => updateConfig('description', e.target.value)}
        rows={3}
        placeholder="Describe the process step..."
      />

      <InfoBox variant="info">
        <strong>Process Node:</strong> Represents a processing step in the workflow.
      </InfoBox>

      <FormActions
        onSave={saveConfig}
        onCancel={loadConfig}
      />
    </div>
  );
};

export default ProcessNodeConfig;
