/**
 * Helper functions for managing connections between diagram elements
 */
import { CONNECTION_STYLES } from '../config/diagramStyles';

/**
 * Creates an SVG path for a connection between two elements
 * @param {Object} from - Source element with x, y, width, height
 * @param {Object} to - Target element with x, y, width, height (or just x, y for mouse position)
 * @returns {string} SVG path data
 */
export const createConnectionPath = (from, to) => {
  // Calculate start point (right edge of source node)
  const fromX = from.x + from.width;
  const fromY = from.y + from.height / 2;
  
  // Calculate end point (left edge of target node, or mouse position)
  const toX = typeof to === 'object' && to.x !== undefined && !to.width ? to.x : to.x;
  const toY = typeof to === 'object' && to.y !== undefined && !to.height ? to.y : to.y + to.height / 2;

  // Create orthogonal path with rounded corners
  const midX = (fromX + toX) / 2;
  const cornerRadius = CONNECTION_STYLES.cornerRadius;
  
  // If nodes are roughly horizontally aligned
  if (Math.abs(fromY - toY) < CONNECTION_STYLES.alignmentThreshold) {
    // Simple horizontal line
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  } else {
    // Orthogonal path with rounded corners
    // Go right, then turn down/up, then go left to target
    if (toY > fromY) {
      // Target is below - use rounded corners
      return `
        M ${fromX} ${fromY}
        L ${midX - cornerRadius} ${fromY}
        Q ${midX} ${fromY} ${midX} ${fromY + cornerRadius}
        L ${midX} ${toY - cornerRadius}
        Q ${midX} ${toY} ${midX + cornerRadius} ${toY}
        L ${toX} ${toY}
      `;
    } else {
      // Target is above - use rounded corners
      return `
        M ${fromX} ${fromY}
        L ${midX - cornerRadius} ${fromY}
        Q ${midX} ${fromY} ${midX} ${fromY - cornerRadius}
        L ${midX} ${toY + cornerRadius}
        Q ${midX} ${toY} ${midX + cornerRadius} ${toY}
        L ${toX} ${toY}
      `;
    }
  }
};

/**
 * Updates connection paths in the DOM during drag operations
 * @param {Object} svg - D3 SVG selection
 * @param {Array} connections - Array of connection objects
 * @param {Array} elements - Array of element objects
 * @param {number|Object} elementIdOrPositions - Either a single element ID or an object mapping IDs to {x, y} positions
 * @param {number} newX - New X position (only used if first param is a single ID)
 * @param {number} newY - New Y position (only used if first param is a single ID)
 */
export const updateConnectionsDuringDrag = (svg, connections, elements, elementIdOrPositions, newX, newY) => {
  // Build position map for dragged elements
  const draggedPositions = (typeof elementIdOrPositions === 'object' && elementIdOrPositions !== null && !Array.isArray(elementIdOrPositions))
    ? elementIdOrPositions 
    : { [elementIdOrPositions]: { x: newX, y: newY } };
  
  const draggedIds = Object.keys(draggedPositions).map(id => parseFloat(id));
  
  connections.forEach((conn) => {
    // Only update if at least one end is being dragged
    if (draggedIds.includes(conn.from) || draggedIds.includes(conn.to)) {
      const connectionPath = svg.select(`.connection[data-from="${conn.from}"][data-to="${conn.to}"]`);
      
      if (!connectionPath.empty()) {
        // Get position for 'from' element
        const fromElement = draggedIds.includes(conn.from)
          ? { 
              x: draggedPositions[conn.from].x, 
              y: draggedPositions[conn.from].y, 
              width: elements.find(e => e.id === conn.from)?.width || 150, 
              height: elements.find(e => e.id === conn.from)?.height || 60 
            }
          : elements.find(e => e.id === conn.from);
        
        // Get position for 'to' element
        const toElement = draggedIds.includes(conn.to)
          ? { 
              x: draggedPositions[conn.to].x, 
              y: draggedPositions[conn.to].y, 
              width: elements.find(e => e.id === conn.to)?.width || 150, 
              height: elements.find(e => e.id === conn.to)?.height || 60 
            }
          : elements.find(e => e.id === conn.to);
        
        if (fromElement && toElement) {
          const pathData = createConnectionPath(fromElement, toElement);
          connectionPath.attr('d', pathData);
          
          // Update connection label position
          const connectionLabel = svg.select(`.connection-label[data-from="${conn.from}"][data-to="${conn.to}"]`);
          if (!connectionLabel.empty()) {
            const midX = (fromElement.x + fromElement.width + toElement.x) / 2;
            const midY = (fromElement.y + fromElement.height / 2 + toElement.y + toElement.height / 2) / 2;
            connectionLabel
              .attr('x', midX)
              .attr('y', midY - 5);
          }
        }
      }
    }
  });
};

/**
 * Validates if a connection can be created
 * @param {number} fromId - Source element ID
 * @param {number} toId - Target element ID
 * @param {Array} connections - Existing connections
 * @returns {Object} { valid: boolean, reason: string }
 */
export const validateConnection = (fromId, toId, connections) => {
  // No self-loops
  if (fromId === toId) {
    return { valid: false, reason: 'Cannot connect element to itself' };
  }
  
  // Check for duplicates
  const isDuplicate = connections.some(
    c => c.from === fromId && c.to === toId
  );
  
  if (isDuplicate) {
    return { valid: false, reason: 'Connection already exists' };
  }
  
  return { valid: true };
};
