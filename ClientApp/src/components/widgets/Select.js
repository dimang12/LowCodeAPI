const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  className = '',
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100/50 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
