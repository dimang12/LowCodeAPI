import * as d3 from 'd3';
import { GRID_CONFIG, MARKER_STYLES, ZOOM_CONFIG } from '../config/diagramStyles';

/**
 * SVG setup utilities for the diagram canvas
 */

/**
 * Creates grid pattern definition
 * @param {Object} defs - D3 defs selection
 */
export const createGridPattern = (defs) => {
  const gridPattern = defs
    .append('pattern')
    .attr('id', 'grid')
    .attr('width', GRID_CONFIG.size)
    .attr('height', GRID_CONFIG.size)
    .attr('patternUnits', 'userSpaceOnUse');

  gridPattern
    .append('path')
    .attr('d', `M ${GRID_CONFIG.size} 0 L 0 0 0 ${GRID_CONFIG.size}`)
    .attr('fill', 'none')
    .attr('stroke', GRID_CONFIG.color)
    .attr('stroke-width', GRID_CONFIG.strokeWidth)
    .attr('opacity', GRID_CONFIG.opacity);
};

/**
 * Creates circle marker for connections
 * @param {Object} defs - D3 defs selection
 */
export const createCircleMarker = (defs) => {
  const marker = defs
    .append('marker')
    .attr('id', 'circlemarker')
    .attr('markerWidth', MARKER_STYLES.width)
    .attr('markerHeight', MARKER_STYLES.height)
    .attr('refX', MARKER_STYLES.refX)
    .attr('refY', MARKER_STYLES.refY)
    .attr('orient', 'auto');

  marker
    .append('circle')
    .attr('cx', MARKER_STYLES.refX)
    .attr('cy', MARKER_STYLES.refY)
    .attr('r', MARKER_STYLES.circleRadius)
    .attr('fill', MARKER_STYLES.circleFill);
};

/**
 * Applies background with grid
 * @param {Object} svg - D3 SVG selection
 */
export const applyBackgroundGrid = (svg) => {
  svg
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', GRID_CONFIG.backgroundColor)
    .attr('fill-opacity', GRID_CONFIG.backgroundOpacity);

  svg
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'url(#grid)');
};

/**
 * Sets up zoom behavior
 * @param {Object} svg - D3 SVG selection
 * @param {Object} mainGroup - Main group to transform
 * @param {Function} setZoomLevel - Callback to update zoom level
 * @param {Object} initialTransform - Initial zoom transform to restore
 * @param {Object} selectedToolRef - Ref to current selected tool
 * @returns {Object} Zoom behavior and control functions
 */
export const setupZoomBehavior = (svg, mainGroup, setZoomLevel, initialTransform, selectedToolRef) => {
  let currentScale = initialTransform ? initialTransform.k : 1;
  let isPanning = false;
  
  // Handle cursor changes when Cmd/Ctrl key is pressed
  const handleKeyDown = (event) => {
    // Show grab cursor in select mode when Cmd/Ctrl is pressed
    if ((event.metaKey || event.ctrlKey) && !isPanning && selectedToolRef?.current === 'select') {
      svg.style('cursor', 'grab');
    }
  };
  
  const handleKeyUp = (event) => {
    if ((event.key === 'Meta' || event.key === 'Control') && !isPanning) {
      svg.style('cursor', 'default');
    }
  };
  
  // Add keyboard event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  const zoom = d3.zoom()
    .scaleExtent(ZOOM_CONFIG.scaleExtent)
    .filter(function(event) {
      // Always allow wheel zoom
      if (event.type === 'wheel') return true;
      // Always allow middle mouse button drag
      if (event.type === 'mousedown' && event.button === 1) return true;
      // Allow left mouse button drag with Cmd/Ctrl key at any zoom level
      if (event.button === 0 && (event.metaKey || event.ctrlKey)) {
        if (event.type === 'mousedown') {
          isPanning = true;
          svg.style('cursor', 'grabbing');
        }
        return true;
      }
      return false;
    })
    .on('zoom', (event) => {
      mainGroup.attr('transform', event.transform);
      currentScale = event.transform.k;
      setZoomLevel(Math.round(event.transform.k * 100));
    })
    .on('end', () => {
      if (isPanning) {
        isPanning = false;
        svg.style('cursor', 'default');
      }
    });

  svg.call(zoom);
  
  // Restore initial transform if provided
  if (initialTransform && (initialTransform.k !== 1 || initialTransform.x !== 0 || initialTransform.y !== 0)) {
    svg.call(zoom.transform, initialTransform);
  }

  const zoomIn = () => {
    svg.transition().duration(ZOOM_CONFIG.transitionDuration).call(zoom.scaleBy, ZOOM_CONFIG.zoomInFactor);
  };

  const zoomOut = () => {
    svg.transition().duration(ZOOM_CONFIG.transitionDuration).call(zoom.scaleBy, ZOOM_CONFIG.zoomOutFactor);
  };

  const resetZoom = () => {
    svg.transition().duration(ZOOM_CONFIG.resetDuration).call(zoom.transform, d3.zoomIdentity);
  };

  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };

  return { zoom, zoomIn, zoomOut, resetZoom, cleanup };
};
