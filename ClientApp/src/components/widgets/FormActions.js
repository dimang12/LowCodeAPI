import Button from './Button';

const FormActions = ({ 
  onSave,
  onCancel,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`border-t pt-4 flex gap-3 ${className}`}>
      <Button
        onClick={onSave}
        variant="primary"
        disabled={disabled}
        className="flex-1"
      >
        {saveLabel}
      </Button>
      <Button
        onClick={onCancel}
        variant="secondary"
        disabled={disabled}
      >
        {cancelLabel}
      </Button>
    </div>
  );
};

export default FormActions;
