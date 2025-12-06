/**
 * Style configuration for diagram canvas
 * Centralized styling constants for consistent theming
 */

// Grid configuration
export const GRID_CONFIG = {
  size: 20,
  color: '#e5e7eb',
  strokeWidth: 0.5,
  opacity: 0.5,
  backgroundColor: '#ffffff',
  backgroundOpacity: 1
};

// Connection/line styles
export const CONNECTION_STYLES = {
  stroke: '#6b7280',
  strokeWidth: 4,
  tempStroke: '#3b82f6',
  tempStrokeWidth: 2,
  tempDashArray: '5,5',
  cornerRadius: 20,
  alignmentThreshold: 20
};

// Marker styles (connection endpoints)
export const MARKER_STYLES = {
  width: 8,
  height: 8,
  refX: 4,
  refY: 4,
  circleRadius: 2,
  circleFill: '#6b7280'
};

// Element colors by type
export const ELEMENT_COLORS = {
  start: '#10b981',
  stop: '#ef4444',
  process: '#60a5fa',
  decision: '#fbbf24',
  dataTemplate: '#a855f7',
  default: '#e5e7eb'
};

// Element stroke styles
export const ELEMENT_STROKE = {
  default: {
    color: '#000',
    width: 2
  },
  hover: {
    color: '#3b82f6',
    width: 3
  },
  selected: {
    color: '#3b82f6',
    width: 3
  },
  connecting: {
    color: '#10b981',
    width: 3
  }
};

// Border/highlight styles
export const HIGHLIGHT_STYLES = {
  padding: 5,
  borderRadius: {
    default: 5,
    rounded: 25 // for start/stop elements
  },
  hover: {
    borderColor: '#3b82f6',
    borderWidth: 3
  },
  selected: {
    borderColor: '#3b82f6',
    borderWidth: 3
  },
  connecting: {
    borderColor: '#10b981',
    borderWidth: 3
  }
};

// Resize handle styles
export const RESIZE_HANDLE_STYLES = {
  size: 8,
  fill: '#fff',
  stroke: '#3b82f6',
  strokeWidth: 2,
  borderRadius: 1
};

// Element shape styles
export const SHAPE_STYLES = {
  borderRadius: 20, // for start/stop elements
  borderRadiusDefault: 0, // for process elements
  opacity: 0.7 // opacity during drawing
};

// Text/label styles
export const TEXT_STYLES = {
  fontSize: '14px',
  fontWeight: 'bold',
  fill: '#000',
  anchor: 'middle',
  dominantBaseline: 'middle'
};

// Transition/animation settings
export const TRANSITION_SETTINGS = {
  duration: {
    short: 150,
    medium: 300,
    long: 500
  }
};

// Zoom configuration
export const ZOOM_CONFIG = {
  scaleExtent: [0.1, 4], // Min 10%, max 400%
  zoomInFactor: 1.3,
  zoomOutFactor: 0.7,
  transitionDuration: 300,
  resetDuration: 500
};

// Drag thresholds and behavior
export const DRAG_CONFIG = {
  threshold: 5, // pixels before drag starts
  minElementWidth: 50,
  minElementHeight: 30,
  minDrawWidth: 30,
  minDrawHeight: 20
};

// Cursor styles
export const CURSOR_STYLES = {
  select: {
    default: 'grab',
    dragging: 'grabbing'
  },
  connect: 'pointer',
  draw: 'crosshair',
  default: 'default'
};

// Element dimension defaults
export const ELEMENT_DIMENSIONS = {
  process: {
    width: 150,
    height: 60
  },
  decision: {
    width: 120,
    height: 80
  },
  start: {
    width: 150,
    height: 60
  },
  stop: {
    width: 150,
    height: 60
  },
  dataTemplate: {
    width: 140,
    height: 70
  }
};

// Context menu styles
export const CONTEXT_MENU_STYLES = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '4px',
  minWidth: '192px'
};

// Info panel styles
export const INFO_PANEL_STYLES = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(4px)',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '14px',
  textColor: '#374151'
};

// Z-index layers
export const Z_INDEX = {
  canvas: 0,
  connections: 1,
  elements: 2,
  tempConnection: 3,
  drawingElement: 3,
  resizeHandles: 4,
  contextMenu: 1000,
  infoPanel: 100,
  zoomControls: 100
};
