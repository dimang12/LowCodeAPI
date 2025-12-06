/**
 * Helper functions for diagram elements
 */
import { ELEMENT_COLORS, ELEMENT_DIMENSIONS, DRAG_CONFIG } from '../config/diagramStyles';

/**
 * Gets default label for an element type
 * @param {string} type - Element type (start, stop, process, decision)
 * @returns {string} Default label
 */
export const getDefaultLabel = (type) => {
  const labels = {
    start: 'Start',
    stop: 'Stop',
    process: 'Process',
    decision: 'Decision?',
    dataTemplate: 'Data Template',
  };
  return labels[type] || type;
};

/**
 * Creates a new element object
 * @param {string} type - Element type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width (optional)
 * @param {number} height - Height (optional)
 * @returns {Object} New element object
 */
export const createNewElement = (type, x, y, width, height) => {
  const dimensions = ELEMENT_DIMENSIONS[type] || ELEMENT_DIMENSIONS.process;
  return {
    id: Date.now() + Math.random(),
    type,
    x,
    y,
    width: width || dimensions.width,
    height: height || dimensions.height,
    label: getDefaultLabel(type),
    color: type === 'process' ? ELEMENT_COLORS.process : undefined,
  };
};

/**
 * Gets element color based on type
 * @param {string} type - Element type
 * @param {string} customColor - Custom color (optional)
 * @returns {string} Color code
 */
export const getElementColor = (type, customColor) => {
  if (customColor) return customColor;
  return ELEMENT_COLORS[type] || ELEMENT_COLORS.default;
};

/**
 * Gets element shape points for polygon shapes
 * @param {string} type - Element type
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {Array|null} Array of points for polygon, or null for rect shapes
 */
export const getShapePoints = (type, width, height) => {
  if (type === 'decision') {
    return [
      [width / 2, 0],
      [width, height / 2],
      [width / 2, height],
      [0, height / 2],
    ];
  }
  return null;
};

/**
 * Calculates resize handle positions
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {Array} Array of handle position objects
 */
export const getResizeHandlePositions = (width, height) => {
  return [
    { x: 0, y: 0, cursor: 'nw-resize', name: 'nw' },
    { x: width / 2, y: 0, cursor: 'n-resize', name: 'n' },
    { x: width, y: 0, cursor: 'ne-resize', name: 'ne' },
    { x: width, y: height / 2, cursor: 'e-resize', name: 'e' },
    { x: width, y: height, cursor: 'se-resize', name: 'se' },
    { x: width / 2, y: height, cursor: 's-resize', name: 's' },
    { x: 0, y: height, cursor: 'sw-resize', name: 'sw' },
    { x: 0, y: height / 2, cursor: 'w-resize', name: 'w' }
  ];
};

/**
 * Calculates new dimensions during resize
 * @param {Object} element - Current element
 * @param {string} handleName - Handle being dragged
 * @param {number} dx - Delta X
 * @param {number} dy - Delta Y
 * @returns {Object} New dimensions and position { x, y, width, height }
 */
export const calculateResize = (element, handleName, dx, dy) => {
  let newWidth = element.width;
  let newHeight = element.height;
  let newX = element.x;
  let newY = element.y;

  // Minimum dimensions
  const MIN_WIDTH = DRAG_CONFIG.minElementWidth;
  const MIN_HEIGHT = DRAG_CONFIG.minElementHeight;

  if (handleName.includes('e')) {
    newWidth = Math.max(MIN_WIDTH, newWidth + dx);
  }
  if (handleName.includes('w')) {
    const oldWidth = newWidth;
    newWidth = Math.max(MIN_WIDTH, newWidth - dx);
    if (newWidth !== oldWidth) {
      newX = newX + dx;
    }
  }
  if (handleName.includes('s')) {
    newHeight = Math.max(MIN_HEIGHT, newHeight + dy);
  }
  if (handleName.includes('n')) {
    const oldHeight = newHeight;
    newHeight = Math.max(MIN_HEIGHT, newHeight - dy);
    if (newHeight !== oldHeight) {
      newY = newY + dy;
    }
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight };
};
