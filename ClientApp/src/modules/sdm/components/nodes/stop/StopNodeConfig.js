import { useState, useEffect } from 'react';
import { Input, InfoBox, FormActions } from '../../../../../components/widgets';

const StopNodeConfig = ({ node, onUpdate }) => {
  const [config, setConfig] = useState({
    label: node.label || 'Stop',
    externalLabel: node.externalLabel || '',
  });

  useEffect(() => {
    loadConfig();
  }, [node.id]);

  const loadConfig = () => {
    setConfig({
      label: node.label || 'Stop',
      externalLabel: node.externalLabel || '',
    });
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const validateConfig = () => {
    return {
      valid: true,
      errors: []
    };
  };

  const saveConfig = () => {
    const validation = validateConfig();
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    onUpdate({
      ...node,
      label: config.label,
      externalLabel: config.externalLabel,
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Label (Inside Node)"
        value={config.label}
        onChange={(e) => updateConfig('label', e.target.value)}
      />

      <Input
        label="Label (Below Node)"
        value={config.externalLabel}
        onChange={(e) => updateConfig('externalLabel', e.target.value)}
        placeholder="Optional description..."
      />

      <InfoBox variant="error">
        <strong>Stop Node:</strong> Marks the end of the workflow.
      </InfoBox>

      <FormActions
        onSave={saveConfig}
        onCancel={loadConfig}
      />
    </div>
  );
};

export default StopNodeConfig;
