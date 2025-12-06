import React from 'react';
import { styled } from '@mui/material/styles';

// Simple glass button - just background, blur, and border
const GlassContainer = styled('button')(({ theme, variant = 'default' }) => {
  const colorSchemes = {
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.3)',
      text: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.87)',
    },
    primary: {
      background: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.4)',
      text: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.87)',
    },
    success: {
      background: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.87)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.87)',
    }
  };

  const colors = colorSchemes[variant] || colorSchemes.default;

  return {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 500,
    borderRadius: '32px',
    textTransform: 'none',
    border: `1.5px solid ${colors.border}`,
    color: colors.text,
    background: colors.background,
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    
    '&:hover': {
      background: colors.background.replace(/[\d.]+\)$/, (m) => (parseFloat(m) * 1.5) + ')'),
      transform: 'translateY(-1px)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },
    
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    
    [theme.breakpoints.down('sm')]: {
      padding: '10px 24px',
      fontSize: '14px',
    },
  };
});

/**
 * LiquidGlassButton - Simple liquid glass button
 * 
 * @param {string} variant - Button variant: 'default', 'primary', 'success', 'danger'
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disable button
 * @param {React.ReactNode} startIcon - Icon before text
 * @param {React.ReactNode} endIcon - Icon after text
 * @param {React.ReactNode} children - Button content
 */
const LiquidGlassButton = ({
  children,
  variant = 'default',
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  className,
  ...props
}) => {
  return (
    <GlassContainer
      variant={variant}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span style={{ display: 'flex', marginRight: '8px' }}>{startIcon}</span>}
      {children}
      {endIcon && <span style={{ display: 'flex', marginLeft: '8px' }}>{endIcon}</span>}
    </GlassContainer>
  );
};

export default LiquidGlassButton;
