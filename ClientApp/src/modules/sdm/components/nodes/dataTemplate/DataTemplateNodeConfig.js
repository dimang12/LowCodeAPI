import { useState, useEffect } from 'react';
import { Input, Button, InfoBox, FormActions, Drawer, DialogUI } from '../../../../../components/widgets';
import { PlusIcon, TrashIcon, PencilSquareIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { nanoid } from 'nanoid';

const DataTemplateNodeConfig = ({ node, onUpdate }) => {
  const [config, setConfig] = useState({
    label: node.label || 'Data Template',
    externalLabel: node.externalLabel || '',
    tableName: node.config?.tableName || '',
    generateOption: node.config?.generateOption || 'enter',
    fields: node.config?.fields || [],
    entryData: node.config?.entryData || [],
    autoData: node.config?.autoData || { rowsNum: 0, rows: {} },
  });

  const [showEntryDataDrawer, setShowEntryDataDrawer] = useState(false);
  const [showAutoDataDrawer, setShowAutoDataDrawer] = useState(false);

  useEffect(() => {
    loadConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const loadConfig = () => {
    setConfig({
      label: node.label || 'Data Template',
      externalLabel: node.externalLabel || '',
      tableName: node.config?.tableName || '',
      generateOption: node.config?.generateOption || 'enter',
      fields: node.config?.fields || [],
      entryData: node.config?.entryData || [],
      autoData: node.config?.autoData || { rowsNum: 0, rows: {} },
    });
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Field Management
  const addField = () => {
    const newField = {
      id: nanoid(8),
      dsField: `col_${config.fields.length + 1}`,
      pubField: '',
      dataType: 'text',
      dataSubType: 'general'
    };
    updateConfig('fields', [...config.fields, newField]);
  };

  const removeField = (fieldId) => {
    updateConfig('fields', config.fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId, key, value) => {
    updateConfig('fields', config.fields.map(f => 
      f.id === fieldId ? { ...f, [key]: value } : f
    ));
  };

  const dataTypeOptions = [
    { value: 'text', label: 'TEXT' },
    { value: 'number', label: 'NUMBER' },
    { value: 'date', label: 'DATE' },
    { value: 'datetime', label: 'DATETIME' },
    { value: 'boolean', label: 'BOOLEAN' },
  ];

  const subTypeOptions = {
    text: [
      { value: 'general', label: 'General' },
      { value: 'email', label: 'Email' },
      { value: 'url', label: 'URL' },
      { value: 'phone', label: 'Phone' },
    ],
    number: [
      { value: 'general', label: 'General' },
      { value: 'integer', label: 'Integer' },
      { value: 'decimal', label: 'Decimal' },
      { value: 'currency', label: 'Currency' },
    ],
    date: [
      { value: 'general', label: 'General' },
    ],
    datetime: [
      { value: 'general', label: 'General' },
    ],
    boolean: [
      { value: 'general', label: 'General' },
    ],
  };

  const validateConfig = () => {
    const errors = [];
    if (!config.label || config.label.trim() === '') {
      errors.push('Template name is required');
    }
    if (config.fields.length === 0) {
      errors.push('At least one field is required');
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
        tableName: config.tableName,
        generateOption: config.generateOption,
        fields: config.fields,
        entryData: config.entryData,
        autoData: config.autoData,
      }
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Template Name (Inside Node)"
        value={config.label}
        onChange={(e) => updateConfig('label', e.target.value)}
        placeholder="Enter template name..."
        required
      />

      <Input
        label="Label (Below Node)"
        value={config.externalLabel}
        onChange={(e) => updateConfig('externalLabel', e.target.value)}
        placeholder="Optional description..."
      />

      <Input
        label="New Table Name"
        value={config.tableName}
        onChange={(e) => updateConfig('tableName', e.target.value)}
        placeholder="Enter table name..."
      />

      {/* Data Generation Option */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Data Generation Option:
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="enter"
              checked={config.generateOption === 'enter'}
              onChange={(e) => updateConfig('generateOption', e.target.value)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Enter</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="parent"
              checked={config.generateOption === 'parent'}
              onChange={(e) => updateConfig('generateOption', e.target.value)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">From Parent</span>
          </label>
        </div>
      </div>

      {/* Field Builder Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Fields Configuration
          </label>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={addField}
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Add Field
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<DocumentIcon className="w-4 h-4" />}
              title="Import CSV"
            >
              Import
            </Button>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Field Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Data Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Sub Type
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {config.fields.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-center text-sm text-gray-500">
                    No fields added yet. Click "Add Field" to start.
                  </td>
                </tr>
              ) : (
                config.fields.map((field) => (
                  <tr key={field.id}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={field.pubField}
                        onChange={(e) => updateField(field.id, 'pubField', e.target.value)}
                        placeholder={field.dsField}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={field.dataType}
                        onChange={(e) => {
                          updateField(field.id, 'dataType', e.target.value);
                          updateField(field.id, 'dataSubType', 'general');
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {dataTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={field.dataSubType}
                        onChange={(e) => updateField(field.id, 'dataSubType', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {subTypeOptions[field.dataType]?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove field"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Entry Options */}
      {config.generateOption === 'enter' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">Enter Data Manually:</span>
              <span className="ml-2 text-sm font-bold text-indigo-600">
                {config.entryData.length} rows
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEntryDataDrawer(true)}
              icon={<PencilSquareIcon className="w-4 h-4" />}
              disabled={config.fields.length === 0}
            >
              Edit Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">Auto-generate Data:</span>
              <span className="ml-2 text-sm font-bold text-indigo-600">
                {config.autoData.rowsNum} rows
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAutoDataDrawer(true)}
              icon={<PencilSquareIcon className="w-4 h-4" />}
              disabled={config.fields.length === 0}
            >
              Edit Auto-Gen
            </Button>
          </div>
        </div>
      )}

      <InfoBox variant="purple">
        <strong>Data Template Node:</strong> Create structured data with field definitions and auto-generation options.
      </InfoBox>

      <FormActions
        onSave={saveConfig}
        onCancel={loadConfig}
      />

      {/* Entry Data Dialog */}
      <EntryDataDrawer
        isOpen={showEntryDataDrawer}
        onClose={() => setShowEntryDataDrawer(false)}
        fields={config.fields}
        entryData={config.entryData}
        onSave={(data) => {
          // Update config with new entry data
          const updatedConfig = { ...config, entryData: data };
          setConfig(updatedConfig);
          
          // Auto-save to backend
          onUpdate({
            ...node,
            label: updatedConfig.label,
            externalLabel: updatedConfig.externalLabel,
            config: {
              tableName: updatedConfig.tableName,
              generateOption: updatedConfig.generateOption,
              fields: updatedConfig.fields,
              entryData: data,
              autoData: updatedConfig.autoData,
            }
          });
          
          setShowEntryDataDrawer(false);
        }}
      />

      {/* Auto Data Drawer */}
      <AutoDataDrawer
        isOpen={showAutoDataDrawer}
        onClose={() => setShowAutoDataDrawer(false)}
        fields={config.fields}
        autoData={config.autoData}
        onSave={(data) => {
          updateConfig('autoData', data);
          setShowAutoDataDrawer(false);
        }}
      />
    </div>
  );
};

// Entry Data Dialog Component
const EntryDataDrawer = ({ isOpen, onClose, fields, entryData, onSave }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load saved entryData when dialog opens
      setRows(entryData && entryData.length > 0 ? [...entryData] : []);
    }
  }, [isOpen, entryData]);

  const addRow = () => {
    const newRow = {};
    fields.forEach(field => {
      newRow[field.pubField || field.dsField] = '';
    });
    setRows([...rows, newRow]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex, fieldName, value) => {
    setRows(rows.map((row, i) => 
      i === rowIndex ? { ...row, [fieldName]: value } : row
    ));
  };

  const handleSave = () => {
    onSave(rows);
  };

  const dialogActions = [
    {
      label: 'Cancel',
      onClick: onClose,
      variant: 'outlined',
      color: 'inherit'
    },
    {
      label: 'Save Data',
      onClick: handleSave,
      variant: 'contained',
      color: 'primary'
    }
  ];

  return (
    <DialogUI
      open={isOpen}
      onClose={onClose}
      title="Enter Data Manually"
      maxWidth="xl"
      fullWidth={true}
      resizable={true}
      defaultSize={{ width: 1200, height: 600 }}
      actions={dialogActions}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Total rows: <span className="font-bold text-indigo-600">{rows.length}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={addRow}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Add Row
          </Button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12 bg-gray-50">#</th>
                {fields.map(field => (
                  <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[150px] bg-gray-50">
                    {field.pubField || field.dsField}
                    <div className="text-xs font-normal text-gray-500 normal-case">
                      {field.dataType}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-20 bg-gray-50">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-3 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <DocumentIcon className="w-12 h-12 text-gray-300" />
                      <div>No data rows yet. Click "Add Row" to start entering data.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500 font-medium">{rowIndex + 1}</td>
                    {fields.map(field => {
                      const fieldName = field.pubField || field.dsField;
                      return (
                        <td key={field.id} className="px-3 py-2">
                          <input
                            type={field.dataType === 'number' ? 'number' : 
                                  field.dataType === 'date' ? 'date' : 
                                  field.dataType === 'datetime' ? 'datetime-local' : 'text'}
                            value={row[fieldName] || ''}
                            onChange={(e) => updateCell(rowIndex, fieldName, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={`Enter ${fieldName}`}
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Remove row"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DialogUI>
  );
};

// Auto Data Drawer Component
const AutoDataDrawer = ({ isOpen, onClose, fields, autoData, onSave }) => {
  const [config, setConfig] = useState({ rowsNum: 0, rows: {} });

  useEffect(() => {
    if (isOpen) {
      setConfig({ ...autoData });
    }
  }, [isOpen, autoData]);

  const updateRowsNum = (value) => {
    setConfig(prev => ({ ...prev, rowsNum: parseInt(value) || 0 }));
  };

  const updateFieldFunction = (fieldName, func, params) => {
    setConfig(prev => ({
      ...prev,
      rows: {
        ...prev.rows,
        [fieldName]: { function: func, parameters: params }
      }
    }));
  };

  const randomFunctions = [
    { value: 'random_int', label: 'Random Integer', params: ['min', 'max'] },
    { value: 'random_num', label: 'Random Number', params: ['min', 'max'] },
    { value: 'random_from_list', label: 'Random from List', params: ['comma-separated values'] },
    { value: 'random_date', label: 'Random Date', params: ['startDate', 'endDate'] },
    { value: 'random_datetime', label: 'Random DateTime', params: ['startDate', 'endDate'] },
    { value: 'random_sentence', label: 'Random Sentence', params: ['minWords', 'maxWords', 'minChars', 'maxChars'] },
    { value: 'random_latlng', label: 'Random Lat/Lng', params: ['lat1', 'lat2', 'lng1', 'lng2'] },
    { value: 'now', label: 'Current Date/Time', params: ['format'] },
    { value: 'sequence', label: 'Sequence', params: ['start', 'end', 'gap'] },
  ];

  const handleSave = () => {
    onSave(config);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Auto-generate Data Configuration" width="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Rows to Generate
          </label>
          <input
            type="number"
            value={config.rowsNum}
            onChange={(e) => updateRowsNum(e.target.value)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Field Generation Rules</h3>
          <div className="space-y-3">
            {fields.map(field => {
              const fieldName = field.pubField || field.dsField;
              const fieldConfig = config.rows[fieldName] || { function: '', parameters: [] };
              
              return (
                <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-medium text-sm text-gray-700 mb-2">{fieldName}</div>
                  
                  <div className="space-y-2">
                    <select
                      value={fieldConfig.function}
                      onChange={(e) => updateFieldFunction(fieldName, e.target.value, [])}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">[ Select Function ]</option>
                      {randomFunctions.map(func => (
                        <option key={func.value} value={func.value}>{func.label}</option>
                      ))}
                    </select>

                    {fieldConfig.function && (
                      <div className="text-xs text-gray-600">
                        <div className="font-medium mb-1">Parameters:</div>
                        {randomFunctions.find(f => f.value === fieldConfig.function)?.params.map((param, i) => (
                          <input
                            key={i}
                            type="text"
                            placeholder={param}
                            value={fieldConfig.parameters[i] || ''}
                            onChange={(e) => {
                              const newParams = [...(fieldConfig.parameters || [])];
                              newParams[i] = e.target.value;
                              updateFieldFunction(fieldName, fieldConfig.function, newParams);
                            }}
                            className="w-full px-2 py-1 mb-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    </Drawer>
  );
};

export default DataTemplateNodeConfig;
