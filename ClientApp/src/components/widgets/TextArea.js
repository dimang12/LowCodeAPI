const TextArea = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  rows = 4,
  className = '',
  required = false,
  disabled = false,
  helperButton = null,
  ...props 
}) => {
  return (
    <div className={className}>
      {(label || helperButton) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {helperButton}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm disabled:bg-gray-100/50 disabled:cursor-not-allowed resize-y bg-white/60 backdrop-blur-sm"
        {...props}
      />
    </div>
  );
};

export default TextArea;
