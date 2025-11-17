import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * DialogUI - Custom Dialog component built on Material-UI
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog should close
 * @param {string} title - Dialog title
 * @param {React.ReactNode} children - Dialog content
 * @param {Array} actions - Array of action buttons { label, onClick, variant, color, disabled }
 * @param {string} maxWidth - Dialog max width ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} fullWidth - If true, dialog stretches to maxWidth
 * @param {boolean} showCloseButton - Show close button in title
 * @param {boolean} disableBackdropClick - Prevent closing on backdrop click
 */
const DialogUI = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  disableBackdropClick = false,
  ...props
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...props}
    >
      {title && (
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent dividers>
        {children}
      </DialogContent>
      
      {actions.length > 0 && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
              disabled={action.disabled || false}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DialogUI;
