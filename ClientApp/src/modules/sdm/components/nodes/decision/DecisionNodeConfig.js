import { useState, useEffect } from 'react';
import { Input, InfoBox, FormActions } from '../../../../../components/widgets';

const DecisionNodeConfig = ({ node, onUpdate }) => {
  const [config, setConfig] = useState({
    label: node.label || 'Decision?',
    externalLabel: node.externalLabel || '',
    condition: node.config?.condition || '',
  });

  useEffect(() => {
    loadConfig();
  }, [node.id]);

  const loadConfig = () => {
    setConfig({
      label: node.label || 'Decision?',
      externalLabel: node.externalLabel || '',
      condition: node.config?.condition || '',
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
    if (!config.condition || config.condition.trim() === '') {
      errors.push('Condition is required for decision nodes');
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
        condition: config.condition,
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

      <Input
        label="Condition"
        value={config.condition}
        onChange={(e) => updateConfig('condition', e.target.value)}
        placeholder="Enter decision condition..."
        required
      />

      <InfoBox variant="warning">
        <strong>Decision Node:</strong> Represents a branching point in the workflow.
      </InfoBox>

      <FormActions
        onSave={saveConfig}
        onCancel={loadConfig}
      />
    </div>
  );
};

export default DecisionNodeConfig;
