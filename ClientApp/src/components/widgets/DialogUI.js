import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LiquidGlassButton from './LiquidGlassButton';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

/**
 * PaperComponent for draggable dialog
 */
function PaperComponent(props) {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

/**
 * DialogUI - Custom Dialog component with glassmorphism design
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
 * @param {boolean} draggable - Enable draggable dialog (default: true)
 * @param {boolean} resizable - Enable resizable dialog (default: true)
 * @param {boolean} modal - Show backdrop and modal behavior (default: false)
 * @param {object} defaultSize - Default size for resizable { width, height }
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
  draggable = true,
  resizable = true,
  modal = false,
  defaultSize = { width: 600, height: 400 },
  ...props
}) => {
  const [size, setSize] = useState(defaultSize);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && resizable) {
      setSize(defaultSize);
    }
  }, [open]);
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  // Map color/variant to LiquidGlassButton variant
  const getButtonVariant = (action) => {
    if (action.variant === 'outlined' || action.color === 'inherit') {
      return 'default';
    }
    if (action.color === 'error' || action.color === 'danger') {
      return 'danger';
    }
    if (action.color === 'success') {
      return 'success';
    }
    return 'primary';
  };

  const dialogContent = (
    <>
      {title && (
        <DialogTitle 
          className={draggable ? "drag-handle" : ""}
          sx={{ 
            m: 0, 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: draggable ? 'move' : 'default',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {draggable && (
              <DragIndicatorIcon 
                sx={{ 
                  color: 'rgba(0, 0, 0, 0.4)',
                  fontSize: '20px'
                }} 
              />
            )}
            <Typography 
              variant="h6" 
              component="div"
              sx={{
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              {title}
            </Typography>
          </div>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent 
        dividers
        sx={{
          borderTop: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          p: 3,
          ...(resizable && { height: size.height - 200, overflow: 'auto' })
        }}
      >
        {children}
      </DialogContent>
      
      {actions.length > 0 && (
        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5,
            background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            gap: 1.5,
          }}
        >
          {actions.map((action, index) => (
            <LiquidGlassButton
              key={index}
              onClick={action.onClick}
              variant={getButtonVariant(action)}
              disabled={action.disabled || false}
              
              sx={{ 
                minWidth: '80px',
                ...(action.sx || {})
              }}
            >
              {action.label}
            </LiquidGlassButton>
          ))}
        </DialogActions>
      )}
    </>
  );

  const paperProps = {
    sx: {
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      boxShadow: `
        0 24px 64px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset,
        0 8px 16px rgba(255, 255, 255, 0.4) inset
      `,
      overflow: 'hidden',
      ...(resizable && { 
        width: size.width, 
        height: size.height,
        maxWidth: 'none',
        maxHeight: 'none',
      }),
    }
  };

  if (resizable) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth={false}
        hideBackdrop={!modal}
        disableEnforceFocus={!modal}
        PaperComponent={draggable ? PaperComponent : Paper}
        PaperProps={paperProps}
        BackdropProps={modal ? {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }
        } : undefined}
        {...props}
      >
        <Resizable
          width={size.width}
          height={size.height}
          onResize={(e, { size: newSize }) => {
            setSize(newSize);
          }}
          minConstraints={[400, 300]}
          maxConstraints={[window.innerWidth * 0.9, window.innerHeight * 0.9]}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {dialogContent}
          </div>
        </Resizable>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      hideBackdrop={!modal}
      disableEnforceFocus={!modal}
      PaperComponent={draggable ? PaperComponent : Paper}
      PaperProps={paperProps}
      BackdropProps={modal ? {
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }
      } : undefined}
      {...props}
    >
      {dialogContent}
    </Dialog>
  );
};

export default DialogUI;
