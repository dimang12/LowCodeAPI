import * as d3 from 'd3';

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
    .attr('width', 20)
    .attr('height', 20)
    .attr('patternUnits', 'userSpaceOnUse');

  gridPattern
    .append('path')
    .attr('d', 'M 20 0 L 0 0 0 20')
    .attr('fill', 'none')
    .attr('stroke', '#e5e7eb')
    .attr('stroke-width', 0.5)
    .attr('opacity', 0.5);
};

/**
 * Creates circle marker for connections
 * @param {Object} defs - D3 defs selection
 */
export const createCircleMarker = (defs) => {
  const marker = defs
    .append('marker')
    .attr('id', 'circlemarker')
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('refX', 4)
    .attr('refY', 4)
    .attr('orient', 'auto');

  marker
    .append('circle')
    .attr('cx', 4)
    .attr('cy', 4)
    .attr('r', 2)
    .attr('fill', '#6b7280');
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
    .attr('fill', '#ffffff')
    .attr('fill-opacity', 1);

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
 * @returns {Object} Zoom behavior and control functions
 */
export const setupZoomBehavior = (svg, mainGroup, setZoomLevel) => {
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .filter(function(event) {
      if (event.type === 'wheel') return true;
      if (event.type === 'mousedown' && event.button === 1) return true;
      return false;
    })
    .on('zoom', (event) => {
      mainGroup.attr('transform', event.transform);
      setZoomLevel(Math.round(event.transform.k * 100));
    });

  svg.call(zoom);

  const zoomIn = () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
  };

  const zoomOut = () => {
    svg.transition().duration(300).call(zoom.scaleBy, 0.7);
  };

  const resetZoom = () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  };

  return { zoom, zoomIn, zoomOut, resetZoom };
};
