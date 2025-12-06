const InfoBox = ({ 
  children,
  variant = 'info', // info, success, warning, error
  className = ''
}) => {
  const variantClasses = {
    info: 'bg-blue-50/60 text-blue-800 backdrop-blur-sm',
    success: 'bg-green-50/60 text-green-800 backdrop-blur-sm',
    warning: 'bg-yellow-50/60 text-yellow-800 backdrop-blur-sm',
    error: 'bg-red-50/60 text-red-800 backdrop-blur-sm',
    purple: 'bg-purple-50/60 text-purple-800 backdrop-blur-sm'
  };
  
  return (
    <div className={`${variantClasses[variant]} p-3 rounded-md ${className}`}>
      <p className="text-sm">
        {children}
      </p>
    </div>
  );
};

export default InfoBox;
